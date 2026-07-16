'use client';
import { useState, useMemo } from 'react';
import { Search, Pin, Lock, ArrowUpDown, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudent } from './StudentContext';
import { getYearConfig } from '../data/curriculum';

interface ModuleCard {
  id: string;
  title: string;
  type: 'unit' | 'independent' | 'clinical_locked';
  courseCount: number;
  iconType: 'heart_check' | 'stomach_shield' | 'heart_ekg' | 'microscope' | 'pill' | 'kidney_path' | 'dna' | 'bacteria' | 'fungus' | 'generic';
  curriculumName: string;
  isPinned?: boolean;
  isLocked?: boolean;
  requiredYear?: string;
}

interface ModuleGridProps {
  onSelectModule?: (moduleName: string) => void;
}

export default function ModuleGrid({ onSelectModule }: ModuleGridProps) {
  const { student } = useStudent();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'courses'>('name');
  const [filterType, setFilterType] = useState<'all' | 'unlocked' | 'locked'>('all');

  const currentYearConfig = useMemo(() => {
    return getYearConfig(student?.academicYear || 'Year 3');
  }, [student?.academicYear]);

  // Dynamically map modules of the current academic year
  const modulesList: ModuleCard[] = useMemo(() => {
    if (!currentYearConfig) return [];
    
    const list: ModuleCard[] = [];
    currentYearConfig.units.forEach((unit) => {
      unit.modules.forEach((mod) => {
        let iconType: ModuleCard['iconType'] = 'generic';
        const nameLower = mod.name.toLowerCase();
        
        if (nameLower.includes("anatomie") || nameLower.includes("membres") || nameLower.includes("viscérale")) {
          iconType = 'generic';
        } else if (nameLower.includes("physio")) {
          iconType = 'heart_ekg';
        } else if (nameLower.includes("chimie") || nameLower.includes("biochimie")) {
          iconType = 'microscope';
        } else if (nameLower.includes("pharmaco")) {
          iconType = 'pill';
        } else if (nameLower.includes("immuno")) {
          iconType = 'dna';
        } else if (nameLower.includes("microbio") || nameLower.includes("bactério")) {
          iconType = 'bacteria';
        } else if (nameLower.includes("parasito")) {
          iconType = 'fungus';
        } else if (nameLower.includes("cytologie") || nameLower.includes("cellulaire")) {
          iconType = 'dna';
        } else if (nameLower.includes("histologie") || nameLower.includes("embryologie")) {
          iconType = 'stomach_shield';
        } else if (nameLower.includes("biophysique")) {
          iconType = 'heart_ekg';
        } else if (nameLower.includes("informatique") || nameLower.includes("statistique")) {
          iconType = 'heart_check';
        } else if (nameLower.includes("humaines") || nameLower.includes("éthique") || nameLower.includes("français")) {
          iconType = 'generic';
        }

        // Keep Sémiologie pinned by default for Year 3, or Anatomie for Year 1
        const isPinned = nameLower.includes("sémiologie") || nameLower.includes("anatomie");

        list.push({
          id: mod.name.replace(/\s+/g, '_').toLowerCase(),
          title: mod.frenchName || mod.name,
          type: 'unit',
          courseCount: mod.courses.length,
          iconType: iconType,
          curriculumName: mod.name,
          isPinned: isPinned,
          isLocked: false
        });
      });
    });

    return list;
  }, [currentYearConfig]);

  // Filter and sort modules reactively
  const processedModules = useMemo(() => {
    let result = modulesList.filter((m) => {
      const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.curriculumName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchSearch;
    });

    // Pinned cards always stay at the very top, then sorted
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      } else {
        return b.courseCount - a.courseCount;
      }
    });
  }, [modulesList, searchQuery, sortBy, filterType]);

  // Render highly exquisite clinical vectors
  const renderMedicalVector = (type: string) => {
    switch (type) {
      case 'heart_check':
        return (
          <svg className="w-24 h-24 text-teal-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="15" y="10" width="70" height="80" rx="12" fill="#E6F4EA" stroke="#A8DAB5" strokeWidth="2" />
            <line x1="30" y1="30" x2="70" y2="30" stroke="#81C995" strokeWidth="4" strokeLinecap="round" />
            <line x1="30" y1="45" x2="55" y2="45" stroke="#81C995" strokeWidth="4" strokeLinecap="round" />
            <line x1="30" y1="60" x2="60" y2="60" stroke="#81C995" strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="55" r="22" fill="#FCE8E6" stroke="#F28B82" strokeWidth="2.5" className="animate-pulse" />
            <path d="M64 55L68 59L76 51" stroke="#D93025" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 55c0 10 8 18 18 18" stroke="#137333" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        );
      case 'stomach_shield':
        return (
          <svg className="w-24 h-24 text-orange-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 30C20 30 35 15 50 25C65 35 80 25 80 45C80 65 55 85 50 85C45 85 20 65 20 50" fill="#FEF7E0" stroke="#FDD663" strokeWidth="3" />
            <circle cx="50" cy="52" r="16" fill="#FEEFC3" stroke="#F9AB00" strokeWidth="2.5" />
            {/* Warning Hazard Triangle inside */}
            <path d="M50 42L59 58H41L50 42Z" fill="#F2994A" stroke="#E0842C" strokeWidth="1.5" />
            <line x1="50" y1="48" x2="50" y2="52" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="55" r="1" fill="white" />
          </svg>
        );
      case 'heart_ekg':
        return (
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 50H25L32 20L42 75L50 40L55 58L62 50H88" stroke="#D93025" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="42" cy="75" r="4" fill="#D93025" />
            <path d="M20 20C15 15 5 25 20 40C35 25 25 15 20 20Z" fill="#FCE8E6" />
          </svg>
        );
      case 'microscope':
        return (
          <svg className="w-24 h-24 text-blue-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="80" width="50" height="10" rx="4" fill="#E8F0FE" stroke="#ADC1F9" strokeWidth="2" />
            <path d="M35 80V50C35 40 45 35 50 35" stroke="#4285F4" strokeWidth="4" strokeLinecap="round" />
            <rect x="42" y="20" width="16" height="30" rx="3" transform="rotate(15 50 35)" fill="#D2E3FC" stroke="#1A73E8" strokeWidth="2" />
            <circle cx="58" cy="45" r="8" fill="#FFF" stroke="#4285F4" strokeWidth="2" />
            <circle cx="58" cy="45" r="3" fill="#34A853" />
          </svg>
        );
      case 'pill':
        return (
          <svg className="w-24 h-24 text-indigo-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="45" width="45" height="22" rx="11" transform="rotate(-30 20 45)" fill="#E8EAF6" stroke="#9FA8DA" strokeWidth="2" />
            <path d="M41 33L53 53" stroke="#3F51B5" strokeWidth="2.5" />
            <rect x="45" y="55" width="40" height="18" rx="9" transform="rotate(25 45 55)" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
            <circle cx="28" cy="22" r="3" fill="#818CF8" />
            <circle cx="78" cy="72" r="4" fill="#38BDF8" className="animate-bounce" />
          </svg>
        );
      case 'kidney_path':
        return (
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Elegant simplified renal/filtration path */}
            <path d="M35 25C25 35 25 65 35 75C45 80 55 70 50 50C55 30 45 20 35 25Z" fill="#F3E5F5" stroke="#AB47BC" strokeWidth="2" />
            <path d="M65 25C75 35 75 65 65 75C55 80 45 70 50 50C45 30 55 20 65 25Z" fill="#F3E5F5" stroke="#AB47BC" strokeWidth="2" />
            <path d="M50 50C50 50 50 85 45 90" stroke="#7B1FA2" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 50C50 50 50 85 55 90" stroke="#7B1FA2" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'dna':
        return (
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 20C40 35 60 65 70 80" stroke="#00796B" strokeWidth="3" strokeLinecap="round" />
            <path d="M70 20C60 35 40 65 30 80" stroke="#00BFA5" strokeWidth="3" strokeLinecap="round" />
            <line x1="34" y1="28" x2="66" y2="28" stroke="#26A69A" strokeWidth="2" />
            <line x1="38" y1="38" x2="62" y2="38" stroke="#26A69A" strokeWidth="2" />
            <line x1="44" y1="50" x2="56" y2="50" stroke="#26A69A" strokeWidth="2" />
            <line x1="38" y1="62" x2="62" y2="62" stroke="#26A69A" strokeWidth="2" />
            <line x1="34" y1="72" x2="66" y2="72" stroke="#26A69A" strokeWidth="2" />
          </svg>
        );
      case 'bacteria':
        return (
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="25" fill="#E0F2F1" stroke="#009688" strokeWidth="3" />
            <circle cx="42" cy="42" r="5" fill="#00796B" />
            <circle cx="58" cy="45" r="3" fill="#00796B" />
            <circle cx="48" cy="58" r="4" fill="#00796B" />
            {/* flagella */}
            <path d="M25 50C15 48 10 55 5 50" stroke="#009688" strokeWidth="2" strokeLinecap="round" />
            <path d="M28 38C18 32 15 40 8 36" stroke="#009688" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'fungus':
        return (
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 75V50" stroke="#8D6E63" strokeWidth="4" strokeLinecap="round" />
            <path d="M30 50C30 35 70 35 70 50H30Z" fill="#EFEBE9" stroke="#5D4037" strokeWidth="3" />
            <circle cx="40" cy="42" r="3" fill="#D7CCC8" />
            <circle cx="55" cy="45" r="4" fill="#D7CCC8" />
            <circle cx="48" cy="38" r="2.5" fill="#D7CCC8" />
          </svg>
        );
      default:
        return (
          <svg className="w-24 h-24 text-gray-400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="30" width="40" height="40" rx="8" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="2.5" />
            <line x1="40" y1="50" x2="60" y2="50" stroke="#BDBDBD" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="40" x2="50" y2="60" stroke="#BDBDBD" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-2 px-4 space-y-8" id="visual-modules-container">
      {/* Search and Filters Hub */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0D0E12]/50 border border-[#E6E2D8] dark:border-[#1B1E26] shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un module ou unité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-5 py-3 rounded-2xl bg-[#FAF9F6] dark:bg-[#11131a]/60 border border-[#E6E2D8] dark:border-[#1b1e28] text-sm text-[#423F3A] dark:text-[#FAF9F6] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7D8C61] transition-all"
            id="module-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Sort selector tab */}
          <button
            onClick={() => setSortBy(sortBy === 'name' ? 'courses' : 'name')}
            className="px-4 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#11131a]/60 border border-[#E6E2D8] dark:border-[#1b1e28] hover:border-[#7D8C61] text-xs font-mono font-bold text-[#423F3A] dark:text-[#FAF9F6] flex items-center gap-2 transition-all cursor-pointer select-none"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#7D8C61]" />
            Trier: {sortBy === 'name' ? 'Nom' : 'Cours'}
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      {processedModules.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#0D0E12]/50 border border-[#E6E2D8] dark:border-[#1B1E26] rounded-3xl">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-[#423F3A] dark:text-[#FAF9F6] font-medium">Aucun module ne correspond à vos critères.</p>
          <p className="text-xs text-gray-400 mt-1">Réessayez en modifiant vos mots-clés ou filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {processedModules.map((mod) => (
              <motion.div
                key={mod.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  if (!mod.isLocked) {
                    onSelectModule?.(mod.curriculumName);
                  }
                }}
                className={`group relative rounded-3xl bg-white dark:bg-[#0E1017]/80 border transition-all duration-300 p-5 flex flex-col justify-between overflow-hidden h-[300px] select-none ${
                  mod.isLocked
                    ? 'border-[#E6E2D8]/50 dark:border-[#1A1D26] cursor-not-allowed filter grayscale-[10%]'
                    : 'border-[#E6E2D8] dark:border-[#1C1F2B] hover:border-[#7D8C61] hover:shadow-xl dark:hover:shadow-black/20 cursor-pointer hover:-translate-y-1'
                }`}
                id={`visual-module-card-${mod.id}`}
              >
                {/* Ribbon Headers */}
                <div className="flex items-center justify-between w-full relative z-10">
                  {/* Pin button on top left */}
                  <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                    <Pin className={`w-3.5 h-3.5 ${mod.isPinned ? 'text-[#FF6B35] fill-[#FF6B35]' : 'text-gray-300 dark:text-gray-600'}`} />
                  </div>

                  {/* Course count badge on top right */}
                  <span className={`px-2.5 py-1 text-[10px] font-sans font-semibold rounded-full border ${
                    mod.isLocked
                      ? 'bg-gray-100 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-800'
                      : 'bg-[#E6F4EA] dark:bg-[#137333]/20 text-[#137333] dark:text-[#81C995] border-[#CEEAD6] dark:border-[#81C995]/20'
                  }`}>
                    {mod.courseCount} cours
                  </span>
                </div>

                {/* Central Beautiful Vector illustration */}
                <div className="flex items-center justify-center py-4 relative z-10 transition-transform duration-300 group-hover:scale-105">
                  {renderMedicalVector(mod.iconType)}
                </div>

                {/* Card Title & Meta bottom info */}
                <div className="text-center relative z-10 mt-auto">
                  <h3 className="text-xs font-bold text-[#423F3A] dark:text-[#FAF9F6] tracking-tight truncate leading-tight uppercase group-hover:text-[#7D8C61] dark:group-hover:text-[#8CA365] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mt-1">
                    {mod.isLocked ? `${mod.requiredYear} requis` : `${mod.type} actif`}
                  </p>
                </div>

                {/* Locked Glassmorphic Padlock Overlay */}
                {mod.isLocked && (
                  <div className="absolute inset-0 bg-[#FFF]/40 dark:bg-[#000]/50 backdrop-blur-[1.5px] flex flex-col items-center justify-center p-4 z-20 transition-all group-hover:backdrop-blur-[2.5px]">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-[#171A22] shadow-md border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-2">
                      <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Unité Verrouillée
                    </span>
                    <span className="text-[8px] font-mono text-gray-400 dark:text-gray-500 uppercase mt-0.5">
                      Niveau {mod.requiredYear}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
