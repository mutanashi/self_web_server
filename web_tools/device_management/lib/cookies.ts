// Cookie management utilities

export interface UserCookie {
  id: number;
  username: string;
  userLevel: string;
  token?: string;
}

export class CookieManager {
  // Set user cookie
  static setUserCookie(userData: UserCookie) {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const cookieValue = JSON.stringify(userData);
        document.cookie = `user=${encodeURIComponent(cookieValue)}; path=/; max-age=86400; SameSite=Strict`;
      } catch (error) {
        console.error('Error setting user cookie:', error);
      }
    }
  }

  // Get user cookie
  static getUserCookie(): UserCookie | null {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const cookies = document.cookie.split(';');
        const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='));
        
        if (userCookie) {
          const cookieValue = decodeURIComponent(userCookie.split('=')[1]);
          return JSON.parse(cookieValue);
        }
      } catch (error) {
        console.error('Error parsing user cookie:', error);
        return null;
      }
    }
    return null;
  }

  // Update username in cookie
  static updateUsernameInCookie(newUsername: string) {
    if (typeof window !== 'undefined') {
      try {
        const userData = this.getUserCookie();
        if (userData) {
          userData.username = newUsername;
          this.setUserCookie(userData);
        }
      } catch (error) {
        console.error('Error updating username in cookie:', error);
      }
    }
  }

  // Clear user cookie
  static clearUserCookie() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } catch (error) {
        console.error('Error clearing user cookie:', error);
      }
    }
  }

  // Check if user is logged in
  static isLoggedIn(): boolean {
    try {
      return this.getUserCookie() !== null;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Get current username
  static getCurrentUsername(): string | null {
    try {
      const userData = this.getUserCookie();
      return userData?.username || null;
    } catch (error) {
      console.error('Error getting current username:', error);
      return null;
    }
  }

  // Get current user ID
  static getCurrentUserId(): number | null {
    try {
      const userData = this.getUserCookie();
      return userData?.id || null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }
}
