import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { Button, Input, Chip } from '../../components/common';
import { colors } from '../../constants/colors';
import { fontSizes, fontWeights } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { eventCategories, priceOptions, ageRestrictions, interests } from '../../constants/categories';
import { createEvent } from '../../services/eventService';
import { uploadEventPhoto } from '../../services/businessService';

const CreateEventScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { business } = useSelector((state: RootState) => state.auth);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600000));
  const [price, setPrice] = useState('free');
  const [priceAmount, setPriceAmount] = useState('');
  const [ageRestriction, setAgeRestriction] = useState('none');
  const [capacity, setCapacity] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && photos.length < 10) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else if (tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  const handleCreate = async () => {
    if (!business || !title || !description || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const uploadedPhotos: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const url = await uploadEventPhoto(business.businessId, 'new', photos[i], i);
        uploadedPhotos.push(url);
      }

      await createEvent({
        businessId: business.businessId,
        businessName: business.businessName,
        title,
        description,
        category,
        tags,
        startTime: startDate,
        endTime: endDate,
        recurring: { isRecurring: false },
        location: {
          name: business.businessName,
          address: business.address,
          latitude: business.location.latitude,
          longitude: business.location.longitude,
        },
        capacity: capacity ? parseInt(capacity) : undefined,
        price: price as any,
        priceAmount: price !== 'free' && priceAmount ? parseFloat(priceAmount) : undefined,
        ageRestriction: ageRestriction as any,
        photos: uploadedPhotos,
        coverPhoto: uploadedPhotos[0] || '',
      });

      Alert.alert('Success', 'Event created successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Input label="Event Title *" value={title} onChangeText={setTitle} placeholder="Enter event title" />
        <Input label="Description *" value={description} onChangeText={setDescription} placeholder="Describe your event..." multiline numberOfLines={4} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.optionsGrid}>
          {eventCategories.map(cat => (
            <Chip key={cat.id} label={cat.label} selected={category === cat.id} onPress={() => setCategory(cat.id)} size="small" />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Date & Time *</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={styles.dateText}>Start: {startDate.toLocaleString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={styles.dateText}>End: {endDate.toLocaleString()}</Text>
        </TouchableOpacity>
        {showStartPicker && <DateTimePicker value={startDate} mode="datetime" onChange={(e, d) => { setShowStartPicker(false); d && setStartDate(d); }} />}
        {showEndPicker && <DateTimePicker value={endDate} mode="datetime" onChange={(e, d) => { setShowEndPicker(false); d && setEndDate(d); }} />}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Price</Text>
        <View style={styles.optionsRow}>
          {priceOptions.map(opt => (
            <Chip key={opt.id} label={opt.label} selected={price === opt.id} onPress={() => setPrice(opt.id)} />
          ))}
        </View>
        {price !== 'free' && (
          <Input label="Price Amount ($)" value={priceAmount} onChangeText={setPriceAmount} placeholder="0.00" keyboardType="numeric" />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Age Restriction</Text>
        <View style={styles.optionsRow}>
          {ageRestrictions.map(opt => (
            <Chip key={opt.id} label={opt.label} selected={ageRestriction === opt.id} onPress={() => setAgeRestriction(opt.id)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Input label="Capacity (optional)" value={capacity} onChangeText={setCapacity} placeholder="Max attendees" keyboardType="numeric" />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Tags (up to 5)</Text>
        <View style={styles.optionsGrid}>
          {interests.slice(0, 15).map(tag => (
            <Chip key={tag} label={tag} selected={tags.includes(tag)} onPress={() => toggleTag(tag)} size="small" />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Photos (up to 10)</Text>
        <View style={styles.photosGrid}>
          {photos.map((photo, i) => (
            <View key={i} style={styles.photoSlot}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotos(photos.filter((_, idx) => idx !== i))}>
                <Ionicons name="close" size={14} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 10 && (
            <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
              <Ionicons name="add" size={24} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Button title="Create Event" onPress={handleCreate} loading={isLoading} fullWidth style={styles.createButton} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  section: { marginBottom: spacing.xl },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.semiBold, color: colors.text, marginBottom: spacing.sm },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundGray, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, gap: spacing.sm },
  dateText: { fontSize: fontSizes.md, color: colors.text },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoSlot: { width: '30%', aspectRatio: 16/9, borderRadius: borderRadius.md, overflow: 'hidden', position: 'relative' },
  photo: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  addPhoto: { width: '30%', aspectRatio: 16/9, borderRadius: borderRadius.md, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  createButton: { marginBottom: spacing.xxl },
});

export default CreateEventScreen;
