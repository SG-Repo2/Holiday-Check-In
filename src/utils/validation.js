export const validateEmail = (email) => {
  if (!email) return false;  // Changed to return false if empty
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 