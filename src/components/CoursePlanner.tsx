import React, { useState, useEffect } from "react";
import { Calendar, Plus, Trash2, CheckCircle2, Circle, BookOpen, Clock, Sparkles } from "lucide-react";
import { useStudent } from "./StudentContext";
import { ALGERIAN_CURRICULUM } from "../data/curriculum";

interface PlannedCourse {
  id: string;
  day: string; // "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi" | "Dimanche"
  title: string;
  module: string;
  duration: number; // in minutes
  completed: boolean;
}

const DAYS_OF_WEEK = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export const CoursePlanner: React.FC = () => {
  const { student } = useStudent();
  const [plannedCourses, setPlannedCourses] = useState<PlannedCourse[]>([]);
  
  // Modal / Form States
  const [selectedDay, setSelectedDay] = useState("Lundi");
  const [newTitle, setNewTitle] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [newDuration, setNewDuration] = useState(45);

  // Load modules from current year config
  const currentYearKey = student?.academicYear || "Year 3";
  const yearConfig = ALGERIAN_CURRICULUM.find(y => y.key === currentYearKey) || ALGERIAN_CURRICULUM[2];
  const yearModules = yearConfig.units.flatMap((u) => u.modules.map((m) => m.frenchName));

  // Initialize planner on mount
  useEffect(() => {
    const storageKey = `med_planner_${student?.id || "anonymous"}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        setPlannedCourses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved planner", e);
      }
    } else {
      // Default initial study template for medical students
      const defaultTemplate: PlannedCourse[] = [
        {
          id: "def_1",
          day: "Lundi",
          title: "Sémiologie Digestive - Appendicite Aiguë",
          module: yearModules[0] || "Sémiologie",
          duration: 60,
          completed: true
        },
        {
          id: "def_2",
          day: "Mardi",
          title: "Pharmacologie - Pharmacocinétique générale",
          module: yearModules[1] || "Pharmacologie",
          duration: 90,
          completed: false
        },
        {
          id: "def_3",
          day: "Jeudi",
          title: "Anatomie Pathologique - Processus Tumoral",
          module: yearModules[3] || "Anatomie Pathologique",
          duration: 45,
          completed: false
        },
        {
          id: "def_4",
          day: "Samedi",
          title: "Microbiologie - Cocci à Gram Positif",
          module: yearModules[4] || "Microbiologie",
          duration: 120,
          completed: false
        }
      ];
      setPlannedCourses(defaultTemplate);
      localStorage.setItem(storageKey, JSON.stringify(defaultTemplate));
    }

    if (yearModules.length > 0) {
      setSelectedModule(yearModules[0]);
    }
  }, [student?.id, currentYearKey]);

  // Sync state back to localStorage
  const savePlanner = (updated: PlannedCourse[]) => {
    setPlannedCourses(updated);
    const storageKey = `med_planner_${student?.id || "anonymous"}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedModule) return;

    const newPlanned: PlannedCourse = {
      id: "plan_" + Math.random().toString(36).substring(2, 9),
      day: selectedDay,
      title: newTitle.trim(),
      module: selectedModule,
      duration: Number(newDuration),
      completed: false
    };

    const updated = [...plannedCourses, newPlanned];
    savePlanner(updated);
    setNewTitle("");
  };

  const toggleComplete = (id: string) => {
    const updated = plannedCourses.map(course => 
      course.id === id ? { ...course, completed: !course.completed } : course
    );
    savePlanner(updated);
  };

  const handleDeleteCourse = (id: string) => {
    const updated = plannedCourses.filter(course => course.id !== id);
    savePlanner(updated);
  };

  // Stats calculation
  const totalCourses = plannedCourses.length;
  const completedCount = plannedCourses.filter(c => c.completed).length;
  const completionRate = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;
  const totalDuration = plannedCourses.reduce((acc, c) => acc + (c.completed ? c.duration : 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="course-planner-layout">
      {/* Dynamic Progress Bento Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex items-center justify-between col-span-1 md:col-span-2">
          <div className="space-y-1.5 flex-1 text-left">
            <h4 className="font-serif font-black text-lg text-[var(--color-text)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--color-accent)] animate-pulse" /> Planner de Révision Hebdomadaire
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed font-sans">
              Organisez vos objectifs hebdomadaires pour la {student?.academicYear || "3ème Année"}. Planifiez vos cours par moudles de Sétif et suivez votre productivité.
            </p>

            {/* Custom Visual Progress Slider Bar */}
            <div className="pt-3">
              <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] mb-1.5">
                <span>Objectifs complétés</span>
                <span>{completionRate}%</span>
              </div>
              <div className="w-full bg-[var(--color-surface-hover)] rounded-full h-2 overflow-hidden border border-[var(--color-border)]">
                <div 
                  className="bg-[var(--color-accent)] h-full transition-all duration-500 ease-out"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Focus Time Metric Card */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 shadow-sm text-center flex flex-col justify-center space-y-2">
          <p className="text-3xl font-mono font-black text-[var(--color-accent)]">{totalDuration} min</p>
          <p className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)] tracking-wider">Temps de révision achevé</p>
          <div className="flex justify-center items-center gap-1.5 text-[10px] font-mono font-semibold text-[var(--color-text-muted)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" /> {completedCount} sur {totalCourses} cours validés
          </div>
        </div>
      </div>

      {/* Main planner grid & scheduler form layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Course scheduler quick form card */}
        <div className="bg-white border border-[var(--color-border)] rounded-[1.75rem] p-5 shadow-sm space-y-4 text-left lg:col-span-1">
          <h4 className="font-serif font-bold text-[#423F3A] text-md border-b border-[var(--color-border)] pb-2.5 flex items-center gap-2">
            <Plus className="w-4.5 h-4.5 text-[var(--color-accent)]" /> Planifier une Session
          </h4>

          <form onSubmit={handleAddCourse} className="space-y-4 font-mono text-xs">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-wider">Intitulé du Cours</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex. Sémiologie Digestive - Appendicite"
                className="w-full px-3 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl"
              />
            </div>

            {/* Module Picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-wider">Module</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl"
              >
                {yearModules.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Day and Duration Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-wider">Jour</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-[var(--color-text-muted)] tracking-wider">Durée (min)</label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" /> Planifier la session
            </button>
          </form>
        </div>

        {/* Planner grid: bento cards for each day */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[var(--color-border)] rounded-[2rem] p-6 shadow-sm space-y-6">
            <h4 className="font-serif font-black text-lg text-[var(--color-text)] border-b border-[var(--color-border)] pb-3 flex items-center gap-2 text-left">
              <BookOpen className="w-5 h-5 text-[var(--color-accent)]" /> Votre Agenda Hebdomadaire
            </h4>

            <div className="space-y-5 text-left">
              {DAYS_OF_WEEK.map((day) => {
                const dayCourses = plannedCourses.filter(c => c.day === day);
                return (
                  <div key={day} className="border-b border-[var(--color-border)]/55 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-mono font-black uppercase tracking-widest text-[var(--color-text)] px-2.5 py-1 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-lg">
                        {day}
                      </span>
                      {dayCourses.length === 0 && (
                        <span className="text-[10px] font-mono text-[var(--color-text-muted)] italic">Aucune tâche planifiée</span>
                      )}
                    </div>

                    {dayCourses.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {dayCourses.map((course) => (
                          <div 
                            key={course.id} 
                            className={`p-3.5 border rounded-xl flex items-center justify-between gap-4 transition-all duration-200 ${
                              course.completed 
                                ? "bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20" 
                                : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]/45"
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <button 
                                onClick={() => toggleComplete(course.id)}
                                className="mt-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition cursor-pointer shrink-0"
                              >
                                {course.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-[var(--color-accent)]" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>

                              <div className="space-y-0.5">
                                <p className={`text-xs font-semibold leading-relaxed ${
                                  course.completed ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text)]"
                                }`}>
                                  {course.title}
                                </p>
                                <div className="flex items-center gap-2.5 text-[9px] font-mono text-[var(--color-text-muted)]">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 text-[var(--color-accent)]" /> {course.module}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {course.duration} min
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button 
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-[var(--color-text-muted)] hover:text-red-500 transition cursor-pointer shrink-0 p-1 hover:bg-[var(--color-surface-hover)] rounded-md"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
