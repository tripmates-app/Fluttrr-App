import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  DocumentSnapshot,
  Unsubscribe,
  arrayUnion,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Chat, Message } from '../types';

const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';
const PAGE_SIZE = 50;

export const getChats = async (
  userId: string,
  type?: 'direct' | 'event_group'
): Promise<Chat[]> => {
  try {
    let q = query(
      collection(db, CHATS_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    if (type) {
      q = query(q, where('type', '==', type));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as Chat);
  } catch (error) {
    throw new Error('Failed to get chats');
  }
};

export const subscribeToChats = (
  userId: string,
  callback: (chats: Chat[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, CHATS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => doc.data() as Chat);
    callback(chats);
  });
};

export const getChatById = async (chatId: string): Promise<Chat | null> => {
  try {
    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId));
    if (chatDoc.exists()) {
      return chatDoc.data() as Chat;
    }
    return null;
  } catch (error) {
    throw new Error('Failed to get chat');
  }
};

export const getOrCreateDirectChat = async (
  userId1: string,
  userId2: string,
  user1Details: { name: string; photo: string },
  user2Details: { name: string; photo: string }
): Promise<string> => {
  try {
    // Check if chat already exists
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('type', '==', 'direct'),
      where('participants', 'array-contains', userId1)
    );

    const snapshot = await getDocs(q);
    const existingChat = snapshot.docs.find((doc) => {
      const chat = doc.data() as Chat;
      return chat.participants.includes(userId2);
    });

    if (existingChat) {
      return existingChat.id;
    }

    // Create new chat
    const chatRef = await addDoc(collection(db, CHATS_COLLECTION), {
      type: 'direct',
      participants: [userId1, userId2],
      participantDetails: {
        [userId1]: {
          name: user1Details.name,
          photo: user1Details.photo,
          lastRead: serverTimestamp(),
        },
        [userId2]: {
          name: user2Details.name,
          photo: user2Details.photo,
          lastRead: serverTimestamp(),
        },
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update with chatId
    await updateDoc(chatRef, { chatId: chatRef.id });

    return chatRef.id;
  } catch (error) {
    throw new Error('Failed to create chat');
  }
};

export const getMessages = async (
  chatId: string,
  lastDoc?: DocumentSnapshot
): Promise<{ messages: Message[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(
      collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(PAGE_SIZE)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map((doc) => doc.data() as Message);
    const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { messages, lastDoc: newLastDoc };
  } catch (error) {
    throw new Error('Failed to get messages');
  }
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(PAGE_SIZE)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => doc.data() as Message);
    callback(messages);
  });
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderName: string,
  senderPhoto: string,
  text: string,
  type: 'text' | 'image' | 'event_share' = 'text',
  imageUrl?: string,
  sharedEventId?: string
): Promise<void> => {
  try {
    const messageRef = doc(collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION));
    const message: Message = {
      messageId: messageRef.id,
      chatId,
      senderId,
      senderName,
      senderPhoto,
      type,
      text,
      imageUrl,
      sharedEventId,
      timestamp: serverTimestamp() as any,
      readBy: [senderId],
    };

    await addDoc(collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION), message);

    // Update chat's last message
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
      lastMessage: {
        text: type === 'image' ? 'Sent an image' : text,
        senderId,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Failed to send message');
  }
};

export const sendImageMessage = async (
  chatId: string,
  senderId: string,
  senderName: string,
  senderPhoto: string,
  imageUri: string
): Promise<void> => {
  try {
    // Upload image
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `chats/${chatId}/${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(storageRef);

    // Send message
    await sendMessage(
      chatId,
      senderId,
      senderName,
      senderPhoto,
      '',
      'image',
      imageUrl
    );
  } catch (error) {
    throw new Error('Failed to send image');
  }
};

export const markMessagesAsRead = async (
  chatId: string,
  userId: string
): Promise<void> => {
  try {
    // Update participant's lastRead
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
      [`participantDetails.${userId}.lastRead`]: serverTimestamp(),
    });

    // Mark unread messages as read
    const q = query(
      collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION),
      where('readBy', 'not-in', [[userId]]),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map((msgDoc) => {
      const message = msgDoc.data() as Message;
      if (!message.readBy.includes(userId)) {
        return updateDoc(msgDoc.ref, {
          readBy: arrayUnion(userId),
        });
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
  } catch (error) {
    // Silently fail - not critical
    console.error('Failed to mark messages as read:', error);
  }
};

export const muteChat = async (chatId: string, userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
      [`mutedBy.${userId}`]: true,
    });
  } catch (error) {
    throw new Error('Failed to mute chat');
  }
};

export const unmuteChat = async (chatId: string, userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
      [`mutedBy.${userId}`]: false,
    });
  } catch (error) {
    throw new Error('Failed to unmute chat');
  }
};

export const archiveChat = async (chatId: string, userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
      [`archivedBy.${userId}`]: true,
    });
  } catch (error) {
    throw new Error('Failed to archive chat');
  }
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const chats = await getChats(userId);
    let totalUnread = 0;

    for (const chat of chats) {
      const lastRead = chat.participantDetails?.[userId]?.lastRead;
      if (chat.lastMessage && lastRead) {
        const lastMessageTime = chat.lastMessage.timestamp;
        if (lastMessageTime > lastRead && chat.lastMessage.senderId !== userId) {
          totalUnread++;
        }
      }
    }

    return totalUnread;
  } catch (error) {
    return 0;
  }
};

export const setTypingIndicator = async (
  chatId: string,
  userId: string,
  isTyping: boolean
): Promise<void> => {
  try {
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
      [`typingUsers.${userId}`]: isTyping ? serverTimestamp() : null,
    });
  } catch (error) {
    // Silently fail
  }
};
