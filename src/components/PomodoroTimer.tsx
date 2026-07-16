import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Volume2, VolumeX, Sparkles } from "lucide-react";
import { motion } from "motion/react";

type TimerMode = "work" | "short-break" | "long-break";

interface ModeConfig {
  label: string;
  duration: number; // in minutes
  color: string;
  icon: React.ReactNode;
  advice: string;
}

export const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>("work");
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0); // in minutes
  
  // Ambient Sound Synth States
  const [ambientSound, setAmbientSound] = useState<"none" | "white-noise" | "binaural">("none");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  const configs: Record<TimerMode, ModeConfig> = {
    work: {
      label: "Concentration Médicale",
      duration: 25,
      color: "var(--color-accent)",
      icon: <Brain className="w-5 h-5 text-[var(--color-accent)]" />,
      advice: "Concentrez-vous sur vos QCMs. Fermez vos onglets de distraction."
    },
    "short-break": {
      label: "Pause Courte",
      duration: 5,
      color: "#C58B74",
      icon: <Coffee className="w-5 h-5 text-[#C58B74]" />,
      advice: "Levez-vous, étirez vos muscles et buvez un verre d'eau."
    },
    "long-break": {
      label: "Pause Longue",
      duration: 15,
      color: "#81A1C1",
      icon: <Coffee className="w-5 h-5 text-[#81A1C1]" />,
      advice: "Reposez vos yeux. Une marche rapide ou un café vous fera du bien."
    }
  };

  const currentConfig = configs[mode];
  const totalSeconds = currentConfig.duration * 60;

  // Initialize timer seconds when mode changes
  useEffect(() => {
    setIsPlaying(false);
    setSecondsLeft(currentConfig.duration * 60);
  }, [mode]);

  // Main countdown tick loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            playCompletionBeep();
            handleTimerCompleted();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, secondsLeft]);

  // Track session completion stats
  const handleTimerCompleted = () => {
    if (mode === "work") {
      setCompletedSessions((prev) => prev + 1);
      setTotalFocusTime((prev) => prev + 25);
      setMode("short-break");
    } else {
      setMode("work");
    }
  };

  // Synthesize a high-fidelity focus beep/bell via Web Audio API
  const playCompletionBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note (clear bell tone)
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15); // Slide up to high clear C6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn("Failed to play synthesized sound", e);
    }
  };

  // Web Audio API ambient noise generator (White Noise, Binaural Focus Beats)
  const toggleAmbientSound = (soundType: "none" | "white-noise" | "binaural") => {
    try {
      // Clean up previous sound node
      if (noiseNodeRef.current) {
        try {
          (noiseNodeRef.current as any).stop();
        } catch {}
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }

      if (soundType === "none") {
        setAmbientSound("none");
        return;
      }

      // Initialize audio context lazily
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (soundType === "white-noise") {
        // Generate dynamic white noise buffer
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, ctx.currentTime); // Warm muffled hum, like soothing rain

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime); // Soft background level

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        noiseNodeRef.current = whiteNoise;
      } else if (soundType === "binaural") {
        // Generate deep binaural focus beat (humming alpha waves)
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);
        const gainNode = ctx.createGain();

        oscLeft.type = "sine";
        oscLeft.frequency.setValueAtTime(100, ctx.currentTime); // 100 Hz left ear

        oscRight.type = "sine";
        oscRight.frequency.setValueAtTime(110, ctx.currentTime); // 110 Hz right ear (yielding a highly focused 10Hz Alpha differential wave!)

        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);

        oscLeft.connect(merger, 0, 0);
        oscRight.connect(merger, 0, 1);
        merger.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscLeft.start();
        oscRight.start();

        // Custom stop helper wrapper
        noiseNodeRef.current = {
          disconnect: () => {
            oscLeft.disconnect();
            oscRight.disconnect();
            merger.disconnect();
            gainNode.disconnect();
          },
          stop: () => {
            oscLeft.stop();
            oscRight.stop();
          }
        } as any;
      }

      setAmbientSound(soundType);
    } catch (e) {
      console.warn("Failed to synthesize ambient audio:", e);
    }
  };

  // Clean up ambient sound on unmount
  useEffect(() => {
    return () => {
      if (noiseNodeRef.current) {
        try {
          (noiseNodeRef.current as any).stop();
        } catch {}
        noiseNodeRef.current.disconnect();
      }
    };
  }, []);

  // Format Helper
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // SVG Progress Arc calculation
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = secondsLeft / totalSeconds;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[2rem] p-6 sm:p-8 shadow-sm flex flex-col items-center max-w-md mx-auto text-center relative overflow-hidden" id="pomodoro-timer-card">
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
        <Sparkles className="w-3 h-3 animate-pulse" /> Focus Lab
      </div>

      <h3 className="font-serif font-black text-xl text-[var(--color-text)] mb-6 flex items-center gap-2">
        {currentConfig.icon} {configs[mode].label}
      </h3>

      {/* Circle countdown layout */}
      <div className="relative w-56 h-56 flex items-center justify-center mb-8">
        <svg className="w-full h-full transform -rotate-90">
          {/* Static gray outer track */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            className="stroke-[var(--color-surface-hover)] fill-none stroke-[8]"
          />
          {/* Dynamic color focus track */}
          <motion.circle
            cx="112"
            cy="112"
            r={radius}
            fill="none"
            stroke={currentConfig.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ ease: "linear", duration: 0.5 }}
          />
        </svg>

        {/* Big countdown text overlay */}
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-mono font-black text-[var(--color-text)] tracking-tight">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-[9px] font-mono font-bold uppercase text-[var(--color-text-muted)] mt-1.5 tracking-widest">
            {isPlaying ? "en cours" : "en pause"}
          </span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => {
            setIsPlaying(false);
            setSecondsLeft(currentConfig.duration * 60);
          }}
          className="p-3 bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] rounded-full transition text-[var(--color-text-muted)] cursor-pointer"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-6 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-mono font-bold text-xs uppercase tracking-widest rounded-full shadow-md shadow-[var(--color-accent)]/15 transition flex items-center gap-2 cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "Pause" : "Démarrer"}
        </button>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-3 gap-2 w-full border-t border-[var(--color-border)] pt-5 mb-5">
        {(["work", "short-break", "long-break"] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`py-2 px-1.5 rounded-xl font-mono text-[9px] font-black uppercase tracking-wider transition ${
              mode === m
                ? "bg-[var(--color-accent)] text-white shadow-sm"
                : "bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
            }`}
          >
            {m === "work" ? "Focus" : m === "short-break" ? "Pause" : "Long"}
          </button>
        ))}
      </div>

      {/* Ambient Noise Synthesis Control Station */}
      <div className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-2xl p-4 text-left space-y-2.5 mb-5">
        <p className="text-[10px] font-mono font-black uppercase tracking-wider text-[var(--color-text)] flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Ambiance de concentration
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "none", label: "Aucune", icon: <VolumeX className="w-3 h-3" /> },
            { id: "white-noise", label: "Pluie Zen", icon: <Volume2 className="w-3 h-3" /> },
            { id: "binaural", label: "Alpha", icon: <Volume2 className="w-3 h-3" /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => toggleAmbientSound(item.id as any)}
              className={`py-1.5 px-2 rounded-lg border text-[9px] font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                ambientSound === item.id
                  ? "bg-white text-[var(--color-accent)] border-[var(--color-accent)] shadow-sm font-black"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-transparent hover:border-[var(--color-border)]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clinic Study Advisor Quote */}
      <div className="text-xs text-[var(--color-text-muted)] leading-relaxed italic border-t border-[var(--color-border)]/55 pt-4 w-full">
        "{currentConfig.advice}"
      </div>

      {/* Daily Progress Counter */}
      <div className="grid grid-cols-2 gap-4 w-full border-t border-[var(--color-border)]/55 pt-4 mt-4 text-center">
        <div>
          <span className="block text-lg font-mono font-black text-[var(--color-text)]">{completedSessions}</span>
          <span className="text-[9px] font-mono uppercase font-semibold text-[var(--color-text-muted)]">Sessions finies</span>
        </div>
        <div>
          <span className="block text-lg font-mono font-black text-[var(--color-accent)]">{totalFocusTime} m</span>
          <span className="text-[9px] font-mono uppercase font-semibold text-[var(--color-text-muted)]">Temps de Focus</span>
        </div>
      </div>
    </div>
  );
};
