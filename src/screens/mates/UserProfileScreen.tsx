import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MatesStackParamList, User } from '../../types';
import { Loading, Button, Chip } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { getUserById } from '../../services/userService';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<MatesStackParamList, 'UserProfile'>;
  route: RouteProp<MatesStackParamList, 'UserProfile'>;
};

const UserProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const fetchedUser = await getUserById(userId);
      setUser(fetchedUser);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading fullScreen />;
  if (!user) return <View style={styles.container}><Text>User not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      {user.profilePhotos[0] && (
        <Image source={{ uri: user.profilePhotos[0] }} style={styles.photo} />
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{user.displayName}, {user.age}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
        <View style={styles.interests}>
          {user.interests.map((interest) => (
            <Chip key={interest} label={interest} size="small" />
          ))}
        </View>
        <Button title="Send Connection Request" onPress={() => {}} fullWidth />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  photo: { width, height: 400, backgroundColor: colors.backgroundGray },
  content: { padding: spacing.md },
  name: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, color: colors.text },
  bio: { fontSize: fontSizes.md, color: colors.textLight, marginTop: spacing.sm },
  interests: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.md },
});

export default UserProfileScreen;
