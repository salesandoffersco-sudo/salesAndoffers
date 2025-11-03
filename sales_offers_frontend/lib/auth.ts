// Simple auth utility to get current user info
export const getCurrentUserId = (): number => {
  // Check if we're in the browser
  if (typeof window === 'undefined') return 1;
  
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId) : 1;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};