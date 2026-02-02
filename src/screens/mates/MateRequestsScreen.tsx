import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { MatesStackParamList, MateRequest } from '../../types';
import { RootState } from '../../store';
import { Avatar, Loading, EmptyState, Button } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { getMateRequests, respondToMateRequest } from '../../services/userService';
import { setReceivedRequests, setSentRequests, removeReceivedRequest } from '../../store/slices/usersSlice';
import { formatTimeAgo } from '../../utils/dateTime';

type Props = {
  navigation: NativeStackNavigationProp<MatesStackParamList, 'MateRequests'>;
};

const MateRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { receivedRequests, sentRequests } = useSelector((state: RootState) => state.users);
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    try {
      const [received, sent] = await Promise.all([
        getMateRequests(user.userId, 'received'),
        getMateRequests(user.userId, 'sent'),
      ]);
      dispatch(setReceivedRequests(received));
      dispatch(setSentRequests(sent));
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (requestId: string, response: 'accepted' | 'rejected') => {
    try {
      await respondToMateRequest(requestId, response);
      dispatch(removeReceivedRequest(requestId));
    } catch (err) {
      console.error('Failed to respond:', err);
    }
  };

  const renderRequest = ({ item }: { item: MateRequest }) => (
    <View style={styles.requestItem}>
      <Avatar uri={item.senderPhoto} name={item.senderName} size="medium" />
      <View style={styles.requestContent}>
        <Text style={styles.requestName}>{item.senderName}</Text>
        {item.message && <Text style={styles.requestMessage}>{item.message}</Text>}
        <Text style={styles.requestTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
      {activeTab === 'received' && (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleResponse(item.requestId, 'accepted')}
          >
            <Ionicons name="checkmark" size={20} color={colors.textWhite} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleResponse(item.requestId, 'rejected')}
          >
            <Ionicons name="close" size={20} color={colors.textWhite} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isLoading) return <Loading fullScreen />;

  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>
            Received ({receivedRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>
            Sent ({sentRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.requestId}
        renderItem={renderRequest}
        ListEmptyComponent={
          <EmptyState
            icon="person-add-outline"
            title={activeTab === 'received' ? 'No pending requests' : 'No sent requests'}
            message={activeTab === 'received' ? 'When someone wants to connect, you will see them here.' : 'Send requests to connect with new people.'}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: fontSizes.md, color: colors.textLight },
  tabTextActive: { color: colors.primary, fontWeight: fontWeights.semiBold },
  requestItem: { flexDirection: 'row', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  requestContent: { flex: 1, marginLeft: spacing.md },
  requestName: { fontSize: fontSizes.md, fontWeight: fontWeights.semiBold, color: colors.text },
  requestMessage: { fontSize: fontSizes.sm, color: colors.textLight, marginTop: 2 },
  requestTime: { fontSize: fontSizes.xs, color: colors.textLight, marginTop: spacing.xs },
  requestActions: { flexDirection: 'row', gap: spacing.sm },
  acceptButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  rejectButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
});

export default MateRequestsScreen;
