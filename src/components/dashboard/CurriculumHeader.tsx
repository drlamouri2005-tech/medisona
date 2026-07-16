'use client';
import { motion } from 'motion/react';

interface CurriculumHeaderProps {
  userSubscribedYear: number | string; // e.g., 2 or "2ème Année"
}

export default function CurriculumHeader({ userSubscribedYear }: CurriculumHeaderProps) {
  // Format matching the level text safely without rendering multi-year buttons
  const systemYearLabel = typeof userSubscribedYear === 'number' 
    ? `${userSubscribedYear}ème Année` 
    : userSubscribedYear;

  return (
    <div className="w-full max-w-6xl mx-auto mb-6 text-left">
      {/* 
        CLEAN RETROFIT: Removed multi-year cohort navigation buttons entirely. 
        Only the authorized curriculum layer is initialized into the DOM.
      */}
      <div className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.04] backdrop-blur-xl relative overflow-hidden">
        {/* Cinematic abstract alignment grid element */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,93,78,0.08)_0%,transparent_50%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4A5D4E] animate-pulse" />
              <span className="text-[#FF6B35] font-mono text-xs uppercase tracking-[0.2em]">
                Isolated Security Node
              </span>
            </div>
            <h1 className="text-3xl font-serif text-[#F4F4F2] tracking-tight">
              Active Path: {systemYearLabel}
            </h1>
            <p className="text-[#8A8A82] text-xs max-w-xl font-sans">
              Displaying official courses, lectures, and diagnostic mock papers strictly matching your validated subscription tier. Adjacent curriculum years are locked and structurally isolated.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-end">
              <span className="text-[10px] font-mono text-[#8A8A82] uppercase tracking-wider">Tier Validation</span>
              <span className="text-sm font-medium text-[#F4F4F2] font-sans">Authorized Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
