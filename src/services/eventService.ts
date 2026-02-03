import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Event } from '../types';
import { calculateDistance } from '../utils/location';

const EVENTS_COLLECTION = 'events';
const PAGE_SIZE = 20;

export const createEvent = async (eventData: Omit<Event, 'eventId' | 'createdAt' | 'updatedAt' | 'views' | 'currentAttendees' | 'attendees' | 'interested' | 'status'>): Promise<string> => {
  try {
    const eventRef = doc(collection(db, EVENTS_COLLECTION));
    const event: Event = {
      ...eventData,
      eventId: eventRef.id,
      views: 0,
      currentAttendees: 0,
      attendees: [],
      interested: [],
      status: 'upcoming',
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };

    await setDoc(eventRef, event);

    // Create group chat for the event
    const chatRef = doc(collection(db, 'chats'));
    await setDoc(chatRef, {
      chatId: chatRef.id,
      type: 'event_group',
      participants: [],
      participantDetails: {},
      eventId: eventRef.id,
      eventTitle: eventData.title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update event with group chat ID
    await updateDoc(eventRef, { groupChatId: chatRef.id });

    return eventRef.id;
  } catch (error) {
    throw new Error('Failed to create event');
  }
};

export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Failed to update event');
  }
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
  } catch (error) {
    throw new Error('Failed to delete event');
  }
};

export const getEvent = async (eventId: string): Promise<Event | null> => {
  try {
    const eventDoc = await getDoc(doc(db, EVENTS_COLLECTION, eventId));
    if (eventDoc.exists()) {
      // Increment view count
      await updateDoc(doc(db, EVENTS_COLLECTION, eventId), {
        views: increment(1),
      });
      return eventDoc.data() as Event;
    }
    return null;
  } catch (error) {
    throw new Error('Failed to get event');
  }
};

export const getEvents = async (
  filters?: {
    category?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    price?: string;
    ageRestriction?: string;
    businessId?: string;
  },
  sortBy: 'date' | 'distance' | 'popularity' = 'date',
  lastDoc?: DocumentSnapshot,
  userLocation?: { latitude: number; longitude: number }
): Promise<{ events: Event[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(
      collection(db, EVENTS_COLLECTION),
      where('status', 'in', ['upcoming', 'ongoing']),
      orderBy('startTime', 'asc'),
      limit(PAGE_SIZE)
    );

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters?.businessId) {
      q = query(
        collection(db, EVENTS_COLLECTION),
        where('businessId', '==', filters.businessId),
        orderBy('startTime', 'desc'),
        limit(PAGE_SIZE)
      );
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    let events = snapshot.docs.map((doc) => doc.data() as Event);

    // Client-side filtering for additional criteria
    if (filters?.price) {
      events = events.filter((e) => e.price === filters.price);
    }

    if (filters?.ageRestriction) {
      events = events.filter((e) => e.ageRestriction === filters.ageRestriction);
    }

    if (filters?.startDate) {
      const filterStartDate = typeof filters.startDate === 'string' ? new Date(filters.startDate) : filters.startDate;
      events = events.filter((e) => {
        const eventStart = e.startTime instanceof Timestamp ? e.startTime.toDate() : e.startTime;
        return eventStart >= filterStartDate;
      });
    }

    if (filters?.endDate) {
      const filterEndDate = typeof filters.endDate === 'string' ? new Date(filters.endDate) : filters.endDate;
      events = events.filter((e) => {
        const eventStart = e.startTime instanceof Timestamp ? e.startTime.toDate() : e.startTime;
        return eventStart <= filterEndDate;
      });
    }

    // Sort by distance if user location provided
    if (sortBy === 'distance' && userLocation) {
      events.sort((a, b) => {
        const distA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.location.latitude,
          a.location.longitude
        );
        const distB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.location.latitude,
          b.location.longitude
        );
        return distA - distB;
      });
    } else if (sortBy === 'popularity') {
      events.sort((a, b) => b.currentAttendees - a.currentAttendees);
    }

    const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { events, lastDoc: newLastDoc };
  } catch (error) {
    throw new Error('Failed to get events');
  }
};

export const getEventsByIds = async (eventIds: string[]): Promise<Event[]> => {
  try {
    if (eventIds.length === 0) return [];

    const events: Event[] = [];
    // Firestore 'in' query has a limit of 10 items
    const chunks = [];
    for (let i = 0; i < eventIds.length; i += 10) {
      chunks.push(eventIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const q = query(
        collection(db, EVENTS_COLLECTION),
        where('eventId', 'in', chunk)
      );
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => events.push(doc.data() as Event));
    }

    return events;
  } catch (error) {
    throw new Error('Failed to get events');
  }
};

export const joinEvent = async (eventId: string, userId: string, userName: string, userPhoto: string): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      attendees: arrayUnion(userId),
      currentAttendees: increment(1),
    });

    // Add user to event group chat
    const eventDoc = await getDoc(eventRef);
    if (eventDoc.exists()) {
      const event = eventDoc.data() as Event;
      if (event.groupChatId) {
        const chatRef = doc(db, 'chats', event.groupChatId);
        await updateDoc(chatRef, {
          participants: arrayUnion(userId),
          [`participantDetails.${userId}`]: {
            name: userName,
            photo: userPhoto,
            lastRead: serverTimestamp(),
          },
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Update user's joined events
    await updateDoc(doc(db, 'users', userId), {
      eventsJoined: arrayUnion(eventId),
    });
  } catch (error) {
    throw new Error('Failed to join event');
  }
};

export const leaveEvent = async (eventId: string, userId: string): Promise<void> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      attendees: arrayRemove(userId),
      currentAttendees: increment(-1),
    });

    // Remove user from event group chat
    const eventDoc = await getDoc(eventRef);
    if (eventDoc.exists()) {
      const event = eventDoc.data() as Event;
      if (event.groupChatId) {
        const chatRef = doc(db, 'chats', event.groupChatId);
        await updateDoc(chatRef, {
          participants: arrayRemove(userId),
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Update user's joined events
    await updateDoc(doc(db, 'users', userId), {
      eventsJoined: arrayRemove(eventId),
    });
  } catch (error) {
    throw new Error('Failed to leave event');
  }
};

export const markInterested = async (eventId: string, userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, EVENTS_COLLECTION, eventId), {
      interested: arrayUnion(userId),
    });
  } catch (error) {
    throw new Error('Failed to mark interested');
  }
};

export const removeInterested = async (eventId: string, userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, EVENTS_COLLECTION, eventId), {
      interested: arrayRemove(userId),
    });
  } catch (error) {
    throw new Error('Failed to remove interested');
  }
};

export const searchEvents = async (searchTerm: string): Promise<Event[]> => {
  try {
    // Note: For production, consider using Algolia or similar for full-text search
    // This is a basic implementation that searches by title
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('status', 'in', ['upcoming', 'ongoing']),
      orderBy('startTime', 'asc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const events = snapshot.docs.map((doc) => doc.data() as Event);

    // Client-side filtering for search
    const searchLower = searchTerm.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower) ||
        e.businessName.toLowerCase().includes(searchLower) ||
        e.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  } catch (error) {
    throw new Error('Failed to search events');
  }
};

export const getBusinessEvents = async (
  businessId: string,
  status?: 'upcoming' | 'ongoing' | 'completed' | 'all'
): Promise<Event[]> => {
  try {
    let q = query(
      collection(db, EVENTS_COLLECTION),
      where('businessId', '==', businessId),
      orderBy('startTime', 'desc')
    );

    if (status && status !== 'all') {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Event);
  } catch (error) {
    throw new Error('Failed to get business events');
  }
};
