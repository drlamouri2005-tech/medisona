import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  pulseSpeed: number;
  pulseOffset: number;
}

export const MolecularBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking with springs for fluid, lag-free motion response
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 120, mass: 1 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const { width, height } = dimensions;

    canvas.width = width;
    canvas.height = height;

    // Generate clinical microscopic nodes
    const nodeCount = Math.min(45, Math.floor((width * height) / 25000) + 15);
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 2.5 + 1,
      pulseSpeed: 0.01 + Math.random() * 0.02,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      
      // Clinical grid lines background (resembling laboratory notebooks or medical imaging grids)
      ctx.strokeStyle = isDark ? "rgba(125, 140, 97, 0.025)" : "rgba(125, 140, 97, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 45;
      
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const curMouseX = smoothMouseX.get();
      const curMouseY = smoothMouseY.get();

      // Update and draw connections
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];

        // Slowly float
        n1.x += n1.vx;
        n1.y += n1.vy;

        // Bounce bounds
        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        // Interactive mouse parallax drift (gently repels/attracts the molecular lattice)
        const dx = n1.x - curMouseX;
        const dy = n1.y - curMouseY;
        const distToMouse = Math.hypot(dx, dy);
        const influenceRadius = 250;

        if (distToMouse < influenceRadius) {
          const force = (influenceRadius - distToMouse) / influenceRadius;
          n1.x += (dx / distToMouse) * force * 0.6;
          n1.y += (dy / distToMouse) * force * 0.6;
        }

        // Draw node pulse glow
        const pulse = Math.sin(frame * n1.pulseSpeed + n1.pulseOffset);
        const alpha = 0.25 + (pulse + 1) * 0.25; // 0.25 to 0.75 pulsing alpha
        const glowRadius = n1.size * (2 + (pulse + 1) * 0.5);

        ctx.beginPath();
        ctx.arc(n1.x, n1.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = isDark 
          ? `rgba(140, 163, 101, ${alpha * 0.15})` 
          : `rgba(125, 140, 97, ${alpha * 0.1})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n1.x, n1.y, n1.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "rgba(140, 163, 101, 0.75)" : "rgba(125, 140, 97, 0.65)";
        ctx.fill();

        // Connect nodes to neighboring nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          const maxDistance = 140;

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = isDark
              ? `rgba(140, 163, 101, ${lineAlpha})`
              : `rgba(125, 140, 97, ${lineAlpha * 0.8})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    if (width > 0 && height > 0) {
      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, smoothMouseX, smoothMouseY]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
