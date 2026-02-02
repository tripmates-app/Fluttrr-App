import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Business, Review, Event } from '../types';

const BUSINESSES_COLLECTION = 'businesses';
const REVIEWS_COLLECTION = 'reviews';
const EVENTS_COLLECTION = 'events';

export const getBusinessById = async (businessId: string): Promise<Business | null> => {
  try {
    const businessDoc = await getDoc(doc(db, BUSINESSES_COLLECTION, businessId));
    if (businessDoc.exists()) {
      return businessDoc.data() as Business;
    }
    return null;
  } catch (error) {
    throw new Error('Failed to get business');
  }
};

export const updateBusinessProfile = async (
  businessId: string,
  businessData: Partial<Business>
): Promise<void> => {
  try {
    await updateDoc(doc(db, BUSINESSES_COLLECTION, businessId), {
      ...businessData,
      lastActive: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Failed to update business profile');
  }
};

export const uploadBusinessPhoto = async (
  businessId: string,
  uri: string,
  index: number
): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `businesses/${businessId}/photo_${index}_${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    throw new Error('Failed to upload photo');
  }
};

export const uploadEventPhoto = async (
  businessId: string,
  eventId: string,
  uri: string,
  index: number
): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `events/${businessId}/${eventId}/photo_${index}_${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    throw new Error('Failed to upload event photo');
  }
};

export const getBusinessDashboardStats = async (
  businessId: string
): Promise<{
  upcomingEvents: number;
  pastEvents: number;
  totalEvents: number;
  totalAttendees: number;
  averageRating: number;
  pendingReviews: number;
}> => {
  try {
    const business = await getBusinessById(businessId);
    if (!business) throw new Error('Business not found');

    // Get upcoming events count
    const upcomingQuery = query(
      collection(db, EVENTS_COLLECTION),
      where('businessId', '==', businessId),
      where('status', '==', 'upcoming')
    );
    const upcomingSnapshot = await getDocs(upcomingQuery);

    // Get past events count
    const pastQuery = query(
      collection(db, EVENTS_COLLECTION),
      where('businessId', '==', businessId),
      where('status', '==', 'completed')
    );
    const pastSnapshot = await getDocs(pastQuery);

    // Get pending reviews (reviews without response)
    const reviewsQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('businessId', '==', businessId)
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const pendingReviews = reviewsSnapshot.docs.filter(
      (doc) => !doc.data().businessResponse
    ).length;

    return {
      upcomingEvents: upcomingSnapshot.size,
      pastEvents: pastSnapshot.size,
      totalEvents: business.totalEvents,
      totalAttendees: business.totalAttendees,
      averageRating: business.averageRating,
      pendingReviews,
    };
  } catch (error) {
    throw new Error('Failed to get dashboard stats');
  }
};

export const getBusinessReviews = async (
  businessId: string,
  eventId?: string
): Promise<Review[]> => {
  try {
    let q = query(
      collection(db, REVIEWS_COLLECTION),
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc')
    );

    if (eventId) {
      q = query(q, where('eventId', '==', eventId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Review);
  } catch (error) {
    throw new Error('Failed to get reviews');
  }
};

export const respondToReview = async (
  reviewId: string,
  responseText: string
): Promise<void> => {
  try {
    const reviewQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('reviewId', '==', reviewId)
    );
    const snapshot = await getDocs(reviewQuery);

    if (snapshot.empty) throw new Error('Review not found');

    await updateDoc(snapshot.docs[0].ref, {
      businessResponse: {
        text: responseText,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Failed to respond to review');
  }
};

export const getEventAnalytics = async (
  eventId: string
): Promise<{
  event: Event | null;
  views: number;
  joins: number;
  demographics: {
    ageGroups: { [key: string]: number };
    genderDistribution: { [key: string]: number };
    topInterests: string[];
  };
  reviews: Review[];
}> => {
  try {
    const eventDoc = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
    if (!eventDoc.exists()) {
      return {
        event: null,
        views: 0,
        joins: 0,
        demographics: {
          ageGroups: {},
          genderDistribution: {},
          topInterests: [],
        },
        reviews: [],
      };
    }

    const event = eventDoc.data() as Event;

    // Get attendee demographics
    const attendeeIds = event.attendees || [];
    const ageGroups: { [key: string]: number } = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45+': 0,
    };
    const genderDistribution: { [key: string]: number } = {};
    const interestCounts: { [key: string]: number } = {};

    if (attendeeIds.length > 0) {
      // Get attendee data in chunks
      const chunks = [];
      for (let i = 0; i < attendeeIds.length; i += 10) {
        chunks.push(attendeeIds.slice(i, i + 10));
      }

      for (const chunk of chunks) {
        const usersQuery = query(
          collection(db, 'users'),
          where('userId', 'in', chunk)
        );
        const usersSnapshot = await getDocs(usersQuery);

        usersSnapshot.docs.forEach((userDoc) => {
          const userData = userDoc.data();

          // Age groups
          const age = userData.age || 0;
          if (age >= 18 && age <= 24) ageGroups['18-24']++;
          else if (age >= 25 && age <= 34) ageGroups['25-34']++;
          else if (age >= 35 && age <= 44) ageGroups['35-44']++;
          else if (age >= 45) ageGroups['45+']++;

          // Gender
          const gender = userData.gender || 'Not specified';
          genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;

          // Interests
          (userData.interests || []).forEach((interest: string) => {
            interestCounts[interest] = (interestCounts[interest] || 0) + 1;
          });
        });
      }
    }

    // Get top interests
    const topInterests = Object.entries(interestCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([interest]) => interest);

    // Get reviews for this event
    const reviewsQuery = query(
      collection(db, REVIEWS_COLLECTION),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = reviewsSnapshot.docs.map((doc) => doc.data() as Review);

    return {
      event,
      views: event.views,
      joins: event.currentAttendees,
      demographics: {
        ageGroups,
        genderDistribution,
        topInterests,
      },
      reviews,
    };
  } catch (error) {
    throw new Error('Failed to get event analytics');
  }
};

export const followBusiness = async (businessId: string, userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, BUSINESSES_COLLECTION, businessId), {
      followers: increment(1),
    });

    await updateDoc(doc(db, 'users', userId), {
      followingBusinesses: arrayUnion(businessId),
    });
  } catch (error) {
    throw new Error('Failed to follow business');
  }
};

export const unfollowBusiness = async (businessId: string, userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, BUSINESSES_COLLECTION, businessId), {
      followers: increment(-1),
    });

    await updateDoc(doc(db, 'users', userId), {
      followingBusinesses: arrayRemove(businessId),
    });
  } catch (error) {
    throw new Error('Failed to unfollow business');
  }
};
