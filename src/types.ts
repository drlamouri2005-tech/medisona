export type AcademicYear = "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6" | "Residanat";

export const ALL_ACADEMIC_YEARS: AcademicYear[] = [
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "Residanat"
];

export interface Question {
  id: string;
  academicYear: AcademicYear;
  unit?: string; // e.g. "Basic Medical Sciences" (Path A) - blank means Path B (Free Standalone Modules)
  module: string; // e.g. "Anatomy", "Microbiology"
  course: string; // e.g. "Cardiovascular Anatomy", "Bacterial Staining"
  text: string; // The clinical vignette or question body
  choices: string[]; // Choices A to E (exactly 5 choices)
  correctAnswer?: number; // Index 0 to 4 (representing A, B, C, D, E) (legacy single-choice)
  correctAnswers?: number[]; // Array of correct indices (supporting multiple-choice QCM)
  explanation: string; // Comprehensive medical rationale
  examYear: string; // e.g. "2022", "2023"
  sessionType: "Normal" | "Rattrapage";
  is_residanat_origin?: boolean; // Flag to indicate if this question comes from a Residency exam
  target_undergrad_year?: string; // Earnliest undergrad year (e.g. "1" to "6") where this module/course is taught
  classification?: {
    cycle_code: string;
    year_code: string;
    module_code: string;
    sub_unit_code: string | null;
    primary_topic: string;
    confidence_score: number;
  };
  metadata?: {
    is_pediatric: boolean;
    is_emergency: boolean;
    is_obstetric_gynaeco: boolean;
  };
}

export interface StudentProfile {
  id: string;
  name: string;
  academicYear: AcademicYear;
  joinedAt: string;
  email?: string;
  isAdmin?: boolean;
  streakCount?: number;
  lastActivityDate?: string | null;
}

export interface QuestionProgress {
  questionId: string;
  selectedChoice?: number; // legacy single-choice
  selectedChoices?: number[]; // indices of selected choices for QCM
  correct: boolean;
  answeredAt: string;
}

export interface StudentProgress {
  studentId: string;
  answers: { [questionId: string]: QuestionProgress };
}

export interface PersonalNote {
  id: string;
  text: string;
  createdAt: string;
  unit?: string;
  module?: string;
}

export interface BugReport {
  id: string;
  studentId: string;
  studentName: string;
  questionId: string;
  questionText: string;
  details: string;
  createdAt: string;
  status: "Pending" | "Reviewed" | "Resolved";
}

export interface KnownCourse {
  id: string;
  academicYear: AcademicYear;
  module: string;
  course: string;
  addedAt: string;
}

export interface CommunityAdvice {
  id: string;
  authorName: string;
  authorYear: AcademicYear | "Alumni" | "Admin" | "General";
  text: string;
  category: string;
  unit?: string;
  module?: string;
  likesCount: number;
  likedBy: string[];
  createdAt: string;
}


