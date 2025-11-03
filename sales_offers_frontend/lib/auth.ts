// Simple auth utility to get current user info
export const getCurrentUserId = (): number => {
  // Check if we're in the browser
  if (typeof window === 'undefined') return 1;
  
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId) : 1;
};

// Get current user info from API
export const getCurrentUserFromAPI = async (): Promise<number | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/accounts/profile/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('userId', data.id.toString());
      return data.id;
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

// Get current user ID with API fallback
export const getCurrentUserIdWithFallback = async (): Promise<number> => {
  const storedUserId = getCurrentUserId();
  if (storedUserId !== 1) return storedUserId;
  
  const apiUserId = await getCurrentUserFromAPI();
  return apiUserId || 1;
};