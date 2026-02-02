import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, Business, PrivacySettings, NotificationSettings } from '../types';

const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'public',
  showDistance: true,
  showOnlineStatus: true,
  showLastActive: true,
};

const defaultNotificationSettings: NotificationSettings = {
  newMessages: true,
  eventReminders: true,
  newMateRequests: true,
  eventUpdates: true,
  pushEnabled: true,
};

export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (userId) {
      await updateDoc(doc(db, 'users', userId), {
        isOnline: false,
        lastActive: serverTimestamp(),
      });
    }
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error('Failed to sign out');
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const createUserProfile = async (
  userId: string,
  userData: Partial<User>
): Promise<void> => {
  try {
    const userDoc: User = {
      userId,
      accountType: 'user',
      email: userData.email || '',
      displayName: userData.displayName || '',
      age: userData.age || 0,
      gender: userData.gender || '',
      bio: userData.bio || '',
      profilePhotos: userData.profilePhotos || [],
      interests: userData.interests || [],
      lookingFor: userData.lookingFor || 'open_to_all',
      location: userData.location || {
        latitude: 0,
        longitude: 0,
        city: '',
        state: '',
      },
      privacySettings: userData.privacySettings || defaultPrivacySettings,
      notificationSettings: userData.notificationSettings || defaultNotificationSettings,
      mates: [],
      mateRequests: [],
      blockedUsers: [],
      eventsJoined: [],
      eventsAttended: [],
      reviewsGiven: [],
      verified: false,
      createdAt: serverTimestamp() as any,
      lastActive: serverTimestamp() as any,
      isOnline: true,
    };

    await setDoc(doc(db, 'users', userId), userDoc);
  } catch (error: any) {
    throw new Error('Failed to create user profile');
  }
};

export const createBusinessProfile = async (
  businessId: string,
  businessData: Partial<Business>
): Promise<void> => {
  try {
    const businessDoc: Business = {
      businessId,
      accountType: 'business',
      email: businessData.email || '',
      businessName: businessData.businessName || '',
      category: businessData.category || '',
      description: businessData.description || '',
      photos: businessData.photos || [],
      address: businessData.address || '',
      location: businessData.location || {
        latitude: 0,
        longitude: 0,
      },
      phone: businessData.phone || '',
      website: businessData.website || '',
      socialLinks: businessData.socialLinks || {},
      businessLicense: businessData.businessLicense || '',
      ein: businessData.ein || '',
      verificationStatus: 'pending',
      subscriptionStatus: 'free',
      totalEvents: 0,
      totalAttendees: 0,
      averageRating: 0,
      totalReviews: 0,
      followers: 0,
      createdAt: serverTimestamp() as any,
      lastActive: serverTimestamp() as any,
    };

    await setDoc(doc(db, 'businesses', businessId), businessDoc);
  } catch (error: any) {
    throw new Error('Failed to create business profile');
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getBusinessProfile = async (businessId: string): Promise<Business | null> => {
  try {
    const businessDoc = await getDoc(doc(db, 'businesses', businessId));
    if (businessDoc.exists()) {
      return businessDoc.data() as Business;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const checkAccountType = async (
  userId: string
): Promise<'user' | 'business' | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return 'user';
    }

    const businessDoc = await getDoc(doc(db, 'businesses', userId));
    if (businessDoc.exists()) {
      return 'business';
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const updateUserOnlineStatus = async (
  userId: string,
  isOnline: boolean
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      isOnline,
      lastActive: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to update online status:', error);
  }
};

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
};
