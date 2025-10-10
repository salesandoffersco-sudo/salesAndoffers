"use client";

import { useEffect, useRef } from "react";
import { setupRecaptcha } from "../lib/firebase";

interface RecaptchaWrapperProps {
  onVerify?: (recaptcha?: any) => void;
  containerId?: string;
}

export default function RecaptchaWrapper({ onVerify, containerId = "recaptcha-container" }: RecaptchaWrapperProps) {
  const recaptchaRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        recaptchaRef.current = setupRecaptcha(containerId);
        recaptchaRef.current.render().then((widgetId: any) => {
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