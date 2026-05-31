/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Home, 
  Atom, 
  FlaskConical, 
  BookOpen, 
  Sliders, 
  User, 
  Info, 
  Plus, 
  Brain, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Database,
  HelpCircle,
  Sparkles,
  Settings as SettingsIcon,
  X,
  Orbit,
  Scale,
  Droplet,
  Menu,
  Download,
  Smartphone,
  Sun,
  Moon,
  FileText,
  Trophy,
  Users,
  GraduationCap,
  Layers,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Data and types
import { INITIAL_MASTERY_DATA, ELEMENTS_DATA } from './data';
import { SCIENCE_LAWS } from './data/laws';
import { ChemicalElement, UserAccount, ActivityLog } from './types';

// Child views components
import DashboardHome from './components/DashboardHome';
import PeriodicTable from './components/PeriodicTable';
import BondingLab from './components/BondingLab';
import GeometryLab from './components/GeometryLab';
import StoichiometryCalculator from './components/StoichiometryCalculator';
import TitrationSimulator from './components/TitrationSimulator';
import VoltaLab from './components/VoltaLab';
import KineticsLab from './components/KineticsLab';
import EquilibriumLab from './components/EquilibriumLab';
import ThermochemistryLab from './components/ThermochemistryLab';
import ColligativeLab from './components/ColligativeLab';
import ColloidLab from './components/ColloidLab';
import ElectrolysisLab from './components/ElectrolysisLab';
import FlameTestLab from './components/FlameTestLab';
import BufferHydrolysisLab from './components/BufferHydrolysisLab';
import SolubilityKspLab from './components/SolubilityKspLab';
import FlashcardReview from './components/FlashcardReview';
import AuthModal from './components/AuthModal';
import OrganicLab from './components/OrganicLab';
import MacromoleculeLab from './components/MacromoleculeLab';
import AtomBuilderLab from './components/AtomBuilderLab';
import VirtualReportLab from './components/VirtualReportLab';
import Leaderboard from './components/Leaderboard';
import TeacherPortal from './components/TeacherPortal';
import AdaptiveQuiz from './components/AdaptiveQuiz';
import AIAssistant from './components/AIAssistant';
import AcademicCredentials from './components/AcademicCredentials';
import GlossaryWidget from './components/GlossaryWidget';
import AdaptiveFeedbackWidget from './components/AdaptiveFeedbackWidget';
import GreenChemistryLab from './components/GreenChemistryLab';
import PetroleumLab from './components/PetroleumLab';
import ElementReactivityLab from './components/ElementReactivityLab';
import AcidBaseIntroLab from './components/AcidBaseIntroLab';

import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Global store to capture beforeinstallprompt event before App mounts
let globalCapturedDeferredPrompt: any = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    globalCapturedDeferredPrompt = e;
    window.dispatchEvent(new CustomEvent('chemvibe_beforeinstallprompt', { detail: e }));
  });
}

export default function App() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  
  const [isGuruMode, setIsGuruMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('chemvibe_role_mode');
      return saved === 'guru';
    } catch (_) {
      return false;
    }
  });

  const [isLawsOpen, setIsLawsOpen] = useState<boolean>(false);
  const [activeLawTab, setActiveLawTab] = useState<string>('semua');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('chemvibe_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  React.useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    }
    localStorage.setItem('chemvibe_theme', theme);
  }, [theme]);
  const [masteryLevels, setMasteryLevels] = useState(INITIAL_MASTERY_DATA);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [customAlert, setCustomAlert] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  React.useEffect(() => {
    // Override window.alert to display a gorgeous custom non-blocking modal
    const originalAlert = window.alert;
    window.alert = (message: string) => {
      setCustomAlert({ message, show: true });
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  
  // Collapsible Grade Drawers (Sidebar)
  const [isKelasXOpen, setIsKelasXOpen] = useState<boolean>(true);
  const [isKelasXIOpen, setIsKelasXIOpen] = useState<boolean>(true);
  const [isKelasXIIOpen, setIsKelasXIIOpen] = useState<boolean>(true);

  // PWA (Progressive Web App) Installation Engine states
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(() => globalCapturedDeferredPrompt);
  const [isPwaInstalled, setIsPwaInstalled] = React.useState<boolean>(false);

  const getSidebarItemClass = (isActive: boolean) => {
    if (isActive) {
      return theme === 'dark' 
        ? 'bg-slate-850 text-teal-400 font-bold border-l-2 border-teal-500 pl-3' 
        : 'bg-teal-100 text-teal-700 font-bold border-l-2 border-teal-500 pl-3';
    }
    return theme === 'dark'
      ? 'text-slate-400 hover:bg-slate-900/30'
      : 'text-slate-600 hover:bg-teal-50';
  };

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent browser default mini infobar on mobile devices
      e.preventDefault();
      // Store the event so it can be manually triggered inside our settings page or dashboard banner
      setDeferredPrompt(e);
      globalCapturedDeferredPrompt = e;
      console.log('ChemVibe: captured beforeinstallprompt event.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleCustomBeforeInstallPrompt = (e: CustomEvent) => {
      setDeferredPrompt(e.detail);
    };
    window.addEventListener('chemvibe_beforeinstallprompt' as any, handleCustomBeforeInstallPrompt as any);

    // Explicitly check for standalone display mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsPwaInstalled(true);
    }

    // Monitor display-mode shifts dynamically on active resize or screen toggles
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: any) => {
      if (e.matches) {
        setIsPwaInstalled(true);
      }
    };
    
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleMediaChange);
    } else if ((mediaQueryList as any).addListener) {
      (mediaQueryList as any).addListener(handleMediaChange);
    }

    // Watch for successful device installation event
    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
      globalCapturedDeferredPrompt = null;
      console.log('ChemVibe: PWA was successfully installed on the device!');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('chemvibe_beforeinstallprompt' as any, handleCustomBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
      
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleMediaChange);
      } else if ((mediaQueryList as any).removeListener) {
        (mediaQueryList as any).removeListener(handleMediaChange);
      }
    };
  }, []);

  const triggerPWAInstall = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available for installation.');
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install user outcome choice: ${outcome}`);
      if (outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setDeferredPrompt(null);
      globalCapturedDeferredPrompt = null;
    } catch (err) {
      console.error('Failed to trigger PWA installation prompts:', err);
    }
  };

  // Authentication states
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('chemvibe_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);

  // Track and propagate visual guide mode preferences locally
  React.useEffect(() => {
    try {
      const modeString = isGuruMode ? 'guru' : 'siswa';
      localStorage.setItem('chemvibe_role_mode', modeString);
      // Dispatch a global event so nested components catch it reactively
      window.dispatchEvent(new CustomEvent('chemvibe_role_change', { detail: { isGuruMode } }));
    } catch (_) {}
  }, [isGuruMode]);

  // Sync auth state changes from Firebase SDK directly
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in securely
        const savedUser = localStorage.getItem('chemvibe_current_user');
        const parsedSaved = savedUser ? JSON.parse(savedUser) : null;
        const currentName = firebaseUser.displayName || (parsedSaved && parsedSaved.id === firebaseUser.uid ? parsedSaved.name : 'Peneliti');

        const regRole = localStorage.getItem('chemvibe_registration_role');
        const savedRoleMode = localStorage.getItem('chemvibe_role_mode');
        const defaultRole = (regRole || savedRoleMode || 'siswa') as 'guru' | 'siswa';
        if (regRole) {
          localStorage.removeItem('chemvibe_registration_role');
        }

        const userAcct: UserAccount = {
          id: firebaseUser.uid,
          name: currentName,
          email: firebaseUser.email || '',
          createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime).toISOString() : new Date().toISOString(),
          role: defaultRole
        };
        setCurrentUser(userAcct);
        localStorage.setItem('chemvibe_current_user', JSON.stringify(userAcct));

        // Let's load student visual mastery metrics and self-directed progress from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          // Get local storage values for backup / merging
          let localCompleted: number[] = [];
          try {
            const saved = localStorage.getItem('chemvibe_atombuilder_completed_missions');
            if (saved) localCompleted = JSON.parse(saved);
          } catch (_) {}
          
          let localAtomHighscore = 0;
          const savedAtomSc = localStorage.getItem('chemvibe_atombuilder_highscore');
          if (savedAtomSc) localAtomHighscore = parseInt(savedAtomSc, 10) || 0;

          let localPeriodicHighscore = 0;
          const savedPeriodicSc = localStorage.getItem('chemvibe_periodic_highscore');
          if (savedPeriodicSc) localPeriodicHighscore = parseInt(savedPeriodicSc, 10) || 0;

          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Resolve role and classroom details
            const resolvedRole = (data.role || defaultRole) as 'guru' | 'siswa';
            const resolvedClassCode = data.classCode || '';
            const resolvedClassName = data.className || '';
            userAcct.role = resolvedRole;
            userAcct.classCode = resolvedClassCode;
            userAcct.className = resolvedClassName;
            setIsGuruMode(resolvedRole === 'guru');
            localStorage.setItem('chemvibe_role_mode', resolvedRole);
            setCurrentUser({ ...userAcct, role: resolvedRole, classCode: resolvedClassCode, className: resolvedClassName });
            localStorage.setItem('chemvibe_current_user', JSON.stringify({ ...userAcct, role: resolvedRole, classCode: resolvedClassCode, className: resolvedClassName }));

            // 1. Mastery
            if (data.masteryLevels && data.masteryLevels.length > 0) {
              setMasteryLevels(data.masteryLevels);
            } else {
              setMasteryLevels(INITIAL_MASTERY_DATA);
            }

            // 2. Completed Missions (Union of Firestore and Local)
            const dbCompleted: number[] = data.completedMissions || [];
            const mergedMissions = Array.from(new Set([...dbCompleted.map(Number), ...localCompleted.map(Number)]));
            if (mergedMissions.length > 0) {
              localStorage.setItem('chemvibe_atombuilder_completed_missions', JSON.stringify(mergedMissions));
            }

            // 3. Atom Highscore (Max of Firestore and Local)
            const dbAtomScore = data.atomHighscore || 0;
            const mergedAtomScore = Math.max(dbAtomScore, localAtomHighscore);
            localStorage.setItem('chemvibe_atombuilder_highscore', mergedAtomScore.toString());

            // 4. Periodic Highscore (Max of Firestore and Local)
            const dbPeriodicScore = data.periodicHighscore || 0;
            const mergedPeriodicScore = Math.max(dbPeriodicScore, localPeriodicHighscore);
            localStorage.setItem('chemvibe_periodic_highscore', mergedPeriodicScore.toString());

            // If there's local progress that wasn't in DB, or role is missing, write the merged results back to DB
            if (
              mergedMissions.length > dbCompleted.length ||
              mergedAtomScore > dbAtomScore ||
              mergedPeriodicScore > dbPeriodicScore ||
              data.completedMissions === undefined ||
              data.role === undefined
            ) {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                completedMissions: mergedMissions,
                atomHighscore: mergedAtomScore,
                periodicHighscore: mergedPeriodicScore,
                role: resolvedRole
              }, { merge: true });
            }

            // Sync public profile achievements (Zero-Trust PII Isolation - no emails are sent here)
            await setDoc(doc(db, 'public_profiles', firebaseUser.uid), {
              id: firebaseUser.uid,
              name: currentName,
              atomHighscore: mergedAtomScore,
              periodicHighscore: mergedPeriodicScore,
              completedMissions: mergedMissions,
              role: resolvedRole,
              updatedAt: new Date().toISOString()
            }, { merge: true });

          } else {
            userAcct.role = defaultRole;
            setIsGuruMode(defaultRole === 'guru');
            localStorage.setItem('chemvibe_role_mode', defaultRole);
            setCurrentUser({ ...userAcct, role: defaultRole });
            localStorage.setItem('chemvibe_current_user', JSON.stringify({ ...userAcct, role: defaultRole }));

            // Document does not exist yet (e.g. initial sign-up state). Let's save standard metrics & any local progress
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              id: userAcct.id,
              name: userAcct.name,
              email: userAcct.email,
              createdAt: userAcct.createdAt,
              role: defaultRole,
              masteryLevels: INITIAL_MASTERY_DATA,
              completedMissions: localCompleted,
              atomHighscore: localAtomHighscore,
              periodicHighscore: localPeriodicHighscore
            });

            // Also initialize public profile
            await setDoc(doc(db, 'public_profiles', firebaseUser.uid), {
              id: userAcct.id,
              name: userAcct.name,
              atomHighscore: localAtomHighscore,
              periodicHighscore: localPeriodicHighscore,
              completedMissions: localCompleted,
              role: defaultRole,
              updatedAt: new Date().toISOString()
            });

            setMasteryLevels(INITIAL_MASTERY_DATA);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        }

        // Load activities from the subcollection
        try {
          const querySnapshot = await getDocs(
            query(collection(db, 'users', firebaseUser.uid, 'activities'), orderBy('timestamp', 'desc'), limit(15))
          );
          const loadedActivities: ActivityLog[] = [];
          querySnapshot.forEach((docSnap) => {
            loadedActivities.push(docSnap.data() as ActivityLog);
          });
          setActivities(loadedActivities);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, `users/${firebaseUser.uid}/activities`);
        }

      } else {
        // User logged out
        setCurrentUser(null);
        localStorage.removeItem('chemvibe_current_user');
        setActivities([]);
        setMasteryLevels(INITIAL_MASTERY_DATA);

        // Falling back to local/anonymous guest storage
        const savedGuest = localStorage.getItem('chemvibe_progress_guest');
        if (savedGuest) {
          try {
            const parsed = JSON.parse(savedGuest);
            if (parsed.activities) setActivities(parsed.activities);
            if (parsed.masteryLevels) setMasteryLevels(parsed.masteryLevels);
          } catch (err) {
            console.error('Failed to parse guest progress info', err);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateClass = (classCode: string, className: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, classCode, className };
    setCurrentUser(updated);
    localStorage.setItem('chemvibe_current_user', JSON.stringify(updated));
  };

  // Handle custom activity logging event
  React.useEffect(() => {
    const handleActivityLog = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail) return;

      const { activityType, title, description, score } = customEvent.detail;
      
      const newActivity: ActivityLog = {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        userId: currentUser ? currentUser.id : 'guest',
        activityType,
        title,
        description,
        score,
        timestamp: new Date().toISOString()
      };

      setActivities(prev => {
        const next = [newActivity, ...prev];
        
        // Also update mastery levels in graph on success/completion!
        setMasteryLevels(prevMastery => {
          const todayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday...
          const graphIndex = todayIndex === 0 ? 6 : todayIndex - 1;
          
          const updatedMastery = prevMastery.map((m, idx) => {
            if (idx === graphIndex) {
              const boost = score ? Math.round((score.earned / score.total) * 15) : 8;
              return { ...m, level: Math.max(10, Math.min(100, m.level + boost)) };
            }
            return m;
          });

          // Sync variables with Cloud Firestore database or local storage for guests
          if (currentUser) {
            // Keep user masteries updated
            setDoc(doc(db, 'users', currentUser.id), {
              masteryLevels: updatedMastery
            }, { merge: true }).catch((err) => {
              handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.id}`);
            });

            // Log activity in the immutable activities sub-collection
            setDoc(doc(db, 'users', currentUser.id, 'activities', newActivity.id), newActivity).catch((err) => {
              handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.id}/activities/${newActivity.id}`);
            });

            // Log activity globally on the public real-time activity ledger for the live ticker
            setDoc(doc(db, 'public_activities', newActivity.id), {
              id: newActivity.id,
              userId: currentUser.id,
              userName: currentUser.name,
              activityType,
              title,
              description,
              timestamp: newActivity.timestamp
            }).catch((err) => {
              handleFirestoreError(err, OperationType.WRITE, `public_activities/${newActivity.id}`);
            });

            // Touch public profile updated time
            setDoc(doc(db, 'public_profiles', currentUser.id), {
              id: currentUser.id,
              name: currentUser.name,
              updatedAt: new Date().toISOString()
            }, { merge: true }).catch((err) => {
              handleFirestoreError(err, OperationType.WRITE, `public_profiles/${currentUser.id}`);
            });
          } else {
            // Save guest progress to localStorage
            localStorage.setItem('chemvibe_progress_guest', JSON.stringify({
              activities: next,
              masteryLevels: updatedMastery
            }));
          }

          return updatedMastery;
        });

        return next;
      });
    };

    window.addEventListener('chemvibe_activity', handleActivityLog);
    return () => window.removeEventListener('chemvibe_activity', handleActivityLog);
  }, [currentUser]);

  // Update mastery when user rates flashcard
  const handleCardReviewed = (success: boolean) => {
    // Log the activity
    window.dispatchEvent(new CustomEvent('chemvibe_activity', {
      detail: {
        activityType: 'flashcard_reviewed',
        title: 'Review Flashcards',
        description: `Melakukan tinjauan kartu flashcard dengan penanda ${success ? 'SUKSES' : 'ULANGI'}`
      }
    }));
  };

  // Settings states
  const [labTemp, setLabTemp] = useState<number>(298.15); // Temperature in Kelvin
  const [labPressure, setLabPressure] = useState<number>(1.0); // pressure in atm
  const [isCationWarning, setIsCationWarning] = useState<boolean>(true);



  const handleLaunchRandomSimulation = () => {
    const views = ['bonding-lab', 'geometry', 'stoichiometry', 'titration', 'volta-lab', 'kinetics-lab', 'equilibrium-lab'];
    const randomView = views[Math.floor(Math.random() * views.length)];
    setActiveView(randomView);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-teal-500/30 selection:text-white">
      
      {/* Top Header App Bar */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 h-16">
        <div className="flex justify-between items-center px-4 md:px-8 h-full w-full max-w-7xl mx-auto">
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Sidebar Hamburger Trigger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-all active:scale-95 duration-200"
              aria-label={isSidebarCollapsed ? "Tampilkan Sidebar" : "Sembunyikan Sidebar"}
              title={isSidebarCollapsed ? "Tampilkan Sidebar" : "Sembunyikan Sidebar"}
            >
              <Menu className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? '' : 'rotate-90 text-teal-450'}`} />
            </button>

            <button 
              onClick={() => setActiveView('dashboard')}
              aria-label="Kembali ke Dashboard ChemVibe"
              className="font-sans text-xl md:text-2xl font-bold tracking-tight text-white cursor-pointer select-none hover:opacity-90"
            >
              Chem<span className="text-teal-400">Vibe</span>
            </button>
            
            {/* Nav Header Links (Desktop) */}
            <div className="hidden md:flex items-center gap-6 ml-8">
              <button 
                onClick={() => setActiveView('dashboard')}
                className={`text-xs uppercase tracking-widest font-mono font-bold transition-all py-5 ${
                  activeView === 'dashboard' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveView('periodic-table')}
                className={`text-xs uppercase tracking-widest font-mono font-bold transition-all py-5 ${
                  activeView === 'periodic-table' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Periodic Table
              </button>
              <button 
                onClick={() => setActiveView('bonding-lab')}
                className={`text-xs uppercase tracking-widest font-mono font-bold transition-all py-5 ${
                  ['bonding-lab', 'geometry', 'stoichiometry', 'titration', 'volta-lab', 'kinetics-lab', 'equilibrium-lab', 'thermochemistry-lab', 'colligative-lab', 'organic-lab', 'macromolecule-lab'].includes(activeView) ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Labs
              </button>
            </div>
          </div>

          {/* Profile Icons */}
          <div className="flex items-center gap-2.5 sm:gap-4">

            {/* Saklar Mode Pintar menyesuaikan status Login atau Tamu */}
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Mode belajar adaptif untuk pengguna terverifikasi */}
                <div className="flex bg-slate-950 p-0.5 rounded-full border border-slate-800 items-center gap-0.5 select-none shadow-inner lab-mode-switch">
                  <button 
                    onClick={() => setIsGuruMode(false)}
                    className={`px-2.5 py-1 text-[9px] sm:text-[10px] sm:px-3 font-sans font-bold uppercase rounded-full tracking-wider transition-all duration-300 cursor-pointer ${
                      !isGuruMode 
                        ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-teal-300 border border-teal-500/30 font-black shadow-lg scale-102' 
                        : 'text-slate-450 hover:text-white'
                    }`}
                    title="Mode Mandiri: Sembunyikan bimbingan kognitif untuk menguji pemahaman mandiri."
                  >
                    Mandiri
                  </button>
                  <button 
                    onClick={() => setIsGuruMode(true)}
                    className={`px-2.5 py-1 text-[9px] sm:text-[10px] sm:px-3 font-sans font-bold uppercase rounded-full tracking-wider transition-all duration-300 cursor-pointer ${
                      isGuruMode 
                        ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-teal-300 border border-teal-500/30 font-black shadow-lg scale-102' 
                        : 'text-slate-450 hover:text-white'
                    }`}
                    title="Mode Bimbingan: Tampilkan panduan belajar, materi, dan tips rekapitulasi."
                  >
                    Bimbingan
                  </button>
                </div>

                {/* Locked authentic role badge */}
                {currentUser.role === 'guru' ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono font-black uppercase rounded-full leading-none">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Guru / Pengajar</span>
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-mono font-black uppercase rounded-full leading-none">
                    <FlaskConical className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Siswa / Praktikan</span>
                  </span>
                )}
              </div>
            ) : (
              /* Untuk Tamu (Guest) - Tampilkan Toggler Simulasi Peran Siswa/Guru (Demo) */
              <div className="flex bg-slate-950 p-0.5 rounded-full border border-slate-800 items-center gap-0.5 select-none shadow-inner lab-mode-switch">
                <button 
                  onClick={() => setIsGuruMode(false)}
                  className={`px-2.5 py-1 text-[9px] sm:text-[10px] sm:px-3 font-sans font-extrabold uppercase rounded-full tracking-wider transition-all duration-300 cursor-pointer ${
                    !isGuruMode 
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-slate-950 font-black shadow-lg scale-102 font-sans' 
                      : 'text-slate-450 hover:text-white'
                  }`}
                  title="Mode Siswa (Demo): Sembunyikan bimbingan kognitif untuk mengevaluasi ingatan mandiri."
                >
                  Siswa
                </button>
                <button 
                  onClick={() => setIsGuruMode(true)}
                  className={`px-2.5 py-1 text-[9px] sm:text-[10px] sm:px-3 font-sans font-extrabold uppercase rounded-full tracking-wider transition-all duration-300 cursor-pointer ${
                    isGuruMode 
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-slate-950 font-black shadow-lg scale-102 font-sans' 
                      : 'text-slate-450 hover:text-white'
                  }`}
                  title="Mode Guru (Demo): Tampilkan materi pembelajaran interaktif, kunci teori, dan petunjuk reaksi."
                >
                  Guru
                </button>
              </div>
            )}

            {/* Ringkasan Kartu Hukum Fisika & Kimia Trigger */}
            <button 
              onClick={() => setIsLawsOpen(true)}
              aria-label="Ringkasan Hukum Fisika & Kimia"
              title="Materi Ringkasan Hukum Fisika & Kimia"
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/15 flex items-center gap-1 text-[9px] sm:text-[11px] font-mono font-bold text-teal-300 hover:text-white cursor-pointer active:scale-95 transition-all shadow-md shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden md:inline">Hukum Sains</span>
            </button>

            {/* Micro interactivity details alerts */}
            <button 
              onClick={() => setIsAlertOpen(true)}
              aria-label="Informasi Lab ChemVibe"
              className="w-8 h-8 rounded-full border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all"
            >
              <FlaskConical className="w-4 h-4 text-teal-450" />
            </button>

            {/* Theme mode toggle: Light/Dark */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Ubah Tema"
              className="w-8 h-8 rounded-full border border-slate-850 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer active:scale-95 transition-all"
              title={theme === 'dark' ? 'Aktifkan Mode Terang (Light Mode)' : 'Aktifkan Mode Gelap (Dark Mode)'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Interactive User profile panel / Entrance node */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 border border-teal-400/50 flex items-center justify-center text-slate-950 text-[11px] font-black tracking-tighter hover:scale-105 transition-all cursor-pointer shadow-lg shadow-teal-500/20"
                  id="user-profile-avatar-btn"
                >
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 hover:border-teal-500/50 text-teal-400 font-mono text-[10px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer"
                  id="user-login-trigger-btn"
                >
                  MASUK
                </button>
              )}

              {/* Profile Dropdown popup */}
              {showProfileDropdown && currentUser && (
                <div className="absolute top-11 right-0 w-60 bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-2xl z-50 animate-fade-in text-xs space-y-2.5">
                  <div className="space-y-1 pb-2 border-b border-slate-900">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-black">PROFIL PENGGUNA</div>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-black uppercase border ${
                        currentUser.role === 'guru'
                          ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                          : 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                      }`}>
                        {currentUser.role === 'guru' ? (
                          <>
                            <GraduationCap className="w-2.5 h-2.5" />
                            <span>Guru</span>
                          </>
                        ) : (
                          <>
                            <FlaskConical className="w-2.5 h-2.5" />
                            <span>Siswa</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="font-bold text-white text-[13px] truncate">{currentUser.name}</div>
                    <div className="text-zinc-500 font-mono text-[9.5px] truncate">{currentUser.email}</div>
                  </div>

                  <div className="space-y-2 pb-2 border-b border-slate-900 text-[11.5px]">
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Metrik Kuis:</span>
                      <strong className="text-emerald-400 font-mono font-bold">
                        {activities.filter(a => a.activityType === 'quiz_completed').length} kuis
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Total Aktivitas:</span>
                      <strong className="text-teal-400 font-mono font-bold">
                        {activities.length}
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        await signOut(auth);
                        setCurrentUser(null);
                        setShowProfileDropdown(false);
                      } catch (err) {
                        console.error('Logout error:', err);
                      }
                    }}
                    className="w-full py-2 bg-rose-500/10 hover:bg-slate-900 text-rose-400 text-center font-bold font-mono rounded-lg transition-all cursor-pointer text-[9.5px] uppercase tracking-wider"
                    id="user-logout-btn"
                  >
                    Logout Konsol
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Core Container */}
      <div className="flex-1 flex pt-16 w-full max-w-7xl mx-auto">
        
        {/* Left Sidebar Menu (Desktop only size list) */}
        <aside className={`shrink-0 hidden lg:flex flex-col border-r py-8 gap-4 transition-all duration-300 z-30 ${
          theme === 'dark' ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'
        } ${
          isSidebarCollapsed ? 'w-0 overflow-hidden opacity-0 p-0 border-r-0 pointer-events-none' : 'w-64 px-6'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-mono text-[10px] font-bold text-slate-500 tracking-widest">LAB_CONSOLE_V4.2</h2>
              <p className="font-mono text-[10px] text-slate-400 uppercase opacity-60 mt-0.5 font-bold tracking-tight">Active Student</p>
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1 rounded-lg border border-slate-800 text-slate-500 hover:text-teal-400 hover:border-teal-500/30 bg-slate-950/40 transition-colors cursor-pointer"
              title="Sembunyikan Sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <nav className="flex flex-col space-y-1.5 mt-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'dashboard' 
                  ? 'bg-slate-800 border border-slate-700 text-teal-400 shadow-md translate-x-1.5 duration-200' 
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView('periodic-table')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'periodic-table' 
                  ? 'bg-slate-800 border border-slate-700 text-teal-400 shadow-md translate-x-1.5 duration-200' 
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
              }`}
            >
              <Atom className="w-4 h-4" />
              <span>Periodic Table</span>
            </button>

            {/* --- KELAS X --- */}
            <div className="pt-2 border-t border-slate-800 mt-1">
              <button 
                onClick={() => setIsKelasXOpen(!isKelasXOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-slate-400 hover:bg-slate-900/30 rounded-lg cursor-pointer transition-all uppercase tracking-wider font-sans select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span className="text-teal-400 text-[10.5px]">Kelas X (Dasar)</span>
                </div>
                {isKelasXOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
              </button>

              {isKelasXOpen && (
                <div className="space-y-0.5 mt-1 pl-1.5">
                  <button
                    onClick={() => setActiveView('atom-builder')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'atom-builder')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>Membangun Atom (Atom)</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('bonding-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'bonding-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      <span>Orbitals Bonding (Ikatan)</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('geometry')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'geometry')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>VSEPR Geometry (Bentuk)</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('stoichiometry')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'stoichiometry')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span>Stoikiometri (Perhitungan)</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('green-chemistry')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'green-chemistry')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Kimia Hijau (Keberlanjutan)</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>
              )}
            </div>

            {/* --- KELAS XI --- */}
            <div className="pt-2 border-t border-slate-800 mt-1">
              <button 
                onClick={() => setIsKelasXIOpen(!isKelasXIOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-slate-400 hover:bg-slate-900/30 rounded-lg cursor-pointer transition-all uppercase tracking-wider font-sans select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  <span className="text-cyan-400 text-[10.5px]">Kelas XI (Lanjutan)</span>
                </div>
                {isKelasXIOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
              </button>

              {isKelasXIOpen && (
                <div className="space-y-0.5 mt-1 pl-1.5">
                  <button
                    onClick={() => setActiveView('thermochemistry-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'thermochemistry-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Termokimia &amp; Energi</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('kinetics-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'kinetics-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Kinetika &amp; Laju Reaksi</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('equilibrium-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'equilibrium-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      <span>Kesetimbangan Kimia</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('acid-base-intro')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'acid-base-intro')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Teori Asam Basa &amp; Indikator Alami</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('titration')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'titration')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>pH Titrasi Asam Basa</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('buffer-hydrolysis-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'buffer-hydrolysis-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Buffer &amp; Hidrolisis Garam</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('solubility-ksp-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'solubility-ksp-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Kelarutan &amp; Hasil Kali Ksp</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('colloid-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'colloid-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>Sistem Koloid &amp; Tyndall</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('petroleum-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'petroleum-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      <span>Minyak Bumi &amp; Oktan</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>
              )}
            </div>

            {/* --- KELAS XII --- */}
            <div className="pt-2 border-t border-slate-800 mt-1">
              <button 
                onClick={() => setIsKelasXIIOpen(!isKelasXIIOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-slate-400 hover:bg-slate-900/30 rounded-lg cursor-pointer transition-all uppercase tracking-wider font-sans select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span className="text-orange-400 text-[10.5px]">Kelas XII (Spesialis)</span>
                </div>
                {isKelasXIIOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
              </button>

              {isKelasXIIOpen && (
                <div className="space-y-0.5 mt-1 pl-1.5">
                  <button
                    onClick={() => setActiveView('colligative-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'colligative-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      <span>Sifat Koligatif Larutan</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('volta-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'volta-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>Sel Volta &amp; Redoks</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('electrolysis-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'electrolysis-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Elektrolisis &amp; Faraday</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('flame-test-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'flame-test-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-450" />
                      <span>Uji Nyala Kimia Unsur</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('organic-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'organic-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      <span>Kimia Karbon (Organik)</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('macromolecule-lab')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'macromolecule-lab')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>Laboratorium Makromolekul</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>

                  <button
                    onClick={() => setActiveView('element-reactivity')}
                    className={`w-full flex items-center justify-between px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${getSidebarItemClass(activeView === 'element-reactivity')}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-405" />
                      <span>Sifat &amp; Reaktivitas Unsur</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveView('ai-assistant')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'ai-assistant' 
                  ? 'bg-slate-800 border border-slate-700 text-teal-400 shadow-md translate-x-1.5 duration-200' 
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
              <span>Asisten Lab AI</span>
            </button>

            <button
              onClick={() => setActiveView('flashcards')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'flashcards' 
                  ? 'bg-slate-800 border border-slate-700 text-teal-400 shadow-md translate-x-1.5 duration-200' 
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Anki Flashcards</span>
            </button>

            <button
              onClick={() => setActiveView('virtual-report')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'virtual-report' 
                  ? 'bg-slate-800 border border-slate-700 text-teal-400 shadow-md translate-x-1.5 duration-200' 
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Laporan Praktikum</span>
            </button>

            <button
              onClick={() => setActiveView('credentials')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'credentials' 
                  ? 'bg-slate-800 border border-slate-700 text-teal-400 shadow-md translate-x-1.5 duration-200 bg-gradient-to-r from-teal-950/20 to-indigo-950/20' 
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Lencana &amp; Sertifikat</span>
            </button>

            <button
              onClick={() => setActiveView('leaderboard')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'leaderboard' 
                  ? 'bg-slate-800 border border-slate-700 text-teal-400 shadow-md translate-x-1.5 duration-200' 
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Papan Peringkat</span>
            </button>

            {((!currentUser && isGuruMode) || (currentUser && currentUser.role === 'guru')) && (
              <button
                onClick={() => setActiveView('teacher-portal')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'teacher-portal' 
                    ? 'bg-slate-800 border border-slate-700 text-teal-400 shadow-md translate-x-1.5 duration-200 border-l-2 border-l-teal-500' 
                    : 'text-teal-450 hover:bg-slate-900/40'
                }`}
              >
                <Users className="w-4 h-4 text-teal-400" />
                <span>Portal Pengawasan Guru</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('settings')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'settings' 
                  ? 'bg-slate-800 border border-slate-700 text-teal-400 shadow-md translate-x-1.5' 
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Lab Settings</span>
            </button>
          </nav>
        </aside>

        {/* Core Main content viewer zone */}
        <main className="flex-1 px-4 md:px-8 py-8 pb-32 overflow-y-auto relative">
          {/* Uncollapse button when desktop sidebar is hidden */}
          {isSidebarCollapsed && (
            <div className="absolute left-4 top-4 z-40 hidden lg:block">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl text-xs font-mono font-bold text-teal-400 hover:text-white hover:bg-slate-800 hover:border-teal-500/30 cursor-pointer shadow-lg transition-all"
                title="Tampilkan Menu"
              >
                <ChevronRight className="w-4 h-4 text-teal-400" />
                <span>Buka Menu</span>
              </button>
            </div>
          )}
          {activeView === 'dashboard' && (
            <DashboardHome 
              onNavigate={setActiveView} 
              masteryLevels={masteryLevels}
              dueCardsCount={24}
              currentUser={currentUser}
              activities={activities}
              onTriggerAuth={() => setIsAuthOpen(true)}
              onUpdateClass={handleUpdateClass}
              theme={theme}
            />
          )}

          {activeView === 'periodic-table' && <PeriodicTable currentUser={currentUser} />}
          {activeView === 'atom-builder' && <AtomBuilderLab currentUser={currentUser} theme={theme} />}
          {activeView === 'bonding-lab' && <BondingLab theme={theme} />}
          {activeView === 'geometry' && <GeometryLab theme={theme} />}
          {activeView === 'stoichiometry' && <StoichiometryCalculator theme={theme} />}
          {activeView === 'acid-base-intro' && <AcidBaseIntroLab currentUser={currentUser} theme={theme} />}
          {activeView === 'titration' && <TitrationSimulator theme={theme} />}
          {activeView === 'volta-lab' && <VoltaLab theme={theme} />}
          {activeView === 'kinetics-lab' && <KineticsLab theme={theme} />}
          {activeView === 'equilibrium-lab' && <EquilibriumLab theme={theme} />}
          {activeView === 'thermochemistry-lab' && <ThermochemistryLab theme={theme} />}
          {activeView === 'colligative-lab' && <ColligativeLab theme={theme} />}
          {activeView === 'colloid-lab' && <ColloidLab theme={theme} />}
          {activeView === 'electrolysis-lab' && <ElectrolysisLab theme={theme} />}
          {activeView === 'flame-test-lab' && <FlameTestLab currentUser={currentUser} theme={theme} />}
          {activeView === 'buffer-hydrolysis-lab' && <BufferHydrolysisLab currentUser={currentUser} theme={theme} />}
          {activeView === 'solubility-ksp-lab' && <SolubilityKspLab currentUser={currentUser} theme={theme} />}
          {activeView === 'organic-lab' && <OrganicLab theme={theme} />}
          {activeView === 'macromolecule-lab' && <MacromoleculeLab theme={theme} />}
          {activeView === 'green-chemistry' && <GreenChemistryLab currentUser={currentUser} theme={theme} />}
          {activeView === 'petroleum-lab' && <PetroleumLab currentUser={currentUser} theme={theme} />}
          {activeView === 'element-reactivity' && <ElementReactivityLab currentUser={currentUser} theme={theme} />}
          {activeView === 'ai-assistant' && <AIAssistant theme={theme} />}
          {activeView === 'flashcards' && <FlashcardReview onCardReviewed={handleCardReviewed} />}
          {activeView === 'virtual-report' && (
            <VirtualReportLab 
              currentUser={currentUser} 
              activities={activities} 
              onNavigate={setActiveView} 
            />
          )}

          {activeView === 'credentials' && (
            <AcademicCredentials 
              currentUser={currentUser} 
              onNavigate={setActiveView} 
            />
          )}

          {activeView === 'leaderboard' && (
            <Leaderboard 
              currentUser={currentUser} 
              onNavigate={(view) => {
                if (view === 'dashboard' && !currentUser) {
                  setActiveView('dashboard');
                  setTimeout(() => {
                    setIsAuthOpen(true);
                  }, 150);
                } else {
                  setActiveView(view);
                }
              }}
            />
          )}

          {activeView === 'teacher-portal' && (
            <TeacherPortal 
              currentUser={currentUser} 
              onNavigate={setActiveView} 
            />
          )}

          {activeView === 'settings' && (
            /* Custom Settings Panel */
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-slate-800">
                <h2 className="text-2xl font-black text-white tracking-tight">Laboratory Physics Settings</h2>
                <p className="text-slate-400 text-sm">Sesuaikan konstanta fisika lingkungan laboratorium quantum Anda.</p>
              </div>

              <div className="glass-panel rounded-2xl p-6 space-y-6 border border-slate-700">
                {/* Temp setting slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">SUHU AKTIF LABORATORIUM (Temperature)</span>
                    <span className="font-mono text-teal-400 font-bold">{labTemp.toFixed(2)} K ({(labTemp - 273.15).toFixed(1)}°C)</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    value={labTemp}
                    onChange={(e) => setLabTemp(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <span className="text-[10px] text-slate-500 block leading-tight">Konstanta penting untuk penentuan fasa unsur serta pergeseran entropi gas kovalen.</span>
                </div>

                {/* Pressure setting */}
                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">TEKANAN ATMOSFER (Pressure)</span>
                    <span className="font-mono text-teal-400 font-bold">{labPressure.toFixed(2)} atm</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="10.0"
                    step="0.1"
                    value={labPressure}
                    onChange={(e) => setLabPressure(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                {/* Cation notifications toggler */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-sm">
                  <div>
                    <span className="font-bold text-slate-200">Notifikasi Kation Alkali</span>
                    <p className="text-slate-500 text-xs">Beri tanda peringatan jika reaktivitas logam alkali mendisintegrasikan molekul air.</p>
                  </div>
                  <button
                    onClick={() => setIsCationWarning(!isCationWarning)}
                    className={`w-11 h-6 rounded-full transition-all relative ${isCationWarning ? 'bg-teal-500' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-all ${isCationWarning ? 'left-5.5' : 'left-0.75'}`} />
                  </button>
                </div>
              </div>

              {/* Progressive Web App (PWA) Interactive Installation Card */}
              <div className="glass-panel rounded-2xl p-6 space-y-5 border border-slate-800 bg-slate-900/40">
                <div className="flex items-start gap-4 pb-4 border-b border-slate-800">
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-sans tracking-tight">Instalasi Aplikasi ChemVibe (PWA)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                      Ubah ChemVibe menjadi aplikasi seluler mandiri berkinerja tinggi langsung di handphone atau tablet Anda.
                    </p>
                  </div>
                </div>

                {isPwaInstalled ? (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/25 flex items-start gap-3.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mt-1.5 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-emerald-400 font-sans">ChemVibe Telah Terpasang di Layar Utama!</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Terdeteksi sedang berjalan dalam mode aplikasi mandiri (*Standalone*). Anda sekarang dapat mengakses visualisasi molekul dan persentasi lab secara offline kapan saja dengan ketukan langsung dari homescreen.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    {deferredPrompt ? (
                      <div className="space-y-3 p-4 rounded-xl bg-teal-950/20 border border-teal-500/20">
                        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono font-bold text-teal-400 block tracking-widest uppercase">PWA AUTOMATIC DISCOVERY</span>
                            <span className="text-xs text-slate-200 font-sans font-bold">Instalasi Sekali-Ketuk Tersedia</span>
                          </div>
                          <button
                            onClick={triggerPWAInstall}
                            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-550 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-sans text-xs font-black rounded-lg transition-all shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Pasang Aplikasi</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                          *Ketuk tombol di atas untuk menginstal ChemVibe langsung ke laci aplikasi Anda tanpa perlu melewati Google Play Store atau App Store.*
                        </p>
                      </div>
                    ) : (
                      <div className="p-4.5 rounded-xl bg-slate-950/50 border border-slate-900/60 text-slate-400 space-y-4">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-teal-400" />
                          <span className="text-xs font-bold text-slate-200">Panduan Instalasi Manual</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Android Platform */}
                          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/35 border border-slate-850">
                            <span className="text-[9px] font-mono text-zinc-400 font-black block bg-slate-900/80 py-0.5 px-2 rounded-md w-max border border-slate-800">METODE A: ANDROID / CHROME</span>
                            <ol className="text-[10.5px] text-slate-500 space-y-1.5 list-decimal pl-4 font-sans leading-relaxed">
                              <li>Buka panel menu browser <strong className="text-slate-300">(ketuk titik tiga ⋮ di kanan atas)</strong>.</li>
                              <li>Pilih opsi <strong className="text-teal-400">"Instal Aplikasi"</strong> atau <strong className="text-teal-400">"Tambahkan ke Layar Utama"</strong>.</li>
                              <li>Setujui dialog instalasi, ikon ChemVibe akan siap di laci aplikasi HP Anda.</li>
                            </ol>
                          </div>

                          {/* iOS Platform */}
                          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/35 border border-slate-850">
                            <span className="text-[9px] font-mono text-zinc-400 font-black block bg-slate-900/80 py-0.5 px-2 rounded-md w-max border border-slate-800">METODE B: IOS APPLE / SAFARI</span>
                            <ol className="text-[10.5px] text-slate-500 space-y-1.5 list-decimal pl-4 font-sans leading-relaxed">
                              <li>Buka peramban bawaan <strong className="text-slate-300">Apple Safari Browser</strong>.</li>
                              <li>Ketuk tombol bagikan <strong className="text-slate-300">Share ⎙ (ikon persegi dengan anak panah atas)</strong>.</li>
                              <li>Gulir ke bawah dan pilih <strong className="text-teal-400">"Tambah ke Layar Utama" (+ Add to Home Screen)</strong>.</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-900 space-y-3">
                        <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider block uppercase">🧬 DATA TEKNOLOGI PWA CHEMVIBE</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-slate-300 block">Kompak &amp; Ringan</span>
                            <p className="text-[10px] text-slate-500 leading-snug">Menyimpan data ringkas yang meminimalisir penggunaan ruang penyimpanan memori internal.</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-slate-300 block">Layar Penuh Mandiri</span>
                            <p className="text-[10px] text-slate-500 leading-snug">Menyembunyikan address bar peramban web untuk fokus navigasi riset murni.</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-slate-300 block">Kecepatan Cache</span>
                            <p className="text-[10px] text-slate-500 leading-snug">Melakukan pemuatan instan lewat salinan lokal di memori cache service worker perangkat.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dynamic Custom Alert Modal */}
      <AnimatePresence>
        {customAlert.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 alert-dialog-portal"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative overflow-hidden"
              id="custom-alert-card"
            >
              {/* Glow accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500" />
              
              <div className="flex items-start gap-4 pt-1">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 shadow-sm animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs font-mono font-bold text-teal-400 tracking-wider uppercase">Notifikasi Sistem</h4>
                  <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap select-text selection:bg-teal-500/30 selection:text-teal-200">
                    {customAlert.message}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={() => setCustomAlert({ message: '', show: false })}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-sans font-bold text-xs rounded-xl shadow-md transition-all scale-100 hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5"
                  id="custom-alert-close-btn"
                >
                  <span>Baik, Saya Mengerti</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apparatus Information popup Modal */}
      {isAlertOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md p-6 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setIsAlertOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-900 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <FlaskConical className="w-6 h-6 text-teal-400 animate-pulse" />
              <h3 className="text-lg font-bold text-white font-sans">Lab Console V4.2 Specs</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Selamat datang di sistem ChemVibe Quantum Laboratory. Aplikasi penjelajah interaktif ini menyediakan simulasi fasa periodik unsur, transfer orbital ikatan, teori hibridisasi geometri, kesetaraan yield stoikiometri, simulasi kurva pH titrasi asam-basa, serta visualisasi perlintasan sel Galvani elektrokimia dan elektrolisis.
            </p>
            <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
              <div>AUTH: OK</div>
              <div>MAIN SPEAKER: ONLINE</div>
              <div>LOC_LAT: 2026-05-22 UTC</div>
            </div>
            <button
              onClick={() => setIsAlertOpen(false)}
              className="w-full py-2 bg-teal-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-teal-600 transition-colors cursor-pointer"
            >
              Kembali Ke Simulasi
            </button>
          </div>
        </div>
      )}

      {/* Physics & Chemistry Laws Summary Popup Modal */}
      {isLawsOpen && (
        <div className="fixed inset-0 z-55 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in text-left">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden science-laws-modal">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-850 flex items-center justify-between bg-slate-900/60 sticky top-0 shrink-0">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5.5 h-5.5 text-teal-400 animate-pulse" />
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">Ringkasan Hukum Fisika &amp; Kimia</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">
                    Kombinasi materi pembelajaran terintegrasi adaptif ({isGuruMode ? 'Mode Guru Aktif' : 'Mode Siswa Aktif'})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsLawsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-850 text-slate-450 hover:text-white transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-selector Tabs */}
            <div className="px-5 py-3 border-b border-slate-850 flex items-center gap-2 overflow-x-auto shrink-0 bg-slate-950/20 scrollbar-none select-none relative z-10 select-tabs">
              {[
                { id: 'semua', label: 'Semua Hukum' },
                { id: 'kimia', label: 'Kimia & Elektro' },
                { id: 'fisika', label: 'Fisika & Arus/Termo' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveLawTab(tab.id)}
                  className={`px-3.5 py-1 text-xs rounded-full font-mono transition-all duration-300 shrink-0 cursor-pointer ${
                    activeLawTab === tab.id 
                      ? 'bg-teal-500 text-slate-950 font-black shadow-md' 
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-850/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List Body with Beautiful Cards */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-slate-850 list-body">
              {SCIENCE_LAWS.filter(law => {
                if (activeLawTab === 'semua') return true;
                if (activeLawTab === 'fisika') return law.category === 'Fisika' || law.category === 'Termodinamika';
                if (activeLawTab === 'kimia') return law.category === 'Kimia' || law.category === 'Elektrokimia';
                return true;
              }).map(law => (
                <div 
                  key={law.id}
                  className="bg-slate-900/40 hover:bg-slate-900/70 border border-slate-850 rounded-xl p-4.5 space-y-3 transition-all duration-300 hover:border-slate-750 shadow-inner group relative text-left science-law-card"
                >
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <span className="text-[9px] font-mono text-teal-400 font-extrabold uppercase bg-teal-950/50 px-2 py-0.5 rounded border border-teal-900/60 category-badge">
                        {law.category}
                      </span>
                      <h4 className="text-sm font-extrabold text-white mt-1.5 group-hover:text-teal-300 transition-colors card-title">
                        {law.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 card-formulator">{law.formulator}</p>
                    </div>
                    <div className="text-[10px] text-slate-450 bg-slate-950 px-2.5 py-1 rounded border border-slate-850 font-mono shrink-0 card-lab-tag">
                      Lab: {law.appLab}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans card-description">{law.description}</p>

                  {/* Prominent Formula Viewport */}
                  <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 flex items-center justify-center font-mono text-xs text-teal-300 select-all font-black tracking-wide shadow-inner text-center formula-viewport">
                    <code className="text-cyan-400">{law.formula}</code>
                  </div>

                  {/* Adaptive Pedagogical Sections based on State Toggle */}
                  <div className="animate-fade-in role-pedagogy-block">
                    {isGuruMode ? (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs flex gap-2 w-full text-left teacher-note-card">
                        <span className="text-sm shrink-0">💡</span>
                        <p className="leading-relaxed font-sans font-medium">{law.teacherNote}</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-indigo-300 text-xs flex gap-2 w-full text-left student-note-card">
                        <span className="text-sm shrink-0">📝</span>
                        <p className="leading-relaxed font-sans font-medium">{law.studentNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer switcher notification */}
            <div className="p-4 border-t border-slate-850 bg-slate-900/90 text-[10px] sm:text-xs text-slate-400 flex items-center justify-between shrink-0 font-mono science-laws-footer">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isGuruMode ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500 animate-pulse'}`}></span>
                <span className="active-mode-label">Mode Aktif: {isGuruMode ? 'GURU / BELAJAR' : 'SISWA / UJI'}</span>
              </div>
              <button
                onClick={() => setIsGuruMode(!isGuruMode)}
                className="text-xs font-bold text-teal-400 hover:text-teal-300 cursor-pointer underline hover:underline-offset-2 mode-toggle-footer-btn"
              >
                Ubah ke Mode {isGuruMode ? 'Siswa' : 'Guru'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mainframe sync footer matching the Design HTML */}
      <footer className="h-8 border-t border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between shrink-0 z-50 text-slate-300">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mainframe Sync Active</span>
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono tracking-tighter">
          CHEMVIBE OS v4.2.1 // LATENCY: 2ms // SECURE_SOCKET: TLS_1.3
        </div>
      </footer>

      {/* Bottom Nav Bar (Mobile viewport layout fallback) */}
      <nav className="lg:hidden fixed bottom-0 w-full z-40 bg-slate-950 border-t border-slate-800 h-16 flex justify-around items-center select-none shadow-2xl">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${
            activeView === 'dashboard' ? 'text-teal-400' : 'text-slate-500'
          }`}
        >
          <Home className="w-4.5 h-4.5" />
          <span>Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveView('periodic-table')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${
            activeView === 'periodic-table' ? 'text-teal-400' : 'text-slate-500'
          }`}
        >
          <Atom className="w-4.5 h-4.5" />
          <span>Elements</span>
        </button>
        <button 
          onClick={() => setActiveView('bonding-lab')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${
            activeView === 'bonding-lab' ? 'text-teal-400' : 'text-slate-500'
          }`}
        >
          <FlaskConical className="w-4.5 h-4.5" />
          <span>Bonding</span>
        </button>
        <button 
          onClick={() => setActiveView('flashcards')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${
            activeView === 'flashcards' ? 'text-teal-400' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-4.5 h-4.5" />
          <span>Cards</span>
        </button>
      </nav>

      {/* Floating Action FAB (Contextual on dashboard) */}
      {activeView === 'dashboard' && (
        <button
          onClick={handleLaunchRandomSimulation}
          className="fixed bottom-24 right-6 lg:bottom-12 lg:right-10 w-14 h-14 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-xl shadow-teal-500/20 hover:scale-110 active:scale-95 transition-all z-40 cursor-pointer group"
          title="Launch random laboratory simulation"
        >
          <Plus className="w-6 h-6 text-slate-950 group-hover:rotate-90 transition-transform duration-200" />
          <span className="absolute right-16 scale-0 group-hover:scale-100 origin-right transition-all bg-slate-950 text-white rounded-lg px-3 py-1.5 border border-slate-800 text-xs font-semibold select-none whitespace-nowrap shadow-2xl pointer-events-none">
            New Simulation
          </span>
        </button>
      )}

      {/* Persistent Auth Register/Login portal dialog node */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={(user) => { 
          setCurrentUser(user); 
          setIsAuthOpen(false); 
        }} 
      />

      {/* Adaptive Evaluation Quiz overlay */}
      <AdaptiveQuiz activeView={activeView} currentUser={currentUser} />

      {/* Dynamic Chemistry Glossary System (P2 Pedagogi) */}
      <GlossaryWidget activeView={activeView} />

      {/* Adaptive Formative Feedback System */}
      <AdaptiveFeedbackWidget activeView={activeView} />

      {/* Mobile Sliding Sidebar/Drawer Navigation Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop slide dim background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Sliding Panel Container Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 flex flex-col h-full shadow-2xl z-10"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-slate-900 bg-slate-900/40">
                <div>
                  <h3 className="font-mono text-[11px] font-black text-teal-400 tracking-wider">LAB_CONSOLE_V4.2</h3>
                  <p className="text-white font-sans text-base font-bold">Chem<span className="text-teal-400">Vibe</span></p>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 cursor-pointer transition-colors"
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links with fine touch target areas (min-h-44 px rules compatible) */}
              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase block px-3 mb-2.5">Menu Utama</span>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setActiveView('dashboard');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                        activeView === 'dashboard'
                          ? 'bg-slate-900 border border-slate-800 text-teal-400 shadow-md font-bold'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                      }`}
                    >
                      <Home className="w-4.5 h-4.5" />
                      <span>Home Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('periodic-table');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                        activeView === 'periodic-table'
                          ? 'bg-slate-900 border border-slate-800 text-teal-400 shadow-md font-bold'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                      }`}
                    >
                      <Atom className="w-4.5 h-4.5" />
                      <span>Periodic Table</span>
                    </button>
                  </div>
                </div>

                {/* --- KELAS X MOBILE --- */}
                <div className="border-t border-slate-900/80 pt-5">
                  <button 
                    onClick={() => setIsKelasXOpen(!isKelasXOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:bg-slate-900/30 rounded-lg cursor-pointer transition-all uppercase tracking-wider font-sans select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      <span className="text-teal-450 font-bold">Kelas X (Dasar)</span>
                    </div>
                    {isKelasXOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  {isKelasXOpen && (
                    <div className="space-y-1.5 mt-2 pl-2">
                      <button
                        onClick={() => {
                          setActiveView('atom-builder');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'atom-builder' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          <span>Membangun Atom (Atom)</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('bonding-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'bonding-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                          <span>Orbitals Bonding (Ikatan)</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('geometry');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'geometry' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                          <span>VSEPR Geometry (Bentuk)</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('stoichiometry');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'stoichiometry' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                          <span>Stoikiometri (Perhitungan)</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('green-chemistry');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'green-chemistry' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>Kimia Hijau (Keberlanjutan)</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    </div>
                  )}
                </div>

                {/* --- KELAS XI MOBILE --- */}
                <div className="border-t border-slate-900/80 pt-5">
                  <button 
                    onClick={() => setIsKelasXIOpen(!isKelasXIOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:bg-slate-900/30 rounded-lg cursor-pointer transition-all uppercase tracking-wider font-sans select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      <span className="text-cyan-450 font-bold">Kelas XI (Lanjutan)</span>
                    </div>
                    {isKelasXIOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  {isKelasXIOpen && (
                    <div className="space-y-1.5 mt-2 pl-2">
                      <button
                        onClick={() => {
                          setActiveView('thermochemistry-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'thermochemistry-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <span>Termokimia &amp; Energi</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('kinetics-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'kinetics-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>Kinetika &amp; Laju Reaksi</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('equilibrium-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'equilibrium-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                          <span>Kesetimbangan Kimia</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('acid-base-intro');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'acid-base-intro' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          <span>Teori Asam Basa &amp; Indikator Alami</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('titration');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'titration' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                          <span>pH Titrasi Asam Basa</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('buffer-hydrolysis-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'buffer-hydrolysis-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                          <span>Buffer &amp; Hidrolisis Garam</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('solubility-ksp-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'solubility-ksp-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span>Kelarutan &amp; Hasil Kali Ksp</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('colloid-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'colloid-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-505 shrink-0" />
                          <span>Sistem Koloid &amp; Tyndall</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('petroleum-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'petroleum-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                          <span>Minyak Bumi &amp; Oktan</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    </div>
                  )}
                </div>

                {/* --- KELAS XII MOBILE --- */}
                <div className="border-t border-slate-900/80 pt-5">
                  <button 
                    onClick={() => setIsKelasXIIOpen(!isKelasXIIOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-400 hover:bg-slate-900/30 rounded-lg cursor-pointer transition-all uppercase tracking-wider font-sans select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-orange-450 font-bold">Kelas XII (Spesialis)</span>
                    </div>
                    {isKelasXIIOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  {isKelasXIIOpen && (
                    <div className="space-y-1.5 mt-2 pl-2">
                      <button
                        onClick={() => {
                          setActiveView('colligative-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'colligative-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                          <span>Sifat Koligatif Larutan</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('volta-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'volta-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full shrink-0 font-bold bg-rose-500" />
                          <span>Sel Volta &amp; Redoks</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('electrolysis-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'electrolysis-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>Sel Elektrolisis &amp; Faraday</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('flame-test-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'flame-test-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-450 shrink-0" />
                          <span>Uji Nyala Kimia Unsur</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('organic-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'organic-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5 font-bold' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                          <span>Kimia Karbon (Organik)</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('macromolecule-lab');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'macromolecule-lab' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                          <span>Laboratorium Makromolekul</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('element-reactivity');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'element-reactivity' ? 'bg-slate-900 text-teal-400 font-bold border-l-2 border-teal-500 pl-3.5' : 'text-slate-400 hover:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-405 shrink-0" />
                          <span>Sifat &amp; Reaktivitas Unsur</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-900/80 pt-5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase block px-3 mb-2.5">Fitur Pendukung</span>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setActiveView('ai-assistant');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                        activeView === 'ai-assistant'
                          ? 'bg-slate-900 border border-slate-800 text-teal-400 shadow-md font-bold'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-4.5 h-4.5 text-teal-400 animate-pulse" />
                      <span>Asisten Lab AI</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('flashcards');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                        activeView === 'flashcards'
                          ? 'bg-slate-900 border border-slate-800 text-teal-400 shadow-md font-bold'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-4.5 h-4.5" />
                      <span>Anki Flashcards</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('virtual-report');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                        activeView === 'virtual-report'
                          ? 'bg-slate-900 border border-slate-800 text-teal-400 shadow-md font-bold'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                      }`}
                    >
                      <FileText className="w-4.5 h-4.5" />
                      <span>Laporan Praktikum</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('credentials');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                        activeView === 'credentials'
                          ? 'bg-slate-900 border border-slate-800 text-teal-400 shadow-md font-bold bg-gradient-to-r from-teal-950/20 to-indigo-950/10'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                      }`}
                    >
                      <Award className="w-4.5 h-4.5 text-indigo-400" />
                      <span>Lencana &amp; Sertifikat</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('leaderboard');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                        activeView === 'leaderboard'
                          ? 'bg-slate-900 border border-slate-800 text-teal-400 shadow-md font-bold'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                      }`}
                    >
                      <Trophy className="w-4.5 h-4.5" />
                      <span>Papan Peringkat</span>
                    </button>

                    {((!currentUser && isGuruMode) || (currentUser && currentUser.role === 'guru')) && (
                      <button
                        onClick={() => {
                          setActiveView('teacher-portal');
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                          activeView === 'teacher-portal'
                            ? 'bg-slate-900 border border-slate-800 text-teal-400 shadow-md font-bold'
                            : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                        }`}
                      >
                        <Users className="w-4.5 h-4.5 text-teal-450" />
                        <span>Portal Pengawasan Guru</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveView('settings');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                        activeView === 'settings'
                          ? 'bg-slate-900 border border-slate-800 text-teal-400 shadow-md font-bold'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                      }`}
                    >
                      <Sliders className="w-4.5 h-4.5" />
                      <span>Lab Settings</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Research Officer profile block in Drawer Footer */}
              <div className="p-4 border-t border-slate-900 bg-slate-900/20 flex items-center justify-between gap-3 min-h-[70px]">
                {currentUser ? (
                  <div className="flex items-center gap-2.5 truncate flex-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 border border-teal-400/50 flex items-center justify-center text-slate-950 text-xs font-black shrink-0">
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate text-left">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] font-bold text-white truncate leading-tight">{currentUser.name}</span>
                        <span className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[7.5px] font-mono uppercase border shrink-0 ${
                          currentUser.role === 'guru'
                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-black'
                            : 'bg-teal-500/10 border-teal-500/20 text-teal-400 font-black'
                        }`}>
                          {currentUser.role === 'guru' ? 'Guru' : 'Siswa'}
                        </span>
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-mono truncate leading-none mt-0.5">{currentUser.email}</div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthOpen(true);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Masuk Konsol</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
