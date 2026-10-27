import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from '../firebase';

export interface UserProfile {
  userId: string;
  email: string;
  fullName?: string;
  phone?: string;
  photoURL?: string;
  address?: string;
  city?: string;
  pincode?: string;
  systemCapacityKw?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const ADMIN_EMAILS = ['verma.sv4522@gmail.com'];

export function checkIsAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create profile in Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const snapshot = await getDoc(userDocRef);
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as UserProfile);
          } else {
            // First time login - initialize profile from Google account
            const initialProfile: UserProfile = {
              userId: currentUser.uid,
              email: currentUser.email || '',
              fullName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              phone: currentUser.phoneNumber || '',
              city: 'Lucknow',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, initialProfile);
            setUserProfile(initialProfile);
          }
        } catch (err) {
          console.warn('Could not read user profile from Firestore:', err);
          // Set local fallback
          setUserProfile({
            userId: currentUser.uid,
            email: currentUser.email || '',
            fullName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      // User cancelled popup or closed dialog
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    await logoutUser();
    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updated: UserProfile = {
        ...(userProfile || { userId: user.uid, email: user.email || '' }),
        ...data,
        userId: user.uid,
        email: user.email || '',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, updated, { merge: true });
      setUserProfile(updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin: checkIsAdmin(user?.email),
        loading,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
