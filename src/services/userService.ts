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
  startAfter,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  DocumentSnapshot,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { User, MateRequest } from '../types';
import { calculateDistance } from '../utils/location';

const USERS_COLLECTION = 'users';
const MATE_REQUESTS_COLLECTION = 'mateRequests';
const PAGE_SIZE = 20;

export const updateUserProfile = async (
  userId: string,
  userData: Partial<User>
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...userData,
      lastActive: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Failed to update profile');
  }
};

export const uploadProfilePhoto = async (
  userId: string,
  uri: string,
  index: number
): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `users/${userId}/profile_${index}_${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    throw new Error('Failed to upload photo');
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    throw new Error('Failed to get user');
  }
};

export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
  try {
    if (userIds.length === 0) return [];

    const users: User[] = [];
    const chunks = [];
    for (let i = 0; i < userIds.length; i += 10) {
      chunks.push(userIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('userId', 'in', chunk)
      );
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => users.push(doc.data() as User));
    }

    return users;
  } catch (error) {
    throw new Error('Failed to get users');
  }
};

export const discoverMates = async (
  currentUserId: string,
  filters: {
    maxDistance?: number;
    minAge?: number;
    maxAge?: number;
    gender?: string;
    interests?: string[];
    lookingFor?: string;
    hasCommonEvents?: boolean;
  },
  userLocation: { latitude: number; longitude: number },
  lastDoc?: DocumentSnapshot
): Promise<{ users: User[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    // Get current user to exclude mates and blocked users
    const currentUser = await getUserById(currentUserId);
    if (!currentUser) throw new Error('User not found');

    let q = query(
      collection(db, USERS_COLLECTION),
      where('accountType', '==', 'user'),
      where('privacySettings.profileVisibility', '!=', 'private'),
      limit(PAGE_SIZE * 2) // Get more to account for filtering
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    let users = snapshot.docs
      .map((doc) => doc.data() as User)
      .filter((u) => u.userId !== currentUserId);

    // Filter out blocked users and existing mates
    users = users.filter(
      (u) =>
        !currentUser.blockedUsers.includes(u.userId) &&
        !currentUser.mates.includes(u.userId) &&
        !u.blockedUsers.includes(currentUserId)
    );

    // Apply filters
    if (filters.gender && filters.gender !== 'all') {
      users = users.filter((u) => u.gender === filters.gender);
    }

    if (filters.minAge) {
      users = users.filter((u) => u.age >= filters.minAge!);
    }

    if (filters.maxAge) {
      users = users.filter((u) => u.age <= filters.maxAge!);
    }

    if (filters.lookingFor) {
      users = users.filter((u) => u.lookingFor === filters.lookingFor);
    }

    if (filters.interests && filters.interests.length > 0) {
      users = users.filter((u) =>
        filters.interests!.some((interest) => u.interests.includes(interest))
      );
    }

    // Filter and sort by distance
    if (filters.maxDistance) {
      users = users.filter((u) => {
        if (!u.location?.latitude || !u.location?.longitude) return false;
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          u.location.latitude,
          u.location.longitude
        );
        return distance <= filters.maxDistance!;
      });
    }

    // Sort by distance
    users.sort((a, b) => {
      const distA = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.location?.latitude || 0,
        a.location?.longitude || 0
      );
      const distB = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.location?.latitude || 0,
        b.location?.longitude || 0
      );
      return distA - distB;
    });

    // Limit results
    users = users.slice(0, PAGE_SIZE);

    const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { users, lastDoc: newLastDoc };
  } catch (error) {
    throw new Error('Failed to discover mates');
  }
};

export const sendMateRequest = async (
  senderId: string,
  receiverId: string,
  message?: string
): Promise<void> => {
  try {
    const sender = await getUserById(senderId);
    if (!sender) throw new Error('Sender not found');

    // Check if request already exists
    const existingRequest = query(
      collection(db, MATE_REQUESTS_COLLECTION),
      where('senderId', '==', senderId),
      where('receiverId', '==', receiverId),
      where('status', '==', 'pending')
    );
    const existingSnapshot = await getDocs(existingRequest);
    if (!existingSnapshot.empty) {
      throw new Error('Request already sent');
    }

    // Create mate request
    const requestRef = doc(collection(db, MATE_REQUESTS_COLLECTION));
    const mateRequest: MateRequest = {
      requestId: requestRef.id,
      senderId,
      senderName: sender.displayName,
      senderPhoto: sender.profilePhotos[0] || '',
      receiverId,
      status: 'pending',
      message,
      createdAt: serverTimestamp() as any,
    };

    await addDoc(collection(db, MATE_REQUESTS_COLLECTION), mateRequest);

    // Update receiver's mate requests
    await updateDoc(doc(db, USERS_COLLECTION, receiverId), {
      mateRequests: arrayUnion(requestRef.id),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send mate request');
  }
};

export const getMateRequests = async (
  userId: string,
  type: 'received' | 'sent'
): Promise<MateRequest[]> => {
  try {
    const field = type === 'received' ? 'receiverId' : 'senderId';
    const q = query(
      collection(db, MATE_REQUESTS_COLLECTION),
      where(field, '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as MateRequest);
  } catch (error) {
    throw new Error('Failed to get mate requests');
  }
};

export const respondToMateRequest = async (
  requestId: string,
  response: 'accepted' | 'rejected'
): Promise<void> => {
  try {
    // Find the request document
    const q = query(
      collection(db, MATE_REQUESTS_COLLECTION),
      where('requestId', '==', requestId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) throw new Error('Request not found');

    const requestDoc = snapshot.docs[0];
    const request = requestDoc.data() as MateRequest;

    await updateDoc(requestDoc.ref, {
      status: response,
      respondedAt: serverTimestamp(),
    });

    if (response === 'accepted') {
      // Add each other as mates
      await updateDoc(doc(db, USERS_COLLECTION, request.senderId), {
        mates: arrayUnion(request.receiverId),
      });
      await updateDoc(doc(db, USERS_COLLECTION, request.receiverId), {
        mates: arrayUnion(request.senderId),
        mateRequests: arrayRemove(requestId),
      });

      // Create direct message chat
      const chatRef = doc(collection(db, 'chats'));
      const sender = await getUserById(request.senderId);
      const receiver = await getUserById(request.receiverId);

      if (sender && receiver) {
        await addDoc(collection(db, 'chats'), {
          chatId: chatRef.id,
          type: 'direct',
          participants: [request.senderId, request.receiverId],
          participantDetails: {
            [request.senderId]: {
              name: sender.displayName,
              photo: sender.profilePhotos[0] || '',
              lastRead: serverTimestamp(),
            },
            [request.receiverId]: {
              name: receiver.displayName,
              photo: receiver.profilePhotos[0] || '',
              lastRead: serverTimestamp(),
            },
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      // Just remove from pending requests
      await updateDoc(doc(db, USERS_COLLECTION, request.receiverId), {
        mateRequests: arrayRemove(requestId),
      });
    }
  } catch (error) {
    throw new Error('Failed to respond to mate request');
  }
};

export const blockUser = async (userId: string, blockedUserId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      blockedUsers: arrayUnion(blockedUserId),
      mates: arrayRemove(blockedUserId),
    });

    // Also remove from the other user's mates
    await updateDoc(doc(db, USERS_COLLECTION, blockedUserId), {
      mates: arrayRemove(userId),
    });
  } catch (error) {
    throw new Error('Failed to block user');
  }
};

export const unblockUser = async (userId: string, blockedUserId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      blockedUsers: arrayRemove(blockedUserId),
    });
  } catch (error) {
    throw new Error('Failed to unblock user');
  }
};

export const updateUserLocation = async (
  userId: string,
  location: { latitude: number; longitude: number; city?: string; state?: string }
): Promise<void> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      location: {
        ...location,
        lastUpdated: serverTimestamp(),
      },
    });
  } catch (error) {
    throw new Error('Failed to update location');
  }
};
