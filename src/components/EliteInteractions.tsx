import React, { useEffect, useRef, useState } from "react";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useScroll, 
  useVelocity, 
  useTransform, 
  useAnimationFrame 
} from "motion/react";

// ==========================================
// 1. MAGNETIC HOVER WRAPPER
// ==========================================
interface MagneticProps {
  children: React.ReactElement;
  strength?: number; // 0 to 1 scaling factor of the mouse offset
  range?: number; // Distance threshold in pixels
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.35,
  range = 60
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    // Only apply magnetic pull if cursor is within range
    if (distance < range) {
      // Calculate pull strength fading as mouse gets closer to range limit
      const factor = (range - distance) / range;
      setPosition({
        x: dx * strength * factor,
        y: dy * strength * factor
      });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    window.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (el) {
        el.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [strength, range]);

  return (
    <motion.div
      ref={ref}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 180, damping: 14, mass: 0.15 }}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 2. 3D PHYSICS TILT CARD
// ==========================================
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  id
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // High-fidelity spring configurations for premium lag-free dampening
  const sRotateX = useSpring(rotateX, { stiffness: 150, damping: 25 });
  const sRotateY = useSpring(rotateY, { stiffness: 150, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card center, normalized between -0.5 and 0.5
    const relativeX = e.clientX - rect.left - width / 2;
    const relativeY = e.clientY - rect.top - height / 2;

    // Calculate maximum tilt range of 4.5 degrees for elegant restraint
    const targetY = (relativeX / (width / 2)) * 4.5;
    const targetX = -(relativeY / (height / 2)) * 4.5;

    rotateX.set(targetX);
    rotateY.set(targetY);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: sRotateX,
        rotateY: sRotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      className={`premium-card-hover ${className}`}
      id={id}
    >
      <div style={{ transform: "translateZ(10px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
};

// ==========================================
// 3. GENTLE FLOATING PHYSIC CARD (TURNS GREEN & GROWS ON HOVER)
// ==========================================
interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number; // stagger offsets
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = "",
  id,
  delay = 0
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);

  const sRotateX = useSpring(rotateX, { stiffness: 120, damping: 22 });
  const sRotateY = useSpring(rotateY, { stiffness: 120, damping: 22 });
  const sScale = useSpring(scale, { stiffness: 180, damping: 16 });

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const relativeX = e.clientX - rect.left - width / 2;
    const relativeY = e.clientY - rect.top - height / 2;

    // 5 degrees subtle responsive card tilt
    const targetY = (relativeX / (width / 2)) * 5;
    const targetX = -(relativeY / (height / 2)) * 5;

    rotateX.set(targetX);
    rotateY.set(targetY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scale.set(1.06); // grows bigger on hover as requested
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        y: isHovered ? 0 : [0, -12, 0], // floats continuously on waves
      }}
      transition={isHovered ? {} : {
        y: {
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay
        }
      }}
      style={{
        rotateX: sRotateX,
        rotateY: sRotateY,
        scale: sScale,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      className={`relative transition-all duration-500 rounded-[1.5rem] border ${
        isHovered
          ? "border-[#7D8C61] dark:border-[#8CA365] bg-[#7D8C61]/5 dark:bg-[#8CA365]/10 shadow-[0_25px_50px_rgba(125,140,97,0.18)] dark:shadow-[0_25px_50px_rgba(140,163,101,0.18)]"
          : "border-[#E6E2D8] dark:border-[#1B1E26] bg-white dark:bg-[#0D0E12] shadow-[0_8px_30px_rgba(125,140,97,0.01)]"
      } ${className}`}
      id={id}
    >
      {/* Absolute green gradient flash background on hover */}
      <div 
        className={`absolute inset-0 rounded-[1.5rem] bg-gradient-to-tr from-[#7D8C61]/8 dark:from-[#8CA365]/12 to-transparent pointer-events-none transition-opacity duration-500 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`} 
      />
      <div style={{ transform: "translateZ(15px)", transformStyle: "preserve-3d" }} className="h-full relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

// ==========================================
// 4. SCROLL SPEED KINETIC MARQUEE (MATCHA CARTEL SPECIAL)
// ==========================================
interface MarqueeProps {
  baseVelocity?: number;
  text: string;
}

export const ScrollVelocityMarquee: React.FC<MarqueeProps> = ({
  baseVelocity = -3,
  text
}) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 55,
    stiffness: 350
  });

  // Map vertical viewport scroll velocity to marquee horizontal speed multiplier
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 8], {
    clamp: false
  });

  const wrap = (min: number, max: number, v: number) => {
    const range = max - min;
    return ((((v - min) % range) + range) % range) + min;
  };

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((time, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * velocityFactor.get() * (delta / 1000) * 12;

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap w-full border-y border-[#E6E2D8] dark:border-[#1B1E26] bg-[#FAF9F6]/80 dark:bg-[#0D0E12]/80 backdrop-blur-md py-8 select-none my-12 relative z-10">
      <motion.div 
        className="flex whitespace-nowrap text-3xl md:text-5xl lg:text-6xl font-serif font-bold uppercase tracking-wider text-[#423F3A] dark:text-[#FAF9F6] opacity-85"
        style={{ x }}
      >
        <span className="flex items-center gap-10 pr-10">
          <span>{text}</span>
          <span className="text-[#7D8C61] dark:text-[#8CA365] font-sans">•</span>
          <span>{text}</span>
          <span className="text-[#7D8C61] dark:text-[#8CA365] font-sans">•</span>
          <span>{text}</span>
          <span className="text-[#7D8C61] dark:text-[#8CA365] font-sans">•</span>
          <span>{text}</span>
          <span className="text-[#7D8C61] dark:text-[#8CA365] font-sans">•</span>
        </span>
      </motion.div>
    </div>
  );
};

// ==========================================
// 5. HIGH-END SCROLL REVEAL COMPONENT
// ==========================================
interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 0.65,
  yOffset = 24,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.16, 1, 0.3, 1] // Luxury bespoke cubic-bezier easeOut curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// 6. CUSTOM TRAILING CURSOR (SPRING PHYSICAL COUPLING)
// ==========================================
export const CustomCursor: React.FC = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  // Spring settings for standard lag/tail
  const springConfig = { stiffness: 220, damping: 28, mass: 0.4 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);
  
  const [hoverState, setHoverState] = useState<"none" | "interactive" | "input" | "magnetic">("none");
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check if touch device
    const checkTouch = () => {
      const touchCapable = 
        "ontouchstart" in window || 
        navigator.maxTouchPoints > 0 || 
        window.matchMedia("(pointer: coarse)").matches;
      setIsTouch(touchCapable);
    };
    checkTouch();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Interactive hover state detection using event delegation
      const target = e.target as HTMLElement;
      if (!target) return;

      const isMagnetic = target.closest("[data-magnetic]") || target.closest(".magnetic-snap");
      const isInput = target.closest("input, textarea, select");
      const isButton = target.closest("button, a, [role='button']") || target.classList.contains("cursor-pointer");

      if (isMagnetic) {
        setHoverState("magnetic");
      } else if (isInput) {
        setHoverState("input");
      } else if (isButton) {
        setHoverState("interactive");
      } else {
        setHoverState("none");
      }
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeaveWindow);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
    };
  }, [mouseX, mouseY, isVisible]);

  if (isTouch || !isVisible) return null;

  // Custom styling states for cursor circles
  const getOuterScaleAndOpacity = () => {
    switch (hoverState) {
      case "interactive":
        return { scale: 1.8, opacity: 0.15, border: "2px solid #7D8C61", bg: "rgba(125, 140, 97, 0.15)" };
      case "input":
        return { scale: 1.2, opacity: 0.08, border: "1px dashed #7D8C61", bg: "transparent" };
      case "magnetic":
        return { scale: 2.4, opacity: 0.25, border: "2px solid #7D8C61", bg: "rgba(125, 140, 97, 0.2)" };
      default:
        return { scale: 1.0, opacity: 0.45, border: "1px solid #7D8C61", bg: "transparent" };
    }
  };

  const outerState = getOuterScaleAndOpacity();

  return (
    <>
      {/* 1. Core Physics Ring */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          border: outerState.border,
          backgroundColor: outerState.bg,
        }}
        animate={{
          scale: outerState.scale,
          opacity: outerState.opacity,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed w-10 h-10 rounded-full pointer-events-none z-50 mix-blend-normal transition-colors duration-200"
      />

      {/* 2. Direct Pointer Dot */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: hoverState !== "none" ? 0.4 : 1.0,
          backgroundColor: hoverState === "magnetic" ? "#8CA365" : "#7D8C61",
        }}
        transition={{ type: "spring", stiffness: 450, damping: 15 }}
        className="fixed w-2.5 h-2.5 rounded-full pointer-events-none z-50 shadow-[0_0_8px_rgba(125,140,97,0.4)]"
      />
    </>
  );
};
