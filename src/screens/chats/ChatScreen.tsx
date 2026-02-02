import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ChatsStackParamList, Message } from '../../types';
import { RootState } from '../../store';
import { Avatar, Loading } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import {
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
} from '../../services/chatService';
import { setMessages, addMessage } from '../../store/slices/chatsSlice';
import { formatMessageTime } from '../../utils/dateTime';

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<ChatsStackParamList, 'ChatScreen'>;
  route: RouteProp<ChatsStackParamList, 'ChatScreen'>;
};

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { chatId, chatTitle, chatType } = route.params;
  const dispatch = useDispatch();
  const { messages: allMessages } = useSelector((state: RootState) => state.chats);
  const { user } = useSelector((state: RootState) => state.auth);

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const messages = allMessages[chatId] || [];

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToMessages(chatId, (fetchedMessages) => {
      dispatch(setMessages({ chatId, messages: fetchedMessages }));
      setIsLoading(false);
    });

    // Mark messages as read
    markMessagesAsRead(chatId, user.userId);

    return () => unsubscribe();
  }, [chatId, user, dispatch]);

  const handleSend = async () => {
    if (!messageText.trim() || !user || isSending) return;

    const text = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      await sendMessage(
        chatId,
        user.userId,
        user.displayName,
        user.profilePhotos[0] || '',
        text
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessageText(text); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId === user?.userId;
    const showAvatar =
      !isOwn &&
      chatType === 'event_group' &&
      (index === messages.length - 1 ||
        messages[index + 1]?.senderId !== item.senderId);

    return (
      <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
        {showAvatar && chatType === 'event_group' && (
          <Avatar
            uri={item.senderPhoto}
            name={item.senderName}
            size="small"
            style={styles.messageAvatar}
          />
        )}
        {!showAvatar && chatType === 'event_group' && !isOwn && (
          <View style={styles.avatarPlaceholder} />
        )}

        <View
          style={[
            styles.messageBubble,
            isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
          ]}
        >
          {chatType === 'event_group' && !isOwn && showAvatar && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
            {formatMessageTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading messages..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Event Info Banner (for event chats) */}
      {chatType === 'event_group' && (
        <View style={styles.eventBanner}>
          <Ionicons name="calendar" size={16} color={colors.primary} />
          <Text style={styles.eventBannerText} numberOfLines={1}>
            {chatTitle}
          </Text>
        </View>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.messageId}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No messages yet. Say hello!
            </Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textLight}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!messageText.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!messageText.trim() || isSending}
        >
          <Ionicons
            name="send"
            size={20}
            color={messageText.trim() ? colors.textWhite : colors.textLight}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  eventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primaryLight + '20',
    gap: spacing.sm,
  },
  eventBannerText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textLight,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'flex-end',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    width: 32,
    marginRight: spacing.sm,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  messageBubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  messageBubbleOther: {
    backgroundColor: colors.backgroundGray,
    borderBottomLeftRadius: borderRadius.sm,
  },
  senderName: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: colors.textWhite,
  },
  messageTime: {
    fontSize: fontSizes.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  messageTimeOwn: {
    color: colors.textWhite + '80',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.backgroundGray,
  },
});

export default ChatScreen;
