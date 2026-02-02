export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};

export const validateDisplayName = (name: string): string | null => {
  if (!name) {
    return 'Name is required';
  }

  if (name.length < 2) {
    return 'Name must be at least 2 characters';
  }

  if (name.length > 50) {
    return 'Name must be less than 50 characters';
  }

  return null;
};

export const validateAge = (age: number | string): string | null => {
  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;

  if (!ageNum || isNaN(ageNum)) {
    return 'Age is required';
  }

  if (ageNum < 18) {
    return 'You must be at least 18 years old';
  }

  if (ageNum > 120) {
    return 'Please enter a valid age';
  }

  return null;
};

export const validateBio = (bio: string): string | null => {
  if (bio && bio.length > 250) {
    return 'Bio must be less than 250 characters';
  }

  return null;
};

export const validateBusinessName = (name: string): string | null => {
  if (!name) {
    return 'Business name is required';
  }

  if (name.length < 2) {
    return 'Business name must be at least 2 characters';
  }

  if (name.length > 100) {
    return 'Business name must be less than 100 characters';
  }

  return null;
};

export const validateBusinessDescription = (description: string): string | null => {
  if (!description) {
    return 'Description is required';
  }

  if (description.length > 500) {
    return 'Description must be less than 500 characters';
  }

  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) {
    return null; // Phone is optional
  }

  const phoneRegex = /^[\d\s\-+()]+$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }

  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) {
    return 'Phone number must have at least 10 digits';
  }

  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!url) {
    return null; // URL is optional
  }

  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

export const validateEventTitle = (title: string): string | null => {
  if (!title) {
    return 'Event title is required';
  }

  if (title.length < 3) {
    return 'Event title must be at least 3 characters';
  }

  if (title.length > 100) {
    return 'Event title must be less than 100 characters';
  }

  return null;
};

export const validateEventDescription = (description: string): string | null => {
  if (!description) {
    return 'Event description is required';
  }

  if (description.length < 10) {
    return 'Event description must be at least 10 characters';
  }

  if (description.length > 2000) {
    return 'Event description must be less than 2000 characters';
  }

  return null;
};

export const validateAddress = (address: string): string | null => {
  if (!address) {
    return 'Address is required';
  }

  if (address.length < 5) {
    return 'Please enter a complete address';
  }

  return null;
};
