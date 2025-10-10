"use client";

import { signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { FcGoogle } from "react-icons/fc";
import { useState, useEffect } from "react";

interface GoogleAuthProps {
  onSuccess?: (data?: any) => void;
  buttonText?: string;
}

export default function GoogleAuth({ onSuccess, buttonText = "Continue with Google" }: GoogleAuthProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in error:", error);
      setLoading(false);
    }
  };

  // Handle redirect result on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const user = result.user;
          
          // Send user data to backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/google/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              name: user.displayName,
              photo_url: user.photoURL,
              id_token: await user.getIdToken()
            }),
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.user.username);
            window.dispatchEvent(new Event("authChange"));
            onSuccess?.(data);
          }
        }
      } catch (error) {
        console.error("Google redirect result error:", error);
      }
    };

    handleRedirectResult();
  }, [onSuccess]);

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <FcGoogle className="w-5 h-5" />
      <span className="text-gray-700 font-medium">
        {loading ? "Signing in..." : buttonText}
      </span>
    </button>
  );
}