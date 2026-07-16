import React, { useState, useEffect } from "react";

interface TypewriterLaserProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterLaser: React.FC<TypewriterLaserProps> = ({ 
  text, 
  delay = 0, 
  speed = 25, 
  className = "", 
  onComplete 
}) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setStarted(false);
  }, [text]);

  useEffect(() => {
    if (started) return;
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimer);
  }, [started, delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayed, started, text, speed, onComplete]);

  const isFinished = displayed.length >= text.length;

  return (
    <span className={`relative inline-block ${className}`}>
      {displayed}
      {!isFinished && started && (
        <span 
          className="inline-block w-1 h-4 sm:h-5 ml-0.5 bg-[#00F5D4] rounded-full"
          style={{ 
            boxShadow: "0 0 10px #00F5D4, 0 0 20px #00F5D4, 0 0 35px #00F5D4",
            animation: "pulse 0.6s infinite alternate",
            verticalAlign: "middle"
          }}
        />
      )}
    </span>
  );
};
