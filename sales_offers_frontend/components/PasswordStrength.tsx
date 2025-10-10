"use client";

import { useState, useEffect } from "react";

interface PasswordStrengthProps {
  password: string;
  onStrengthChange?: (strength: number) => void;
}

export default function PasswordStrength({ password, onStrengthChange }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);

  useEffect(() => {
    const calculateStrength = () => {
      let score = 0;
      const newFeedback: string[] = [];

      if (password.length >= 8) score += 1;
      else newFeedback.push("At least 8 characters");

      if (/[a-z]/.test(password)) score += 1;
      else newFeedback.push("One lowercase letter");

      if (/[A-Z]/.test(password)) score += 1;
      else newFeedback.push("One uppercase letter");

      if (/\d/.test(password)) score += 1;
      else newFeedback.push("One number");

      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
      else newFeedback.push("One special character");

      setStrength(score);
      setFeedback(newFeedback);
      onStrengthChange?.(score);
    };

    if (password) calculateStrength();
    else { setStrength(0); setFeedback([]); }
  }, [password, onStrengthChange]);

  if (!password) return null;

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Medium";
    return "Strong";
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${strength <= 2 ? 'text-red-600' : strength <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
          {getStrengthText()}
        </span>
      </div>
      {feedback.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              <span className="text-red-500">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}