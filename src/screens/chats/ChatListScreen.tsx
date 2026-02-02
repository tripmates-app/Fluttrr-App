import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ChatsStackParamList, Chat } from '../../types';
import { RootState } from '../../store';
import { Avatar, Loading, EmptyState } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { subscribeToChats } from '../../services/chatService';
import { setChats, setLoading } from '../../store/slices/chatsSlice';
import { formatChatListTime } from '../../utils/dateTime';

type ChatListScreenProps = {
  navigation: NativeStackNavigationProp<ChatsStackParamList, 'ChatList'>;
};

const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { chats, directChats, eventChats, isLoading } = useSelector(
    (state: RootState) => state.chats
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'direct' | 'events'>('direct');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;

    dispatch(setLoading(true));
    const unsubscribe = subscribeToChats(user.userId, (fetchedChats) => {
      dispatch(setChats(fetchedChats));
    });

    return () => unsubscribe();
  }, [user, dispatch]);

  const getOtherParticipant = (chat: Chat) => {
    if (!user) return { name: 'Unknown', photo: '' };
    const otherId = chat.participants.find((id) => id !== user.userId);
    if (otherId && chat.participantDetails?.[otherId]) {
      return chat.participantDetails[otherId];
    }
    return { name: 'Unknown', photo: '' };
  };

  const displayedChats = activeTab === 'direct' ? directChats : eventChats;

  const renderChat = ({ item }: { item: Chat }) => {
    const isEventChat = item.type === 'event_group';
    const otherUser = !isEventChat ? getOtherParticipant(item) : null;
    const hasUnread = item.lastMessage && user &&
      item.lastMessage.senderId !== user.userId &&
      item.participantDetails?.[user.userId]?.lastRead &&
      item.lastMessage.timestamp > item.participantDetails[user.userId].lastRead;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          navigation.navigate('ChatScreen', {
            chatId: item.chatId,
            chatTitle: isEventChat ? item.eventTitle || 'Event Chat' : otherUser?.name || 'Chat',
            chatType: item.type,
          })
        }
      >
        <View style={styles.avatarContainer}>
          {isEventChat ? (
            <View style={styles.eventAvatar}>
              <Ionicons name="people" size={24} color={colors.primary} />
            </View>
          ) : (
            <Avatar
              uri={otherUser?.photo}
              name={otherUser?.name}
              size="medium"
            />
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, hasUnread && styles.chatNameUnread]} numberOfLines={1}>
              {isEventChat ? item.eventTitle : otherUser?.name}
            </Text>
            {item.lastMessage?.timestamp && (
              <Text style={styles.chatTime}>
                {formatChatListTime(item.lastMessage.timestamp)}
              </Text>
            )}
          </View>
          <View style={styles.chatFooter}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {item.lastMessage?.text || 'No messages yet'}
            </Text>
            {hasUnread && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && chats.length === 0) {
    return <Loading fullScreen message="Loading chats..." />;
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'direct' && styles.tabActive]}
          onPress={() => setActiveTab('direct')}
        >
          <Text
            style={[styles.tabText, activeTab === 'direct' && styles.tabTextActive]}
          >
            Direct Messages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.tabActive]}
          onPress={() => setActiveTab('events')}
        >
          <Text
            style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}
          >
            Event Chats
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={displayedChats}
        keyExtractor={(item) => item.chatId}
        renderItem={renderChat}
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'direct' ? 'chatbubble-outline' : 'people-outline'}
            title={activeTab === 'direct' ? 'No conversations yet' : 'No event chats'}
            message={
              activeTab === 'direct'
                ? 'Connect with people to start chatting!'
                : 'Join events to chat with other attendees.'
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {}}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fontSizes.md,
    color: colors.textLight,
    fontWeight: fontWeights.medium,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  chatItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  eventAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chatName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  chatNameUnread: {
    fontWeight: fontWeights.bold,
  },
  chatTime: {
    fontSize: fontSizes.xs,
    color: colors.textLight,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: fontSizes.sm,
    color: colors.textLight,
    flex: 1,
  },
  lastMessageUnread: {
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
});

export default ChatListScreen;
