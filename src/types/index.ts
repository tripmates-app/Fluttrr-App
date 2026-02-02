import { Timestamp } from 'firebase/firestore';

export type AccountType = 'user' | 'business';

export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  lastUpdated?: Date | Timestamp;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'mates_only' | 'private';
  showDistance: boolean;
  showOnlineStatus: boolean;
  showLastActive: boolean;
}

export interface NotificationSettings {
  newMessages: boolean;
  eventReminders: boolean;
  newMateRequests: boolean;
  eventUpdates: boolean;
  pushEnabled: boolean;
}

export interface User {
  userId: string;
  accountType: 'user';
  email: string;
  displayName: string;
  age: number;
  gender: string;
  bio: string;
  profilePhotos: string[];
  interests: string[];
  lookingFor: string;
  location: Location;
  privacySettings: PrivacySettings;
  notificationSettings: NotificationSettings;
  mates: string[];
  mateRequests: string[];
  blockedUsers: string[];
  eventsJoined: string[];
  eventsAttended: string[];
  reviewsGiven: string[];
  verified: boolean;
  createdAt: Date | Timestamp;
  lastActive: Date | Timestamp;
  isOnline: boolean;
  pushToken?: string;
}

export interface Business {
  businessId: string;
  accountType: 'business';
  email: string;
  businessName: string;
  category: string;
  description: string;
  photos: string[];
  address: string;
  location: Location;
  phone: string;
  website?: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
  };
  businessLicense?: string;
  ein?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  subscriptionStatus: 'free';
  totalEvents: number;
  totalAttendees: number;
  averageRating: number;
  totalReviews: number;
  followers: number;
  createdAt: Date | Timestamp;
  lastActive: Date | Timestamp;
}

export interface EventRecurring {
  isRecurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  endDate?: Date | Timestamp;
}

export interface EventLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Event {
  eventId: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  startTime: Date | Timestamp;
  endTime: Date | Timestamp;
  recurring: EventRecurring;
  location: EventLocation;
  capacity?: number;
  currentAttendees: number;
  price: 'free' | '$' | '$$' | '$$$';
  priceAmount?: number;
  ageRestriction: 'none' | '18+' | '21+';
  photos: string[];
  coverPhoto: string;
  attendees: string[];
  interested: string[];
  views: number;
  groupChatId?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'canceled';
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface Chat {
  chatId: string;
  type: 'direct' | 'event_group';
  participants: string[];
  participantDetails: {
    [userId: string]: {
      name: string;
      photo: string;
      lastRead: Date | Timestamp;
    };
  };
  eventId?: string;
  eventTitle?: string;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Date | Timestamp;
  };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  isArchived?: boolean;
  isMuted?: boolean;
}

export interface Message {
  messageId: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  type: 'text' | 'image' | 'event_share';
  text?: string;
  imageUrl?: string;
  sharedEventId?: string;
  timestamp: Date | Timestamp;
  readBy: string[];
}

export interface Review {
  reviewId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  eventId: string;
  businessId: string;
  businessName: string;
  rating: number;
  text: string;
  photos: string[];
  businessResponse?: {
    text: string;
    timestamp: Date | Timestamp;
  };
  helpful: string[];
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface MateRequest {
  requestId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date | Timestamp;
  respondedAt?: Date | Timestamp;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  BusinessSignUp: undefined;
  CreateProfile: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  BusinessSignUp: undefined;
  CreateProfile: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  EventsTab: undefined;
  MatesTab: undefined;
  ChatsTab: undefined;
  ProfileTab: undefined;
};

export type BusinessTabParamList = {
  DashboardTab: undefined;
  CreateEventTab: undefined;
  MyEventsTab: undefined;
  ReviewsTab: undefined;
  BusinessSettingsTab: undefined;
};

export type HomeStackParamList = {
  Feed: undefined;
  EventDetail: { eventId: string };
  BusinessProfile: { businessId: string };
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventsMap: undefined;
  EventDetail: { eventId: string };
  Filters: undefined;
};

export type MatesStackParamList = {
  Discovery: undefined;
  MatesFilters: undefined;
  UserProfile: { userId: string };
  MateRequests: undefined;
};

export type ChatsStackParamList = {
  ChatList: undefined;
  ChatScreen: { chatId: string; chatTitle: string; chatType: 'direct' | 'event_group' };
};

export type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  MyEvents: undefined;
};

export type BusinessDashboardStackParamList = {
  Dashboard: undefined;
  EventAnalytics: { eventId: string };
};

export type BusinessEventsStackParamList = {
  BusinessEvents: undefined;
  CreateEvent: { eventId?: string };
  EventAnalytics: { eventId: string };
};
