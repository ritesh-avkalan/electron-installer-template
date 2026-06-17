import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  uid: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  logout: () => Promise<void>;
  setGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if guest session is already set in localStorage
    const savedGuest = localStorage.getItem('esd.guest_session');
    if (savedGuest) {
      setIsGuest(true);
      setProfile({
        name: 'Guest User',
        email: 'guest@esd.local',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
        uid: 'guest_user_id'
      });
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuest(false);
        localStorage.removeItem('esd.guest_session');
        setProfile({
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.email || '')}`,
          uid: firebaseUser.uid,
        });
      } else {
        setUser(null);
        if (!localStorage.getItem('esd.guest_session')) {
          setProfile(null);
          setIsGuest(false);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setIsGuest(false);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('esd.guest_session');
    setLoading(false);
  };

  const setGuestMode = () => {
    setIsGuest(true);
    localStorage.setItem('esd.guest_session', 'true');
    setProfile({
      name: 'Guest User',
      email: 'guest@esd.local',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
      uid: 'guest_user_id'
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isGuest, logout, setGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
