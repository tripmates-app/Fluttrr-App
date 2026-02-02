import * as Location from 'expo-location';

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // Haversine formula to calculate distance in miles
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const formatDistance = (distance: number): string => {
  if (distance < 0.1) {
    return 'Nearby';
  } else if (distance < 1) {
    return `${(distance * 5280).toFixed(0)} ft`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)} mi`;
  } else {
    return `${Math.round(distance)} mi`;
  }
};

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    return false;
  }
};

export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    return null;
  }
};

export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<{
  city: string;
  state: string;
  address: string;
} | null> => {
  try {
    const [result] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (result) {
      return {
        city: result.city || '',
        state: result.region || '',
        address: [
          result.streetNumber,
          result.street,
          result.city,
          result.region,
          result.postalCode,
        ]
          .filter(Boolean)
          .join(', '),
      };
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const getCoordinatesFromAddress = async (
  address: string
): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  try {
    const results = await Location.geocodeAsync(address);

    if (results.length > 0) {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
};

// Kansas City, MO coordinates as default
export const DEFAULT_LOCATION = {
  latitude: 39.0997,
  longitude: -94.5786,
  city: 'Kansas City',
  state: 'MO',
};
