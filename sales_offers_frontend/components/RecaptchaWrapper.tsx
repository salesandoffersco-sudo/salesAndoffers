"use client";

import { useEffect, useRef } from "react";
import { setupRecaptcha } from "../lib/firebase";

export default function RecaptchaWrapper({ onVerify, containerId = "recaptcha-container" }) {
  const recaptchaRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        recaptchaRef.current = setupRecaptcha(containerId);
        recaptchaRef.current.render().then((widgetId) => {
          onVerify?.(recaptchaRef.current);
        });
      } catch (error) {
        console.error("reCAPTCHA setup error:", error);
      }
    }

    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
      }
    };
  }, [containerId, onVerify]);

  return <div id={containerId} className="flex justify-center my-4"></div>;
}