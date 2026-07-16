import React, { createContext, useContext, useState, useEffect } from "react";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { StudentProfile, StudentProgress, PersonalNote, AcademicYear, QuestionProgress, Question, KnownCourse, CommunityAdvice } from "../types";
import { SAMPLE_QUESTIONS } from "../data/questions";

interface StudentContextType {
  student: StudentProfile | null;
  progress: StudentProgress | null;
  notes: PersonalNote[];
  isLoading: boolean;
  registerStudent: (name: string, academicYear: AcademicYear) => Promise<void>;
  signInStudent: (email: string, password: string) => Promise<void>;
  signUpStudent: (name: string, email: string, password: string, academicYear: AcademicYear) => Promise<void>;
  signInWithGoogle: (preferredYear?: AcademicYear) => Promise<void>;
  signOutStudent: () => Promise<void>;
  forceActivateSession: () => Promise<void>;
  isSessionTerminated: boolean;
  updateAcademicYear: (academicYear: AcademicYear) => Promise<void>;
  submitAnswer: (questionId: string, selectedChoiceOrChoices: number | number[], correct: boolean) => Promise<void>;
  addNote: (text: string, unit?: string, module?: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  submitBugReport: (questionId: string, questionText: string, details: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  resetSessionProgress: (questionIds: string[]) => Promise<void>;
  customQuestions: Question[];
  allQuestions: Question[];
  uploadQuestion: (q: Question) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  loadCustomQuestions: () => Promise<void>;
  knownCourses: KnownCourse[];
  addKnownCourse: (c: KnownCourse) => Promise<void>;
  deleteKnownCourse: (id: string) => Promise<void>;
  loadKnownCourses: () => Promise<void>;
  communityAdvices: CommunityAdvice[];
  addCommunityAdvice: (text: string, category: string, unit?: string, module?: string) => Promise<void>;
  likeCommunityAdvice: (id: string) => Promise<void>;
  deleteCommunityAdvice: (id: string) => Promise<void>;
  adminEmails: string[];
  addAdminEmail: (email: string) => Promise<void>;
  removeAdminEmail: (email: string) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [isSessionTerminated, setIsSessionTerminated] = useState<boolean>(false);
  const [knownCourses, setKnownCourses] = useState<KnownCourse[]>([]);
  const [communityAdvices, setCommunityAdvices] = useState<CommunityAdvice[]>([]);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);

  // Real-time listener for admin emails list
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, "adminEmails"), (snapshot) => {
        const emails: string[] = [];
        snapshot.forEach((doc) => {
          emails.push(doc.id);
        });
        setAdminEmails(emails);
      }, (error) => {
        console.error("Failed to sync admin emails:", error);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up admin emails query:", err);
    }
  }, []);

  const addAdminEmail = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    try {
      await setDoc(doc(db, "adminEmails", cleanEmail), {
        email: cleanEmail,
        addedBy: student?.email || "system",
        addedAt: new Date().toISOString()
      });

      const q = query(collection(db, "students"), where("email", "==", cleanEmail));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnap) => {
        await updateDoc(doc(db, "students", docSnap.id), { isAdmin: true });
      });
    } catch (error) {
      console.error("Failed to add admin email:", error);
      throw error;
    }
  };

  const removeAdminEmail = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    try {
      await deleteDoc(doc(db, "adminEmails", cleanEmail));

      if (cleanEmail !== "aniswalid511@gmail.com" && cleanEmail !== "anislekehel4@gmail.com") {
        const q = query(collection(db, "students"), where("email", "==", cleanEmail));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnap) => {
          await updateDoc(doc(db, "students", docSnap.id), { isAdmin: false });
        });
      }
    } catch (error) {
      console.error("Failed to remove admin email:", error);
      throw error;
    }
  };

  // Load custom courses
  const loadKnownCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "knownCourses"));
      const loaded: KnownCourse[] = [];
      querySnapshot.forEach((doc) => {
        loaded.push(doc.data() as KnownCourse);
      });
      loaded.sort((a, b) => {
        if (a.module !== b.module) return a.module.localeCompare(b.module);
        return a.course.localeCompare(b.course);
      });
      setKnownCourses(loaded);
    } catch (error) {
      console.error("Failed to load known courses from Firestore:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.GET, "knownCourses");
      }
    }
  };

  // Derived all questions (combine static and dynamic)
  const allQuestions = [...SAMPLE_QUESTIONS, ...customQuestions];

  // Load custom questions
  const loadCustomQuestions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "questions"));
      const loaded: Question[] = [];
      querySnapshot.forEach((doc) => {
        loaded.push(doc.data() as Question);
      });
      setCustomQuestions(loaded);
    } catch (error) {
      console.error("Failed to load custom questions from Firestore:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.GET, "questions");
      }
    }
  };

  useEffect(() => {
    loadCustomQuestions();
    loadKnownCourses();
  }, []);

  useEffect(() => {
    try {
      const q = query(collection(db, "communityAdvices"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loaded: CommunityAdvice[] = [];
        snapshot.forEach((doc) => {
          loaded.push(doc.data() as CommunityAdvice);
        });
        setCommunityAdvices(loaded);
      }, (error) => {
        console.error("Failed to sync community advices:", error);
        const isPermissionError = error instanceof Error && (
          error.message.includes("permission") || 
          error.message.includes("Permission") || 
          error.message.includes("insufficient")
        );
        if (isPermissionError) {
          handleFirestoreError(error, OperationType.GET, "communityAdvices");
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up community advices query:", err);
    }
  }, []);

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const recordActivity = async () => {
    if (!student) return;
    const todayStr = getLocalDateString();
    const currentStreak = student.streakCount || 0;
    const lastDate = student.lastActivityDate || null;

    let newStreak = currentStreak;
    if (!lastDate) {
      newStreak = 1;
    } else if (lastDate === todayStr) {
      // Already recorded for today, do nothing
      return;
    } else if (lastDate === getYesterdayDateString()) {
      newStreak = currentStreak + 1;
    } else {
      newStreak = 1;
    }

    const updatedStudent = {
      ...student,
      streakCount: newStreak,
      lastActivityDate: todayStr
    };
    setStudent(updatedStudent);

    if (student.id === "offline_user") {
      localStorage.setItem("med_student_streak_count", String(newStreak));
      localStorage.setItem("med_student_last_activity", todayStr);
    } else {
      try {
        await updateDoc(doc(db, "students", student.id), {
          streakCount: newStreak,
          lastActivityDate: todayStr
        });
      } catch (error) {
        console.error("Failed to update streak in Firestore:", error);
      }
    }
  };

  // 1. Initial Load with Firebase Auth and real-time device session monitoring
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        localStorage.setItem("med_student_id", uid);
        try {
          const docRef = doc(db, "students", uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const email = user.email || data.email || "";
            let isAdmin = data.isAdmin || 
                          email.toLowerCase() === "aniswalid511@gmail.com" || 
                          email.toLowerCase() === "anislekehel4@gmail.com" ||
                          data.academicYear === "Residanat";

            if (!isAdmin && email) {
              const adminSnap = await getDoc(doc(db, "adminEmails", email.toLowerCase()));
              if (adminSnap.exists()) {
                isAdmin = true;
              }
            }

            // Streak logic
            const currentStreak = data.streakCount || 0;
            const lastDate = data.lastActivityDate || null;
            const todayStr = getLocalDateString();
            const yesterdayStr = getYesterdayDateString();

            let finalStreak = currentStreak;
            if (lastDate && lastDate !== todayStr && lastDate !== yesterdayStr) {
              finalStreak = 0;
              // Reset in database asynchronously to keep load snappy
              updateDoc(docRef, { streakCount: 0 }).catch(err => console.error("Streak reset failed", err));
            }

            setStudent({
              id: uid,
              name: data.name,
              academicYear: data.academicYear,
              joinedAt: data.joinedAt || new Date().toISOString(),
              email,
              isAdmin,
              streakCount: finalStreak,
              lastActivityDate: lastDate
            });
            setProgress({
              studentId: uid,
              answers: data.answers || {}
            });
            setNotes(data.notes || []);

            // Handle Device Session Registration
            let localSessionToken = localStorage.getItem("med_device_session_id");
            if (!localSessionToken) {
              localSessionToken = "dev_" + Math.random().toString(36).substring(2, 15);
              localStorage.setItem("med_device_session_id", localSessionToken);
            }

            // Ensure our device token is the active one in Firestore
            await updateDoc(docRef, {
              activeSessionToken: localSessionToken,
              lastActiveAt: new Date().toISOString(),
              ...(isAdmin && !data.isAdmin ? { isAdmin: true } : {}),
              ...(!data.email && email ? { email } : {})
            });
          } else {
            // Document doesn't exist yet (e.g., first-time Google sign-in redirect/popup)
            // Create user profile on-the-fly to prevent stuck states
            const defaultName = user.displayName || "Google Student";
            const defaultYear = (localStorage.getItem("med_student_year") as AcademicYear) || "Year 3";
            const deviceSessionToken = localStorage.getItem("med_device_session_id") || "dev_" + Math.random().toString(36).substring(2, 15);
            localStorage.setItem("med_device_session_id", deviceSessionToken);
            localStorage.setItem("med_student_id", uid);
            const email = user.email || "";
            let isAdmin = email.toLowerCase() === "aniswalid511@gmail.com" || 
                          email.toLowerCase() === "anislekehel4@gmail.com";

            if (!isAdmin && email) {
              const adminSnap = await getDoc(doc(db, "adminEmails", email.toLowerCase()));
              if (adminSnap.exists()) {
                isAdmin = true;
              }
            }

            await setDoc(docRef, {
              name: defaultName,
              academicYear: defaultYear,
              joinedAt: new Date().toISOString(),
              answers: {},
              notes: [],
              email: email,
              activeSessionToken: deviceSessionToken,
              lastActiveAt: new Date().toISOString(),
              isAdmin: isAdmin,
              streakCount: 0,
              lastActivityDate: null
            });

            setStudent({
              id: uid,
              name: defaultName,
              academicYear: defaultYear,
              joinedAt: new Date().toISOString(),
              email,
              isAdmin,
              streakCount: 0,
              lastActivityDate: null
            });
            setProgress({
              studentId: uid,
              answers: {}
            });
            setNotes([]);
          }
        } catch (error) {
          console.error("Error fetching student profile on auth change:", error);
        }
      } else {
        const cachedId = localStorage.getItem("med_student_id");
        if (cachedId === "offline_user") {
          const offlineName = localStorage.getItem("med_student_name");
          const offlineYear = localStorage.getItem("med_student_year") as AcademicYear;
          if (offlineName && offlineYear) {
            const cachedStreak = Number(localStorage.getItem("med_student_streak_count") || "0");
            const cachedLastActivity = localStorage.getItem("med_student_last_activity") || null;

            // Check streak expiration for offline user
            const todayStr = getLocalDateString();
            const yesterdayStr = getYesterdayDateString();
            let finalStreak = cachedStreak;
            if (cachedLastActivity && cachedLastActivity !== todayStr && cachedLastActivity !== yesterdayStr) {
              finalStreak = 0;
              localStorage.setItem("med_student_streak_count", "0");
            }

            setStudent({
              id: "offline_user",
              name: offlineName,
              academicYear: offlineYear,
              joinedAt: new Date().toISOString(),
              streakCount: finalStreak,
              lastActivityDate: cachedLastActivity,
              isAdmin: offlineYear === "Residanat"
            });

            let initialAnswers = {};
            try {
              const savedAnswers = localStorage.getItem("med_student_answers");
              if (savedAnswers && savedAnswers !== "undefined") {
                initialAnswers = JSON.parse(savedAnswers);
              }
            } catch (err) {
              console.error("Error parsing med_student_answers from localStorage:", err);
            }

            let initialNotes = [];
            try {
              const savedNotes = localStorage.getItem("med_student_notes");
              if (savedNotes && savedNotes !== "undefined") {
                initialNotes = JSON.parse(savedNotes);
              }
            } catch (err) {
              console.error("Error parsing med_student_notes from localStorage:", err);
            }

            setProgress({
              studentId: "offline_user",
              answers: initialAnswers
            });
            setNotes(initialNotes);
          }
        } else {
          setStudent(null);
          setProgress(null);
          setNotes([]);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1b. Real-Time Active Session Checker (1-Device lock)
  useEffect(() => {
    if (!student || student.id === "offline_user") {
      setIsSessionTerminated(false);
      return;
    }

    const docRef = doc(db, "students", student.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const localSessionToken = localStorage.getItem("med_device_session_id");

        if (data.activeSessionToken && data.activeSessionToken !== localSessionToken) {
          setIsSessionTerminated(true);
        } else {
          setIsSessionTerminated(false);
          // Sync answers and notes in real-time
          setProgress({
            studentId: student.id,
            answers: data.answers || {}
          });
          setNotes(data.notes || []);
        }
      }
    }, (error) => {
      console.error("Error in real-time student listener:", error);
    });

    return () => unsubscribe();
  }, [student?.id]);

  // 2. Register Student
  const registerStudent = async (name: string, academicYear: AcademicYear) => {
    setIsLoading(true);
    try {
      const studentId = "student_" + Math.random().toString(36).substring(2, 11);
      const isAdmin = academicYear === "Residanat";
      const newStudent: StudentProfile = {
        id: studentId,
        name,
        academicYear,
        joinedAt: new Date().toISOString(),
        streakCount: 0,
        lastActivityDate: null,
        isAdmin
      };

      // Save to Firestore
      await setDoc(doc(db, "students", studentId), {
        name,
        academicYear,
        joinedAt: newStudent.joinedAt,
        answers: {},
        notes: [],
        streakCount: 0,
        lastActivityDate: null,
        isAdmin
      });

      // Save locally
      localStorage.setItem("med_student_id", studentId);
      localStorage.setItem("med_student_name", name);
      localStorage.setItem("med_student_year", academicYear);

      setStudent(newStudent);
      setProgress({ studentId, answers: {} });
      setNotes([]);
    } catch (error) {
      console.error("Failed to register student on Firestore, using offline storage:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.CREATE, "students");
      }
      const studentId = "offline_user";
      localStorage.setItem("med_student_id", studentId);
      localStorage.setItem("med_student_name", name);
      localStorage.setItem("med_student_year", academicYear);
      setStudent({ id: studentId, name, academicYear, joinedAt: new Date().toISOString(), streakCount: 0, lastActivityDate: null, isAdmin: academicYear === "Residanat" });
      setProgress({ studentId, answers: {} });
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Update Academic Year (Strict access control update)
  const updateAcademicYear = async (academicYear: AcademicYear) => {
    if (!student) return;
    try {
      const isAdmin = student.isAdmin || academicYear === "Residanat";
      const updatedStudent = { ...student, academicYear, isAdmin };
      setStudent(updatedStudent);
      localStorage.setItem("med_student_year", academicYear);

      if (student.id !== "offline_user") {
        await updateDoc(doc(db, "students", student.id), { 
          academicYear,
          ...(isAdmin ? { isAdmin: true } : {})
        });
      }
    } catch (error) {
      console.error("Failed to update academic year in Firestore:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.UPDATE, "students/" + student.id);
      }
    }
  };

  // 4. Submit Answer
  const submitAnswer = async (questionId: string, selectedChoiceOrChoices: number | number[], correct: boolean) => {
    if (!student || !progress) return;

    const isArray = Array.isArray(selectedChoiceOrChoices);
    const newAnswer: QuestionProgress = {
      questionId,
      selectedChoice: isArray ? selectedChoiceOrChoices[0] : selectedChoiceOrChoices,
      selectedChoices: isArray ? selectedChoiceOrChoices : [selectedChoiceOrChoices],
      correct,
      answeredAt: new Date().toISOString()
    };

    const updatedAnswers = {
      ...progress.answers,
      [questionId]: newAnswer
    };

    setProgress({
      ...progress,
      answers: updatedAnswers
    });

    // Save offline backup
    localStorage.setItem("med_student_answers", JSON.stringify(updatedAnswers));

    try {
      if (student.id !== "offline_user") {
        await updateDoc(doc(db, "students", student.id), {
          answers: updatedAnswers
        });
      }
      await recordActivity();
    } catch (error) {
      console.error("Failed to save answer to Firestore:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.UPDATE, "students/" + student.id);
      }
    }
  };

  // 5. Add Personal Note
  const addNote = async (text: string, unit?: string, module?: string) => {
    if (!student) return;

    const newNote: PersonalNote = {
      id: "note_" + Math.random().toString(36).substring(2, 11),
      text,
      createdAt: new Date().toISOString(),
      ...(unit ? { unit } : {}),
      ...(module ? { module } : {})
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem("med_student_notes", JSON.stringify(updatedNotes));

    try {
      if (student.id !== "offline_user") {
        await updateDoc(doc(db, "students", student.id), {
          notes: updatedNotes
        });
      }
      await recordActivity();
    } catch (error) {
      console.error("Failed to save note to Firestore:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.UPDATE, "students/" + student.id);
      }
    }
  };

  // 6. Delete Note
  const deleteNote = async (id: string) => {
    if (!student) return;

    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem("med_student_notes", JSON.stringify(updatedNotes));

    try {
      if (student.id !== "offline_user") {
        await updateDoc(doc(db, "students", student.id), {
          notes: updatedNotes
        });
      }
    } catch (error) {
      console.error("Failed to delete note from Firestore:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.UPDATE, "students/" + student.id);
      }
    }
  };

  // 7. Submit Bug/Error Signal Report
  const submitBugReport = async (questionId: string, questionText: string, details: string) => {
    if (!student) return;

    try {
      const reportData = {
        studentId: student.id,
        studentName: student.name,
        questionId,
        questionText,
        details,
        createdAt: new Date().toISOString(),
        status: "Pending"
      };

      await addDoc(collection(db, "bugReports"), reportData);
    } catch (error) {
      console.error("Failed to save bug report to Firestore:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.CREATE, "bugReports");
      }
    }
  };

  // 8. Reset Progress
  const resetProgress = async () => {
    if (!student) return;
    setProgress({ studentId: student.id, answers: {} });
    localStorage.setItem("med_student_answers", "{}");

    try {
      if (student.id !== "offline_user") {
        await updateDoc(doc(db, "students", student.id), {
          answers: {}
        });
      }
    } catch (error) {
      console.error("Failed to reset progress in Firestore:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.UPDATE, "students/" + student.id);
      }
    }
  };

  // 8b. Reset Session Progress (only for specific questions in current active session)
  const resetSessionProgress = async (questionIds: string[]) => {
    if (!student || !progress) return;
    
    // Create updated answers object excluding specified questions
    const updatedAnswers = { ...progress.answers };
    questionIds.forEach((id) => {
      delete updatedAnswers[id];
    });

    setProgress({
      ...progress,
      answers: updatedAnswers
    });

    localStorage.setItem("med_student_answers", JSON.stringify(updatedAnswers));

    try {
      if (student.id !== "offline_user") {
        await updateDoc(doc(db, "students", student.id), {
          answers: updatedAnswers
        });
      }
    } catch (error) {
      console.error("Failed to reset session progress in Firestore:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.UPDATE, "students/" + student.id);
      }
    }
  };

  // 9. Upload Custom Question
  const uploadQuestion = async (q: Question) => {
    try {
      await setDoc(doc(db, "questions", q.id), q);
      await loadCustomQuestions();
    } catch (error) {
      console.error("Failed to upload custom question:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.WRITE, "questions/" + q.id);
      }
      throw error;
    }
  };

  // 10. Delete Custom Question
  const deleteQuestion = async (id: string) => {
    try {
      await deleteDoc(doc(db, "questions", id));
      await loadCustomQuestions();
    } catch (error) {
      console.error("Failed to delete custom question:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.DELETE, "questions/" + id);
      }
      throw error;
    }
  };

  // 11. Add Known Course (Curriculum Mapping Guides)
  const addKnownCourse = async (c: KnownCourse) => {
    try {
      await setDoc(doc(db, "knownCourses", c.id), c);
      await loadKnownCourses();
    } catch (error) {
      console.error("Failed to add custom course:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.WRITE, "knownCourses/" + c.id);
      }
      throw error;
    }
  };

  // 12. Delete Known Course
  const deleteKnownCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, "knownCourses", id));
      await loadKnownCourses();
    } catch (error) {
      console.error("Failed to delete custom course:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.DELETE, "knownCourses/" + id);
      }
      throw error;
    }
  };

  // 13. Add Community Advice Post
  const addCommunityAdvice = async (
    text: string,
    category: string,
    unit?: string,
    module?: string
  ) => {
    const id = "advice_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    try {
      const authorName = student?.name || "Anonymous Doctor";
      const authorYear = student?.academicYear || "General";
      const advice: CommunityAdvice = {
        id,
        authorName,
        authorYear,
        text,
        category,
        ...(unit ? { unit } : {}),
        ...(module ? { module } : {}),
        likesCount: 0,
        likedBy: [],
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "communityAdvices", id), advice);
    } catch (error) {
      console.error("Failed to add community advice:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.WRITE, "communityAdvices/" + id);
      }
      throw error;
    }
  };

  // 14. Like Community Advice Post
  const likeCommunityAdvice = async (id: string) => {
    try {
      const adviceDocRef = doc(db, "communityAdvices", id);
      const adviceSnap = await getDoc(adviceDocRef);
      if (!adviceSnap.exists()) return;
      
      const current = adviceSnap.data() as CommunityAdvice;
      const currentLikedBy = current.likedBy || [];
      const studentId = student?.id || "anonymous";
      
      let newLikedBy = [...currentLikedBy];
      let diff = 0;
      if (newLikedBy.includes(studentId)) {
        // Unlike
        newLikedBy = newLikedBy.filter(uid => uid !== studentId);
        diff = -1;
      } else {
        // Like
        newLikedBy.push(studentId);
        diff = 1;
      }
      
      await updateDoc(adviceDocRef, {
        likedBy: newLikedBy,
        likesCount: Math.max(0, (current.likesCount || 0) + diff)
      });
    } catch (error) {
      console.error("Failed to like/unlike advice post:", error);
    }
  };

  // 15. Delete Community Advice Post
  const deleteCommunityAdvice = async (id: string) => {
    try {
      await deleteDoc(doc(db, "communityAdvices", id));
    } catch (error) {
      console.error("Failed to delete advice post:", error);
      const isPermissionError = error instanceof Error && (
        error.message.includes("permission") || 
        error.message.includes("Permission") || 
        error.message.includes("insufficient")
      );
      if (isPermissionError) {
        handleFirestoreError(error, OperationType.DELETE, "communityAdvices/" + id);
      }
      throw error;
    }
  };

  // Premium Auth Helpers
  const signUpStudent = async (name: string, email: string, password: string, academicYear: AcademicYear) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const deviceSessionToken = "dev_" + Math.random().toString(36).substring(2, 15);

      localStorage.setItem("med_device_session_id", deviceSessionToken);
      localStorage.setItem("med_student_id", uid);
      const isAdmin = email.toLowerCase() === "aniswalid511@gmail.com" || academicYear === "Residanat";

      // Create profile document
      await setDoc(doc(db, "students", uid), {
        name,
        academicYear,
        joinedAt: new Date().toISOString(),
        answers: {},
        notes: [],
        email,
        activeSessionToken: deviceSessionToken,
        lastActiveAt: new Date().toISOString(),
        isAdmin: isAdmin,
        streakCount: 0,
        lastActivityDate: null
      });

      setStudent({
        id: uid,
        name,
        academicYear,
        joinedAt: new Date().toISOString(),
        email,
        isAdmin,
        streakCount: 0,
        lastActivityDate: null
      });
      setProgress({ studentId: uid, answers: {} });
      setNotes([]);
      setIsSessionTerminated(false);
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInStudent = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const deviceSessionToken = "dev_" + Math.random().toString(36).substring(2, 15);

      localStorage.setItem("med_device_session_id", deviceSessionToken);
      localStorage.setItem("med_student_id", uid);

      // Explicitly update Firestore with this session token to trigger disconnect on other devices
      const docRef = doc(db, "students", uid);
      await updateDoc(docRef, {
        activeSessionToken: deviceSessionToken,
        lastActiveAt: new Date().toISOString()
      });
      setIsSessionTerminated(false);
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (preferredYear: AcademicYear = "Year 3") => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const uid = user.uid;
      const deviceSessionToken = "dev_" + Math.random().toString(36).substring(2, 15);

      localStorage.setItem("med_device_session_id", deviceSessionToken);
      localStorage.setItem("med_student_id", uid);

      const docRef = doc(db, "students", uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const name = user.displayName || "Google Student";
        const email = user.email || "";
        let isAdmin = email.toLowerCase() === "aniswalid511@gmail.com" || 
                      email.toLowerCase() === "anislekehel4@gmail.com" ||
                      preferredYear === "Residanat";

        if (!isAdmin && email) {
          const adminSnap = await getDoc(doc(db, "adminEmails", email.toLowerCase()));
          if (adminSnap.exists()) {
            isAdmin = true;
          }
        }

        await setDoc(docRef, {
          name,
          academicYear: preferredYear,
          joinedAt: new Date().toISOString(),
          answers: {},
          notes: [],
          email: email,
          activeSessionToken: deviceSessionToken,
          lastActiveAt: new Date().toISOString(),
          isAdmin: isAdmin,
          streakCount: 0,
          lastActivityDate: null
        });

        setStudent({
          id: uid,
          name,
          academicYear: preferredYear,
          joinedAt: new Date().toISOString(),
          email,
          isAdmin,
          streakCount: 0,
          lastActivityDate: null
        });
        setProgress({ studentId: uid, answers: {} });
      } else {
        const data = docSnap.data();
        const email = user.email || data.email || "";
        let isAdmin = data.isAdmin || 
                      email.toLowerCase() === "aniswalid511@gmail.com" || 
                      email.toLowerCase() === "anislekehel4@gmail.com" ||
                      data.academicYear === "Residanat";

        if (!isAdmin && email) {
          const adminSnap = await getDoc(doc(db, "adminEmails", email.toLowerCase()));
          if (adminSnap.exists()) {
            isAdmin = true;
          }
        }

        await updateDoc(docRef, {
          activeSessionToken: deviceSessionToken,
          lastActiveAt: new Date().toISOString(),
          ...(isAdmin && !data.isAdmin ? { isAdmin: true } : {}),
          ...(!data.email && email ? { email } : {})
        });

        const currentStreak = data.streakCount || 0;
        const lastDate = data.lastActivityDate || null;
        const todayStr = getLocalDateString();
        const yesterdayStr = getYesterdayDateString();

        let finalStreak = currentStreak;
        if (lastDate && lastDate !== todayStr && lastDate !== yesterdayStr) {
          finalStreak = 0;
          updateDoc(docRef, { streakCount: 0 }).catch(err => console.error("Streak reset failed", err));
        }

        setStudent({
          id: uid,
          name: data.name,
          academicYear: data.academicYear,
          joinedAt: data.joinedAt || new Date().toISOString(),
          email,
          isAdmin,
          streakCount: finalStreak,
          lastActivityDate: lastDate
        });
        setProgress({ studentId: uid, answers: data.answers || {} });
      }
      setNotes([]);
      setIsSessionTerminated(false);
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOutStudent = async () => {
    try {
      localStorage.removeItem("med_student_id");
      localStorage.removeItem("med_device_session_id");
      await signOut(auth);
      setStudent(null);
      setProgress(null);
      setNotes([]);
      setIsSessionTerminated(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const forceActivateSession = async () => {
    if (!student || student.id === "offline_user") return;
    try {
      const deviceSessionToken = "dev_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("med_device_session_id", deviceSessionToken);

      const docRef = doc(db, "students", student.id);
      await updateDoc(docRef, {
        activeSessionToken: deviceSessionToken,
        lastActiveAt: new Date().toISOString()
      });
      setIsSessionTerminated(false);
    } catch (error) {
      console.error("Failed to force activate session:", error);
    }
  };

  return (
    <StudentContext.Provider value={{
      student,
      progress,
      notes,
      isLoading,
      registerStudent,
      signInStudent,
      signUpStudent,
      signInWithGoogle,
      signOutStudent,
      forceActivateSession,
      isSessionTerminated,
      updateAcademicYear,
      submitAnswer,
      addNote,
      deleteNote,
      submitBugReport,
      resetProgress,
      resetSessionProgress,
      customQuestions,
      allQuestions,
      uploadQuestion,
      deleteQuestion,
      loadCustomQuestions,
      knownCourses,
      addKnownCourse,
      deleteKnownCourse,
      loadKnownCourses,
      communityAdvices,
      addCommunityAdvice,
      likeCommunityAdvice,
      deleteCommunityAdvice,
      adminEmails,
      addAdminEmail,
      removeAdminEmail
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
};
