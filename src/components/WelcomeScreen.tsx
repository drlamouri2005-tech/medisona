import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Sparkles, Fingerprint, Activity, ArrowRight, CheckCircle, BrainCircuit, GraduationCap, BookOpen, ChevronLeft, Stethoscope, Sun, Moon } from "lucide-react";
import gsap from "gsap";
import { AcademicYear } from "../types";
import { useStudent } from "./StudentContext";
import { ALGERIAN_CURRICULUM, YearConfig } from "../data/curriculum";
import { TypewriterLaser } from "./TypewriterLaser";

interface WelcomeScreenProps {
  doctorName?: string;
  onEnter: (selectedModule?: string) => void;
  initialStage?: "welcome" | "years" | "modules";
  onWelcomeComplete?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  doctorName = "Doctor", 
  onEnter,
  initialStage = "welcome",
  onWelcomeComplete
}) => {
  const { student, updateAcademicYear } = useStudent();
  const isDoctorDefault = !doctorName || doctorName === "Doctor" || doctorName.toLowerCase() === "doctor";
  const welcomeText = isDoctorDefault ? "welcome, Doctor" : `Welcome back, ${doctorName}.`;

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const overlayGlowRef = useRef<HTMLDivElement>(null);
  const synapticRingRef = useRef<HTMLDivElement>(null);
  
  type ScreenState = "welcome" | "years" | "modules";
  const [screenState, setScreenState] = useState<ScreenState>(initialStage);
  const [selectedYear, setSelectedYear] = useState<YearConfig | null>(null);

  // One-Time Year Lock (Subscription Simulation): Lock profile to selected year
  const isYearLocked = !!student?.academicYear;

  const [biometricStatus, setBiometricStatus] = useState<"idle" | "scanning" | "success">("idle");
  const [scanProgress, setScanProgress] = useState(0);

  // Theme control state
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("med_welcome_theme") as "dark" | "light") || "dark";
  });
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Sync selectedYear with student's current academic year on load
  useEffect(() => {
    const currentYearKey = student?.academicYear || (localStorage.getItem("med_student_year") as AcademicYear) || "Year 3";
    const matched = ALGERIAN_CURRICULUM.find(y => y.key === currentYearKey) || ALGERIAN_CURRICULUM[2];
    setSelectedYear(matched);
  }, [student?.academicYear]);

  // Helper for dynamic micro module icon pairing
  const getModuleIcon = (moduleName: string) => {
    const name = moduleName.toLowerCase();
    const colorClass = theme === "dark" ? "text-[#7D8C61]" : "text-[#91D4ED]";
    if (name.includes("anatomie")) return <Stethoscope className={`w-5 h-5 ${colorClass}`} />;
    if (name.includes("physio")) return <Activity className={`w-5 h-5 ${colorClass}`} />;
    if (name.includes("biochimie") || name.includes("biophysique") || name.includes("chimie")) return <Sparkles className={`w-5 h-5 ${colorClass}`} />;
    if (name.includes("microbiolog") || name.includes("parasito") || name.includes("immuno")) return <Fingerprint className={`w-5 h-5 ${colorClass}`} />;
    if (name.includes("sémio")) return <BrainCircuit className={`w-5 h-5 ${colorClass}`} />;
    if (name.includes("cardio") || name.includes("pneumo")) return <Activity className={`w-5 h-5 ${colorClass}`} />;
    if (name.includes("pédiatrie") || name.includes("gynéco")) return <GraduationCap className={`w-5 h-5 ${colorClass}`} />;
    return <BookOpen className={`w-5 h-5 ${colorClass}`} />;
  };

  // Helper for dynamic academic cohort icons
  const getYearIcon = (key: string) => {
    const color = theme === "dark" ? "#00F5D4" : "#91D4ED";
    const dropShadow = theme === "dark" ? "rgba(0,245,212,0.45)" : "rgba(145,212,237,0.45)";
    
    const iconClass = `w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12`;
    const styleObj = {
      color: color,
      filter: `drop-shadow(0 0 8px ${dropShadow})`
    };
    
    switch (key) {
      case "Year 1":
        return <BrainCircuit className={iconClass} style={styleObj} />;
      case "Year 2":
        return <Activity className={iconClass} style={styleObj} />;
      case "Year 3":
        return <Stethoscope className={iconClass} style={styleObj} />;
      case "Year 4":
        return <Sparkles className={iconClass} style={styleObj} />;
      case "Year 5":
        return <Fingerprint className={iconClass} style={styleObj} />;
      case "Year 6":
        return <CheckCircle className={iconClass} style={styleObj} />;
      case "Residanat":
        return <GraduationCap className={iconClass} style={styleObj} />;
      default:
        return <GraduationCap className={iconClass} style={styleObj} />;
    }
  };

  // 1. Particle Canvas Field (Floating Micro-dust with 3D Depth & Mouse Displacement & Dynamic Waves)
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId: number;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    class Particle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      depth: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.depth = Math.random() * 0.8 + 0.2;
        this.alpha = Math.random() * 0.4 + 0.1;
        this.color = Math.random() > 0.75 ? "rgba(125, 140, 97, " : "rgba(250, 249, 246, ";
      }

      draw(currentTheme: "dark" | "light") {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.depth, 0, Math.PI * 2);
        
        let colorStr = this.color;
        if (currentTheme === "light") {
          colorStr = this.color.includes("125") 
            ? "rgba(112, 171, 175, " 
            : "rgba(112, 93, 86, ";
        }
        
        ctx.fillStyle = `${colorStr}${this.alpha * this.depth})`;
        ctx.fill();
      }

      update(mx: number, my: number) {
        this.x += this.vx * this.depth;
        this.y += this.vy * this.depth;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        const dx = mx - this.x;
        const dy = my - this.y;
        const dist = Math.hypot(dx, dy);
        const forceRadius = 140;

        if (dist < forceRadius) {
          const force = (forceRadius - dist) / forceRadius;
          this.x -= (dx / dist) * force * 2.0 * this.depth;
          this.y -= (dy / dist) * force * 2.0 * this.depth;
        }
      }
    }

    class Wave {
      direction: "L2R" | "R2L" | "T2B" | "B2T";
      progress: number;
      speed: number;
      amplitude: number;
      frequency: number;
      phaseOffset: number;
      lineWidth: number;
      colorIndex: number;

      constructor(direction: "L2R" | "R2L" | "T2B" | "B2T") {
        this.direction = direction;
        this.progress = 0;
        this.speed = Math.random() * 0.0018 + 0.0006;
        this.amplitude = Math.random() * 40 + 20;
        this.frequency = Math.random() * 0.004 + 0.002;
        this.phaseOffset = Math.random() * Math.PI * 2;
        this.lineWidth = Math.random() * 2.5 + 1;
        this.colorIndex = Math.floor(Math.random() * 4);
      }

      draw(currentTheme: "dark" | "light", phaseValue: number) {
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();
        
        let color = "";
        if (currentTheme === "dark") {
          const colors = [
            "rgba(125, 140, 97, 0.06)",
            "rgba(0, 245, 212, 0.05)",
            "rgba(16, 185, 129, 0.05)",
            "rgba(250, 249, 246, 0.03)"
          ];
          color = colors[this.colorIndex % colors.length];
        } else {
          const colors = [
            "rgba(112, 171, 175, 0.16)",
            "rgba(112, 93, 86, 0.14)",
            "rgba(153, 225, 217, 0.12)",
            "rgba(255, 255, 255, 0.22)"
          ];
          color = colors[this.colorIndex % colors.length];
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = this.lineWidth;
        
        const p = this.progress;
        if (this.direction === "L2R" || this.direction === "R2L") {
          const targetX = this.direction === "L2R" ? p * width : (1 - p) * width;
          for (let y = 0; y <= height; y += 8) {
            const offset = Math.sin(y * this.frequency + phaseValue + this.phaseOffset) * this.amplitude;
            const x = targetX + offset;
            if (y === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        } else {
          const targetY = this.direction === "T2B" ? p * height : (1 - p) * height;
          for (let x = 0; x <= width; x += 8) {
            const offset = Math.sin(x * this.frequency + phaseValue + this.phaseOffset) * this.amplitude;
            const y = targetY + offset;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
        ctx.restore();
      }

      update() {
        this.progress += this.speed;
      }
    }

    const particles: Particle[] = Array.from({ length: 95 }, () => new Particle());
    const waves: Wave[] = [];
    const directions: ("L2R" | "R2L" | "T2B" | "B2T")[] = ["L2R", "R2L", "T2B", "B2T"];

    // Populate initial waves
    for (let i = 0; i < 5; i++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const wave = new Wave(dir);
      wave.progress = Math.random() * 0.85;
      waves.push(wave);
    }

    let mouseX = -1000;
    let mouseY = -1000;
    let phase = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      phase += 0.005;

      const currentTheme = themeRef.current;

      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, Math.max(width, height) * 0.85
      );
      if (currentTheme === "dark") {
        gradient.addColorStop(0, "#0c0d12");
        gradient.addColorStop(0.5, "#08090d");
        gradient.addColorStop(1, "#040507");
      } else {
        gradient.addColorStop(0, "#FFFFFF");
        gradient.addColorStop(0.5, "#F7FBF9");
        gradient.addColorStop(1, "#F0F7F4");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = currentTheme === "dark" 
        ? "rgba(125, 140, 97, 0.015)" 
        : "rgba(145, 212, 237, 0.06)";
      ctx.lineWidth = 1;
      const step = 90;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw and update Waves
      for (let i = waves.length - 1; i >= 0; i--) {
        const wave = waves[i];
        wave.update();
        wave.draw(currentTheme, phase);

        if (wave.progress >= 1) {
          waves.splice(i, 1);
          const nextDir = directions[Math.floor(Math.random() * directions.length)];
          waves.push(new Wave(nextDir));
        }
      }

      particles.forEach((p) => {
        p.update(mouseX, mouseY);
        p.draw(currentTheme);
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // 2. Welcome Letter Reveal Animation on load
  useEffect(() => {
    if (screenState !== "welcome") return;

    const tl = gsap.timeline();

    tl.fromTo(cardRef.current,
      { 
        opacity: 0, 
        scale: 0.85, 
        y: -180, 
        rotateX: 45, 
        rotateY: -5, 
        z: -200 
      },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        rotateX: 0, 
        rotateY: 0, 
        z: 0, 
        duration: 1.5, 
        ease: "power3.out" 
      }
    );

    tl.fromTo(subtitleRef.current,
      { opacity: 0, y: -15, filter: "blur(3px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power2.out" },
      "-=0.6"
    );

    tl.fromTo(buttonRef.current,
      { opacity: 0, scale: 0.9, y: -15 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" },
      "-=0.4"
    );
  }, [screenState]);

  // 2.5. Floating Synaptic Ring Continuous Animation
  useEffect(() => {
    if (screenState !== "welcome" || !synapticRingRef.current) return;

    const ringTween = gsap.fromTo(synapticRingRef.current,
      { y: 5, rotateX: -6, rotateY: 3, z: 65 },
      {
        y: -10,
        rotateX: 8,
        rotateY: -5,
        z: 75,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      }
    );

    return () => {
      ringTween.kill();
    };
  }, [screenState]);

  // Stagger entry effect for Year selection / Modules selections with 3D roll and center-scale
  useLayoutEffect(() => {
    if (screenState === "years") {
      gsap.fromTo(".years-title-wrapper",
        { opacity: 0, y: -50, rotateX: 20 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8, ease: "power2.out" }
      );
      gsap.fromTo(".year-token",
        { 
          opacity: 0, 
          scale: 0.05, 
          z: -200, 
          transformOrigin: "center center" 
        },
        { 
          opacity: 1, 
          scale: 1, 
          z: 0, 
          stagger: 0.08, 
          duration: 0.9, 
          ease: "back.out(1.3)", 
          force3D: true,
          clearProps: "transform"
        }
      );
    } else if (screenState === "modules") {
      gsap.fromTo(".modules-title-wrapper",
        { opacity: 0, y: -50, rotateX: 20 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8, ease: "power2.out" }
      );
      gsap.fromTo(".module-island",
        { 
          opacity: 0, 
          scale: 0.05, 
          z: -150, 
          transformOrigin: "center center" 
        },
        { 
          opacity: 1, 
          scale: 1, 
          z: 0, 
          stagger: 0.03, 
          duration: 0.8, 
          ease: "back.out(1.3)", 
          force3D: true,
          clearProps: "transform"
        }
      );
    }
  }, [screenState, selectedYear]);

  // 3. 3D Card Parallax Tilt & Halo Follower
  useEffect(() => {
    const container = containerRef.current;
    const glow = overlayGlowRef.current;
    if (!container || !glow) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Glow movement
      const containerRect = container.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      const relativeY = e.clientY - containerRect.top;
      
      gsap.to(glow, {
        x: relativeX,
        y: relativeY,
        duration: 0.8,
        ease: "power2.out"
      });
    };

    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [screenState]);

  // 3.5. Universal 3D Dynamic Thickness & Tilt on hover closer to borders for ALL entities
  useEffect(() => {
    const timer = setTimeout(() => {
      const entities = document.querySelectorAll(
        "#welcome-glassmorphic-card, .year-token, .module-island, .doctor-3d-image"
      );

      entities.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.transformStyle = "preserve-3d";
        if (!htmlEl.style.perspective) {
          htmlEl.style.perspective = "1200px";
        }
        
        const isMainCard = htmlEl.id === "welcome-glassmorphic-card";
        const isDark = theme === "dark";
        const baseBorderColor = isMainCard 
          ? (isDark ? "rgba(125, 140, 97, 0.35)" : "rgba(112, 171, 175, 0.15)") 
          : (isDark ? "rgba(125, 140, 97, 0.20)" : "rgba(112, 171, 175, 0.10)");
        
        const shadowRgb = isDark ? "125, 140, 97" : "50, 41, 47";
        const ambientRgb = isDark ? "0, 0, 0" : "50, 41, 47";
        
        const handleMouseMove = (e: MouseEvent) => {
          const rect = htmlEl.getBoundingClientRect();
          const w = rect.width;
          const h = rect.height;
          const cx = rect.left + w / 2;
          const cy = rect.top + h / 2;
          
          const dx = (e.clientX - cx) / w;
          const dy = (e.clientY - cy) / h;
          
          // Closeness of the cursor to the nearest border:
          // Center is dx=0, dy=0; borders are dx=±0.5, dy=±0.5.
          const maxDist = Math.max(Math.abs(dx), Math.abs(dy)); // Range 0 to 0.5
          const borderCloseness = Math.min(1, maxDist / 0.5); // Range 0 to 1
          
          // Max tilt angle: increases dynamically as we get closer to the border!
          const maxTilt = isMainCard ? 22 : 12;
          const tiltX = -dy * maxTilt * (0.5 + borderCloseness * 0.5);
          const tiltY = dx * maxTilt * (0.5 + borderCloseness * 0.5);
          
          // Number of shadow steps representing the solid 3D extrusion/thickness.
          // More layers = thicker card. The thickness gets progressively thicker
          // as the cursor comes closer to the borders of the element!
          const maxLayers = isMainCard ? 16 : 8;
          const minLayers = isMainCard ? 10 : 4;
          const layersCount = Math.round(minLayers + (maxLayers - minLayers) * borderCloseness);
          
          // Shadow offset direction is opposite to dx and dy to create physical realistic depth
          const shadowXMultiplier = -dx * (isMainCard ? 14 : 7);
          const shadowYMultiplier = -dy * (isMainCard ? 14 : 7);
          
          let shadowString = "";
          for (let i = 1; i <= layersCount; i++) {
            const ratio = i / layersCount;
            const ox = shadowXMultiplier * ratio;
            const oy = shadowYMultiplier * ratio;
            let opacity = (0.45 - ratio * 0.25) * (0.4 + borderCloseness * 0.6);
            if (!isDark) opacity = opacity * 0.2; // Softer 3D extrusion shadow in light mode
            shadowString += `${ox}px ${oy}px 0px rgba(${shadowRgb}, ${opacity}), `;
          }
          // Ambient shadow at the bottom
          const ambientOpacity = isDark ? (0.75 + borderCloseness * 0.15) : (0.08 + borderCloseness * 0.06);
          shadowString += `0px ${20 + borderCloseness * 12}px ${45 + borderCloseness * 15}px rgba(${ambientRgb}, ${ambientOpacity})`;
          
          // Apply transforms and dynamic shadow thickness
          gsap.to(htmlEl, {
            rotateX: tiltX,
            rotateY: tiltY,
            z: borderCloseness * (isMainCard ? 35 : 18), // Elevates the card relative to screen/border proximity
            borderColor: isDark 
              ? `rgba(125, 140, 97, ${0.3 + borderCloseness * 0.55})`
              : `rgba(112, 171, 175, ${0.15 + borderCloseness * 0.25})`,
            boxShadow: shadowString,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
          });
        };
        
        const handleMouseLeave = () => {
          let shadowString = "";
          if (isMainCard) {
            const baseLayers = 12;
            for (let i = 1; i <= baseLayers; i++) {
              let opacity = 0.45 - (i / baseLayers) * 0.3;
              if (!isDark) opacity = opacity * 0.2;
              shadowString += `0px ${i}px 0px rgba(${shadowRgb}, ${opacity}), `;
            }
            const baseAmbientOpacity = isDark ? 0.85 : 0.12;
            shadowString += `0px 30px 60px rgba(${ambientRgb}, ${baseAmbientOpacity})`;
          } else {
            const baseSmallAmbientOpacity = isDark ? 0.4 : 0.08;
            shadowString = `0px 4px 15px rgba(${ambientRgb}, ${baseSmallAmbientOpacity})`;
          }
          
          gsap.to(htmlEl, {
            rotateX: 0,
            rotateY: 0,
            z: 0,
            borderColor: baseBorderColor,
            boxShadow: shadowString,
            duration: 0.8,
            ease: "elastic.out(1, 0.75)",
            overwrite: "auto"
          });
        };
        
        htmlEl.addEventListener("mousemove", handleMouseMove);
        htmlEl.addEventListener("mouseleave", handleMouseLeave);
        
        // Stash the cleanup reference
        (htmlEl as any)._cleanup3D = () => {
          htmlEl.removeEventListener("mousemove", handleMouseMove);
          htmlEl.removeEventListener("mouseleave", handleMouseLeave);
        };
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      const entities = document.querySelectorAll(
        "#welcome-glassmorphic-card, .year-token, .module-island"
      );
      entities.forEach((el) => {
        const anyEl = el as any;
        if (anyEl._cleanup3D) {
          anyEl._cleanup3D();
        }
      });
    };
  }, [screenState, selectedYear, theme]);

  // 4. Magnetic Continue Button
  useEffect(() => {
    const button = buttonRef.current;
    if (!button || screenState !== "welcome") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (biometricStatus === "scanning") return;

      const rect = button.getBoundingClientRect();
      const bx = rect.left + rect.width / 2;
      const by = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - bx, e.clientY - by);
      const threshold = 110;

      const isDark = theme === "dark";

      if (dist < threshold) {
        const pullX = (e.clientX - bx) * 0.45;
        const pullY = (e.clientY - by) * 0.45;

        gsap.to(button, {
          x: pullX,
          y: pullY,
          scale: 1.05,
          borderColor: isDark ? "#7D8C61" : "rgba(112, 171, 175, 0.4)",
          boxShadow: isDark 
            ? "0 8px 24px rgba(125, 140, 97, 0.35)" 
            : "0 8px 24px rgba(112, 171, 175, 0.25)",
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(button, {
          x: 0,
          y: 0,
          scale: 1,
          borderColor: isDark ? "rgba(125, 140, 97, 0.3)" : "rgba(112, 171, 175, 0.15)",
          boxShadow: isDark 
            ? "0 4px 15px rgba(0, 0, 0, 0.4)" 
            : "0 4px 15px rgba(112, 93, 86, 0.15)",
          duration: 0.5,
          ease: "power2.out"
        });
      }
    };

    const handleMouseLeave = () => {
      if (biometricStatus === "scanning") return;
      const isDark = theme === "dark";
      gsap.to(button, {
        x: 0,
        y: 0,
        scale: 1,
        borderColor: isDark ? "rgba(125, 140, 97, 0.3)" : "rgba(112, 171, 175, 0.15)",
        boxShadow: isDark 
          ? "0 4px 15px rgba(0, 0, 0, 0.4)" 
          : "0 4px 15px rgba(112, 93, 86, 0.15)",
        duration: 0.5,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [biometricStatus, screenState, theme]);

  // 5. Biometric Scan and Transition to appropriate screen (Stage 2 or Module Islands direct bypass)
  const handleStartScanning = () => {
    if (biometricStatus !== "idle") return;
    setBiometricStatus("scanning");
    setScanProgress(0);

    gsap.to(buttonRef.current, {
      opacity: 0.3,
      scale: 0.98,
      duration: 0.3
    });

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setScanProgress(100);
        setBiometricStatus("success");

        const isDark = theme === "dark";
        gsap.to(cardRef.current, {
          borderColor: isDark ? "#7D8C61" : "rgba(112, 171, 175, 0.6)",
          boxShadow: isDark 
            ? "0 0 50px rgba(125, 140, 97, 0.4)" 
            : "0 0 50px rgba(153, 225, 217, 0.4)",
          backgroundColor: isDark ? "rgba(13, 13, 17, 0.65)" : "rgba(255, 255, 255, 0.8)",
          duration: 0.4
        });

        // Exit biometric welcome card smoothly, transition to either Years or Direct to Dashboard
        const exitTl = gsap.timeline({
          onComplete: () => {
            if (onWelcomeComplete) {
              onWelcomeComplete();
            } else {
              if (isYearLocked) {
                onEnter();
              } else {
                setScreenState("years");
              }
            }
            setBiometricStatus("idle");
            setScanProgress(0);
          }
        });
        
        exitTl.to(cardRef.current, {
          scale: 1.3,
          rotateX: 35,
          rotateY: -25,
          z: 350,
          opacity: 0,
          filter: "blur(12px)",
          delay: 0.6,
          duration: 0.9,
          ease: "power3.inOut"
        });
      } else {
        setScanProgress(current);
      }
    }, 50);
  };

  const handleBypassToYears = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1.3,
        rotateX: 35,
        rotateY: -25,
        z: 350,
        opacity: 0,
        filter: "blur(12px)",
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: () => {
          if (onWelcomeComplete) {
            onWelcomeComplete();
          } else {
            if (isYearLocked) {
              onEnter();
            } else {
              setScreenState("years");
            }
          }
        }
      });
    } else {
      if (onWelcomeComplete) {
        onWelcomeComplete();
      } else {
        if (isYearLocked) {
          onEnter();
        } else {
          setScreenState("years");
        }
      }
    }
  };

  const handleSelectYearToken = (year: YearConfig) => {
    setSelectedYear(year);
    
    // Animate out tokens, then switch state
    gsap.to(".year-token", {
      opacity: 0,
      scale: 0.9,
      y: -20,
      filter: "blur(4px)",
      stagger: 0.04,
      duration: 0.4,
      ease: "power3.in",
      onComplete: async () => {
        // No strict locking, complete student freedom
        await updateAcademicYear(year.key);
        onEnter();
      }
    });
  };

  const handleSelectModuleIsland = async (moduleName: string) => {
    if (!selectedYear) return;
    
    // Save state in student context
    await updateAcademicYear(selectedYear.key);

    // Dynamic Zoom reveal exit
    const mainContainer = containerRef.current;
    if (mainContainer) {
      gsap.to(mainContainer, {
        scale: 1.15,
        opacity: 0,
        filter: "blur(20px)",
        duration: 0.9,
        ease: "power3.inOut",
        onComplete: () => onEnter(moduleName)
      });
    } else {
      onEnter(moduleName);
    }
  };

  const cardShadowStyle = {
    transformStyle: "preserve-3d" as const, 
    perspective: "1000px",
    boxShadow: theme === "dark" ? `
      0 1px 0 rgba(125, 140, 97, 0.45),
      0 2px 0 rgba(125, 140, 97, 0.42),
      0 3px 0 rgba(125, 140, 97, 0.40),
      0 4px 0 rgba(125, 140, 97, 0.38),
      0 5px 0 rgba(125, 140, 97, 0.35),
      0 6px 0 rgba(125, 140, 97, 0.32),
      0 7px 0 rgba(125, 140, 97, 0.30),
      0 8px 0 rgba(125, 140, 97, 0.28),
      0 9px 0 rgba(125, 140, 97, 0.25),
      0 10px 0 rgba(125, 140, 97, 0.22),
      0 11px 0 rgba(125, 140, 97, 0.18),
      0 12px 0 rgba(125, 140, 97, 0.15),
      0 30px 60px rgba(0, 0, 0, 0.85)
    ` : `
      0 1px 0 rgba(50, 41, 47, 0.02),
      0 2px 0 rgba(50, 41, 47, 0.02),
      0 3px 0 rgba(50, 41, 47, 0.03),
      0 4px 0 rgba(50, 41, 47, 0.03),
      0 5px 0 rgba(50, 41, 47, 0.04),
      0 6px 0 rgba(50, 41, 47, 0.04),
      0 7px 0 rgba(50, 41, 47, 0.05),
      0 8px 0 rgba(50, 41, 47, 0.05),
      0 9px 0 rgba(50, 41, 47, 0.06),
      0 10px 0 rgba(50, 41, 47, 0.06),
      0 11px 0 rgba(50, 41, 47, 0.07),
      0 12px 0 rgba(50, 41, 47, 0.08),
      0 30px 60px rgba(50, 41, 47, 0.12)
    `
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full min-h-screen overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center py-10 sm:py-16 select-none transition-colors duration-700 ${
        theme === "dark" ? "bg-[#040507]" : "bg-[#F0F7F4]"
      }`}
      style={{ perspective: "1200px" }}
      id="welcome-root-container"
    >
      {/* Background Micro-Dust Particle Field */}
      <canvas 
        ref={particleCanvasRef} 
        className="fixed inset-0 w-full h-full block z-0 pointer-events-none"
        id="particle-canvas-background"
      />

      {/* Ambient Mouse-Following Accent Halo */}
      <div 
        ref={overlayGlowRef}
        className={`absolute w-[450px] h-[450px] rounded-full filter blur-[120px] pointer-events-none z-0 transform-gpu -translate-x-1/2 -translate-y-1/2 mix-blend-screen transition-all duration-700 ${
          theme === "dark" ? "bg-[#7D8C61]/8" : "bg-[#99E1D9]/20"
        }`}
        id="ambient-mouse-glowing-halo"
      />

      {/* Animated Dark/Light Theme Toggle Switch */}
      <div className="absolute top-8 right-8 sm:top-10 sm:right-12 z-50">
        <button
          onClick={() => {
            const nextTheme = theme === "dark" ? "light" : "dark";
            setTheme(nextTheme);
            localStorage.setItem("med_welcome_theme", nextTheme);
          }}
          className={`relative w-16 h-8 rounded-full border transition-all duration-500 cursor-pointer shadow-lg flex items-center p-1 overflow-hidden focus:outline-none ${
            theme === "dark"
              ? "bg-[#0d0d11]/80 border-[#7D8C61]/35 hover:border-[#7D8C61]/70 hover:shadow-[0_0_15px_rgba(125,140,97,0.2)]"
              : "bg-[#FFFFFF]/90 border-[#70ABAF]/50 hover:border-[#70ABAF] hover:shadow-[0_4px_12px_rgba(112,171,175,0.25)]"
          }`}
          id="theme-toggle-animated-switch"
          aria-label="Toggle visual theme"
        >
          {/* Slider Background Track Details */}
          <div className="absolute inset-0 flex justify-between px-2.5 items-center pointer-events-none opacity-45 font-mono text-[8px] font-extrabold">
            <span className={theme === "light" ? "text-[#32292F]" : "text-[#7D8C61]"}>D</span>
            <span className={theme === "light" ? "text-[#70ABAF]" : "text-[#FAF9F6]"}>L</span>
          </div>

          {/* Animated Knob */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transform transition-all duration-500 shadow-md ${
              theme === "dark"
                ? "translate-x-0 bg-[#7D8C61] text-[#0d0d11] rotate-0"
                : "translate-x-8 bg-[#70ABAF] text-[#F0F7F4] rotate-180"
            }`}
          >
            {theme === "dark" ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Sun className="w-3.5 h-3.5" />
            )}
          </div>
        </button>
      </div>

      {/* Premium Subscription Badge (Simulated secure payment tier state) */}
      {isYearLocked && selectedYear && (
        <div 
          className={`absolute top-8 left-1/2 transform -translate-x-1/2 z-30 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-xl transition-all duration-500 shadow-md animate-fade-in ${
            theme === "dark" 
              ? "bg-[#0d0d11]/80 border border-[#7D8C61]/45 shadow-[0_0_20px_rgba(125,140,97,0.3)]" 
              : "bg-[#FFFFFF] border border-[#70ABAF]/30 shadow-[0_4px_12px_rgba(112,171,175,0.15)]"
          }`}
          id="premium-subscription-status-badge"
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              theme === "dark" ? "bg-[#7D8C61]" : "bg-[#70ABAF]"
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              theme === "dark" ? "bg-[#7D8C61]" : "bg-[#70ABAF]"
            }`}></span>
          </span>
          <span className={`font-mono text-[10px] uppercase tracking-[0.18em] whitespace-nowrap transition-colors duration-500 ${
            theme === "dark" ? "text-[#FAF9F6]" : "text-[#32292F]"
          }`}>
            Status: <span className={`${theme === "dark" ? "text-[#7D8C61]" : "text-[#70ABAF]"} font-bold`}>Active Account</span> • {selectedYear.frenchLabel}
          </span>
        </div>
      )}

      {/* Back breadcrumb menu helper - ONLY shown for non-locked selection workflow */}
      {screenState !== "welcome" && !isYearLocked && (
        <button 
          onClick={() => {
            if (screenState === "modules") {
              // Return to years
              gsap.to(".module-island", {
                opacity: 0,
                scale: 0.9,
                y: 20,
                stagger: 0.03,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                  setScreenState("years");
                }
              });
            } else if (screenState === "years") {
              // Return to welcome card
              setScreenState("welcome");
              setSelectedYear(null);
            }
          }}
          className={`absolute top-8 left-8 sm:top-10 sm:left-12 flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md transition-all duration-500 z-50 cursor-pointer shadow-lg active:scale-95 group ${
            theme === "dark"
              ? "bg-[#0d0d11]/50 border border-[#7D8C61]/25 hover:border-[#7D8C61]/70 text-[#FAF9F6]"
              : "bg-[#FFFFFF]/90 border border-[#70ABAF]/40 hover:border-[#70ABAF] text-[#32292F]"
          }`}
          id="portal-navigation-back-trigger"
        >
          <ChevronLeft className={`w-4 h-4 transition-all group-hover:-translate-x-0.5 ${
            theme === "dark" ? "text-[#7D8C61]" : "text-[#70ABAF]"
          }`} />
          <span>{screenState === "modules" ? "Cohorts" : "Disconnect"}</span>
        </button>
      )}

      {/* STAGE 1: Biometric Verification Card */}
      {screenState === "welcome" && (
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 px-4 sm:px-8 z-10 transition-all duration-700">
          


          <div 
            ref={cardRef}
            className={`relative max-w-sm lg:max-w-md w-full mx-4 rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center backdrop-blur-2xl transition-all duration-700 z-10 transform-gpu welcome-stage-container scale-95 ${
            theme === "dark"
              ? "bg-[#0d0d11]/45 border-2 border-[#7D8C61]/35 text-[#f6faf8]"
              : "bg-[#FFFFFF] border border-[#70ABAF]/15 text-[#32292F]"
          }`}
          style={cardShadowStyle}
          id="welcome-glassmorphic-card"
        >
          <div className={`absolute -top-16 -left-16 w-36 h-36 rounded-full filter blur-2xl pointer-events-none transition-colors duration-500 ${
            theme === "dark" ? "bg-[#7D8C61]/6" : "bg-[#99E1D9]/15"
          }`} />
          <div className={`absolute -bottom-16 -right-16 w-36 h-36 rounded-full filter blur-2xl pointer-events-none transition-colors duration-500 ${
            theme === "dark" ? "bg-[#7D8C61]/4" : "bg-[#70ABAF]/12"
          }`} />

          {/* 3D Pulsing Synaptic Ring Visual */}
          <div 
            ref={synapticRingRef}
            className="relative w-36 h-36 mb-6 flex items-center justify-center transform-gpu cursor-pointer transition-all duration-300 hover:scale-110" 
            style={{ transform: "translateZ(65px)", transformStyle: "preserve-3d" }}
          >
            {/* Outer ring */}
            <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 animate-[spin_18s_linear_infinite] ${
              theme === "dark"
                ? "border-[#00F5D4]/20 shadow-[0_0_20px_rgba(0,245,212,0.15),inset_0_0_15px_rgba(0,245,212,0.1)]"
                : "border-[#99E1D9]/40 shadow-[0_0_20px_rgba(153,225,217,0.3),inset_0_0_15px_rgba(153,225,217,0.2)]"
            }`} />
            {/* Inner dashed ring */}
            <div className={`absolute inset-2.5 rounded-full border-2 border-dashed transition-all duration-500 animate-[spin_8s_linear_infinite_reverse] ${
              theme === "dark"
                ? "border-[#10B981]/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                : "border-[#70ABAF]/40 shadow-[0_0_15px_rgba(112,171,175,0.2)]"
            }`} />
            
            {/* Central core */}
            <div className={`absolute w-18 h-18 rounded-full flex items-center justify-center border-2 transform-gpu transition-all duration-500 ${
              theme === "dark"
                ? "bg-[#0d0d11]/80 border-[#00F5D4]/60 shadow-[0_0_35px_rgba(0,245,212,0.5),inset_0_0_15px_rgba(0,245,212,0.3)] hover:shadow-[0_0_45px_rgba(0,245,212,0.7),inset_0_0_20px_rgba(0,245,212,0.4)]"
                : "bg-[#FFFFFF] border-[#70ABAF]/80 shadow-[0_0_35px_rgba(153,225,217,0.5),inset_0_0_15px_rgba(153,225,217,0.3)] hover:shadow-[0_0_45px_rgba(153,225,217,0.7),inset_0_0_20px_rgba(153,225,217,0.4)]"
            }`}>
              <Activity className={`w-8 h-8 animate-pulse animate-soft-pulse transition-all duration-500 ${
                theme === "dark" ? "text-[#00F5D4] drop-shadow-[0_0_10px_rgba(0,245,212,0.85)]" : "text-[#70ABAF] drop-shadow-[0_0_10px_rgba(153,225,217,0.85)]"
              }`} />
            </div>
            
            {/* Luminous indicator dot */}
            <div className={`absolute w-2 h-2 rounded-full top-1.5 left-1/2 -translate-x-1/2 animate-ping ${
              theme === "dark" ? "bg-[#00F5D4] shadow-[0_0_12px_#00F5D4]" : "bg-[#99E1D9] shadow-[0_0_12px_#99E1D9]"
            }`} />
          </div>

          <div className="space-y-4 relative z-10 transform-gpu" style={{ transform: "translateZ(25px)" }}>
            <div className="hidden" />

            <h1 
              ref={titleRef}
              className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight leading-[1.1] min-h-[44px] ${
                theme === "dark" ? "text-[#FAF9F6]" : "text-[#32292F]"
              }`}
              id="welcome-title-text"
            >
              <TypewriterLaser text={welcomeText} delay={200} speed={35} />
            </h1>

            <div 
              ref={subtitleRef}
              className="flex flex-col items-center gap-1.5"
              id="welcome-subtitle-wrapper"
            >
              <p className={`text-xs sm:text-sm font-medium font-mono tracking-widest uppercase transition-colors duration-500 ${
                theme === "dark" ? "text-[#9cb07b]" : "text-[#70ABAF]"
              }`}>
                <TypewriterLaser text="Master every question. Every module." delay={900} speed={22} />
              </p>
              <div className={`h-0.5 w-12 transition-all duration-500 ${
                theme === "dark" ? "bg-gradient-to-r from-transparent via-[#7D8C61]/50 to-transparent" : "bg-gradient-to-r from-transparent via-[#705D56]/60 to-transparent"
              }`} />
            </div>
          </div>

          <div className="mt-9 w-full relative z-10 flex flex-col items-center transform-gpu" style={{ transform: "translateZ(35px)" }}>
            {biometricStatus === "idle" && (
              <button
                ref={buttonRef}
                onClick={handleStartScanning}
                className={`group relative w-full px-6 py-4 rounded-2xl transition-all duration-500 flex items-center justify-center gap-2.5 overflow-hidden active:scale-95 cursor-pointer ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-[#7D8C61]/10 to-[#7D8C61]/15 hover:from-[#7D8C61]/20 hover:to-[#7D8C61]/25 border border-[#7D8C61]/30 hover:border-[#7D8C61]/60 text-[#FAF9F6] shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
                    : "bg-[#705D56] hover:bg-[#5C4C46] border border-[#705D56]/10 text-[#F0F7F4] shadow-[0_4px_15px_rgba(112,93,86,0.25)]"
                }`}
                id="continue-learning-magnetic-button"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#FAF9F6]/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.8s_infinite]" />
                <Fingerprint className={`w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110 ${
                  theme === "dark" ? "text-[#7D8C61]" : "text-[#F0F7F4]"
                }`} />
                <span>Continue Learning</span>
                <ArrowRight className={`w-4 h-4 transition-all duration-300 group-hover:translate-x-1 ${
                  theme === "dark" ? "text-[#9cb07b]" : "text-[#F0F7F4]"
                }`} />
              </button>
            )}

            {biometricStatus !== "idle" && (
              <div 
                className={`w-full border rounded-2xl p-4 flex flex-col gap-3 shadow-inner transition-colors duration-500 ${
                  theme === "dark" ? "bg-[#0a0a0e]/95 border-[#7D8C61]/30" : "bg-[#F0F7F4] border-[#70ABAF]/30"
                }`}
                id="biometric-scanning-panel"
              >
                <div className={`flex items-center justify-between w-full text-[9px] font-mono font-bold tracking-widest uppercase transition-colors duration-500 ${
                  theme === "dark" ? "text-[#7D8C61]" : "text-[#70ABAF]"
                }`}>
                  <span className="flex items-center gap-2">
                    {biometricStatus === "scanning" ? (
                      <>
                        <Activity className={`w-3.5 h-3.5 animate-pulse ${theme === "dark" ? "text-[#7D8C61]" : "text-[#70ABAF]"}`} />
                        Verifying Medical Signature...
                      </>
                    ) : (
                      <>
                        <CheckCircle className={`w-3.5 h-3.5 ${theme === "dark" ? "text-[#7D8C61]" : "text-[#70ABAF]"}`} />
                        Identity Verified
                      </>
                    )}
                  </span>
                  <span className={theme === "dark" ? "text-[#FAF9F6]" : "text-[#32292F]"}>{scanProgress}%</span>
                </div>
                
                <div className={`w-full h-1.5 rounded-full overflow-hidden relative ${
                  theme === "dark" ? "bg-[#14151a]" : "bg-[#99E1D9]/20"
                }`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-75 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-[#7D8C61] to-[#FAF9F6] shadow-[0_0_10px_#7D8C61]"
                        : "bg-gradient-to-r from-[#70ABAF] to-[#99E1D9] shadow-[0_0_10px_rgba(153,225,217,0.6)]"
                    }`}
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button 
              onClick={handleBypassToYears}
              className="mt-5 text-[9px] font-mono text-[#9A9489]/50 hover:text-[#7D8C61] tracking-[0.18em] uppercase underline underline-offset-4 transition-colors duration-200 cursor-pointer hidden"
              id="skip-authentication-button"
            >
              Bypass to Curriculum Hub
            </button>
          </div>
        </div>
        </div>
      )}

      {/* STAGE 2: Year Selection Holographic Hub (Only accessible if NOT locked) */}
      {screenState === "years" && !isYearLocked && (
        <div className="max-w-5xl w-full px-6 flex flex-col items-center z-10 relative years-stage-container">
          <div className="text-center mb-10 space-y-3 years-title-wrapper">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-[9px] tracking-[0.2em] uppercase font-bold transition-all duration-500 ${
              theme === "dark"
                ? "border-[#7D8C61]/20 bg-[#7D8C61]/10 text-[#7D8C61]"
                : "border-[#91D4ED]/30 bg-[#91D4ED]/15 text-[#91D4ED]"
            }`}>
              <GraduationCap className="w-3.5 h-3.5" />
              Academic Cohorts Selection
            </div>
            <h2 className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight transition-colors duration-500 ${
              theme === "dark" ? "text-[#FAF9F6]" : "text-[#1C1714]"
            }`}>
              <TypewriterLaser text="Algerian Medical Curriculum" delay={150} speed={30} />
            </h2>
            <p className={`text-xs font-mono max-w-lg mx-auto leading-relaxed transition-colors duration-500 ${
              theme === "dark" ? "text-[#9cb07b]/70" : "text-[#5A4F46]"
            }`}>
              <TypewriterLaser text="Select your academic year to reveal highly optimized exam questions, specialized modules, and real-time medical boards revision." delay={600} speed={12} />
            </p>
          </div>

          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl" 
            id="year-tokens-grid"
            style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
          >
            {ALGERIAN_CURRICULUM.map((year, i) => (
              <button
                key={year.key}
                onClick={() => handleSelectYearToken(year)}
                className={`year-token relative text-left rounded-2xl p-6 flex flex-col justify-between h-32 backdrop-blur-2xl transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer ${
                  theme === "dark"
                    ? "bg-[#0d0d11]/45 border border-[#7D8C61]/20 hover:border-[#7D8C61]/70 hover:shadow-[0_12px_30px_rgba(125,140,97,0.22)]"
                    : "bg-[#AF9483] border border-[#91D4ED]/40 hover:border-[#91D4ED] hover:shadow-[0_12px_30px_rgba(145,212,237,0.25)]"
                }`}
                id={`cohort-token-${year.key.replace(" ", "-")}`}
                style={{ transformStyle: "preserve-3d", opacity: 0 }}
              >
                {/* Visual top border line */}
                <div className={`absolute top-0 left-6 right-6 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-transparent via-[#7D8C61]/30 to-transparent"
                    : "bg-gradient-to-r from-transparent via-[#91D4ED]/50 to-transparent"
                }`} />

                <div className="flex justify-between items-start w-full">
                  <div className="space-y-1">
                    <span className={`font-serif text-2xl font-bold tracking-tight transition-colors duration-300 ${
                      theme === "dark"
                        ? "text-[#FAF9F6] group-hover:text-[#9cb07b]"
                        : "text-[#FAF9F6] group-hover:text-[#91D4ED]"
                    }`}>
                      {year.frenchLabel}
                    </span>
                    <p className={`text-[10px] font-mono uppercase tracking-widest transition-colors duration-300 ${
                      theme === "dark" ? "text-[#9A9489]/60" : "text-[#FAF9F6]/80"
                    }`}>
                      {year.label}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 ${
                    theme === "dark"
                      ? "border-[#7D8C61]/35 bg-[#7D8C61]/15 group-hover:border-[#00F5D4]/65 group-hover:bg-[#7D8C61]/25 shadow-[inset_0_0_8px_rgba(0,245,212,0.05)] group-hover:shadow-[0_0_15px_rgba(0,245,212,0.3),inset_0_0_10px_rgba(0,245,212,0.15)]"
                      : "border-[#91D4ED]/40 bg-[#91D4ED]/15 group-hover:border-[#91D4ED] group-hover:bg-[#91D4ED]/25 shadow-[inset_0_0_8px_rgba(145,212,237,0.05)] group-hover:shadow-[0_0_15px_rgba(145,212,237,0.3),inset_0_0_10px_rgba(145,212,237,0.15)]"
                  }`}>
                    {getYearIcon(year.key)}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className={`flex justify-between items-center text-[9px] font-mono uppercase tracking-wider font-bold transition-colors duration-500 ${
                    theme === "dark" ? "text-[#7D8C61]" : "text-[#91D4ED]"
                  }`}>
                    <span>{year.units.flatMap(u => u.modules).length} Official Modules</span>
                    <span className={`group-hover:translate-x-1 transition-all inline-flex items-center gap-1 ${
                      theme === "dark" ? "text-[#9cb07b]" : "text-[#FAF9F6] group-hover:text-[#91D4ED]"
                    }`}>
                      Inspect <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 3: Module Selection Island */}
      {screenState === "modules" && selectedYear && (
        <div className="max-w-5xl w-full px-6 flex flex-col items-center z-10 relative py-6 modules-stage-container">
          <div className="text-center mb-8 space-y-3 modules-title-wrapper">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-[9px] tracking-[0.2em] uppercase font-bold transition-all duration-500 ${
              theme === "dark"
                ? "border-[#7D8C61]/20 bg-[#7D8C61]/10 text-[#7D8C61]"
                : "border-[#91D4ED]/30 bg-[#91D4ED]/15 text-[#91D4ED]"
            }`}>
              <BookOpen className="w-3.5 h-3.5" />
              Active Cohort: {selectedYear.frenchLabel}
            </div>
            <h2 className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight transition-colors duration-500 ${
              theme === "dark" ? "text-[#FAF9F6]" : "text-[#1C1714]"
            }`}>
              <TypewriterLaser text="Specialized Modules Islands" delay={150} speed={30} />
            </h2>
            <p className={`text-xs font-mono max-w-lg mx-auto leading-relaxed transition-colors duration-500 ${
              theme === "dark" ? "text-[#9cb07b]/70" : "text-[#5A4F46]"
            }`}>
              <TypewriterLaser text="Launch directly into active boards. Choose any module path to configure your diagnostic tests and custom QCM sessions." delay={600} speed={12} />
            </p>
          </div>

          {/* Module island selector grouped by Units/Rotations */}
          <div className="space-y-8 w-full max-w-4xl" id="units-wrapper">
            {selectedYear.units.map((unit) => (
              <div key={unit.name} className="space-y-3">
                <div className={`flex items-center gap-2 border-b pb-1.5 transition-colors duration-500 ${
                  theme === "dark" ? "border-[#7D8C61]/20 text-[#FAF9F6]" : "border-[#91D4ED]/30 text-[#1C1714]"
                }`}>
                  <Activity className={`w-4 h-4 ${theme === "dark" ? "text-[#7D8C61]" : "text-[#91D4ED]"}`} />
                  <h3 className={`font-serif text-sm font-bold tracking-wide text-left transition-colors duration-500 ${
                    theme === "dark" ? "text-[#FAF9F6]" : "text-[#1C1714]"
                  }`}>
                    {unit.frenchName}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                  {unit.modules.map((mod) => (
                    <button
                      key={mod.name}
                      onClick={() => handleSelectModuleIsland(mod.name)}
                      className={`module-island relative text-left rounded-xl p-4 flex items-center gap-3.5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 group cursor-pointer ${
                        theme === "dark"
                          ? "bg-[#0d0d11]/45 border border-[#7D8C61]/20 hover:border-[#7D8C61]/75 hover:shadow-[0_8px_20px_rgba(125,140,97,0.18)]"
                          : "bg-[#AF9483] border border-[#91D4ED]/30 hover:border-[#91D4ED]/75 hover:shadow-[0_8px_20px_rgba(145,212,237,0.22)]"
                      }`}
                      id={`module-island-${mod.name.replace(/[\s-]/g, "_")}`}
                      style={{ transformStyle: "preserve-3d", opacity: 0 }}
                    >
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-500 ${
                        theme === "dark"
                          ? "bg-[#7D8C61]/10 border-[#7D8C61]/20 group-hover:bg-[#7D8C61]/20 group-hover:border-[#7D8C61]/60"
                          : "bg-[#91D4ED]/10 border-[#91D4ED]/20 group-hover:bg-[#91D4ED]/20 group-hover:border-[#91D4ED]/60"
                      }`}>
                        {getModuleIcon(mod.name)}
                      </div>
                      <div className="space-y-0.5 pr-4">
                        <span className={`font-serif text-xs font-bold transition-colors block leading-tight ${
                          theme === "dark"
                            ? "text-[#FAF9F6] group-hover:text-[#9cb07b]"
                            : "text-[#FAF9F6] group-hover:text-[#91D4ED]"
                        }`}>
                          {mod.frenchName || mod.name}
                        </span>
                        <span className={`text-[9px] font-mono tracking-widest uppercase block transition-colors duration-500 ${
                          theme === "dark" ? "text-[#FAF9F6]/40" : "text-[#FAF9F6]/85"
                        }`}>
                          {mod.courses.length} Courses
                        </span>
                      </div>
                      <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-all">
                        <ArrowRight className={`w-3.5 h-3.5 ${
                          theme === "dark" ? "text-[#7D8C61]" : "text-[#91D4ED]"
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Back Button - always shown since strict year lock is removed */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => {
                gsap.to(".module-island", {
                  opacity: 0,
                  scale: 0.9,
                  y: 20,
                  stagger: 0.03,
                  duration: 0.3,
                  ease: "power2.in",
                  onComplete: () => {
                    setScreenState("years");
                  }
                });
              }}
              className={`px-5 py-2.5 rounded-xl border text-[10px] font-mono uppercase tracking-wider transition-all duration-500 flex items-center gap-2 cursor-pointer active:scale-95 animate-fade-in ${
                theme === "dark"
                  ? "bg-transparent border-[#FAF9F6]/20 hover:border-[#7D8C61] text-[#FAF9F6]/80 hover:text-[#FAF9F6]"
                  : "bg-[#AF9483] border-[#91D4ED]/40 hover:border-[#91D4ED] text-[#FAF9F6] hover:text-[#91D4ED]"
              }`}
              id="return-to-cohort-hub-btn"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Cohorts</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
