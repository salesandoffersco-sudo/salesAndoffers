// Simple auth utility to get current user info
export const getCurrentUserId = (): number => {
  // This should be replaced with actual auth context/state management
  // For now, return a default user ID or get from localStorage
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId) : 1;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};