/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  TrendingUp, 
  X,
  RotateCcw,
  Clock
} from 'lucide-react';
import { ADAPTIVE_QUIZ_DATA, AdaptiveQuestion } from './AdaptiveQuizData';

interface AdaptiveQuizProps {
  theme?: 'dark' | 'light';
  activeView: string;
  currentUser: {
    id: string;
    name: string;
    email: string;
    classCode?: string;
    className?: string;
  } | null;
}

export default function AdaptiveQuiz({ activeView, currentUser, theme = 'dark' }: AdaptiveQuizProps) {
  // Only render widget in support lab views
  const labViews = [
    'periodic-table',
    'atom-builder',
    'bonding-lab',
    'geometry',
    'stoichiometry',
    'titration',
    'volta-lab',
    'kinetics-lab',
    'equilibrium-lab',
    'thermochemistry-lab',
    'colligative-lab',
    'colloid-lab',
    'electrolysis-lab',
    'flame-test-lab',
    'buffer-hydrolysis-lab',
    'solubility-ksp-lab',
    'organic-lab',
    'macromolecule-lab'
  ];

  if (!labViews.includes(activeView)) {
    return null;
  }

  // Map activeView to Indonesian nice title
  const getTopicTitle = (view: string) => {
    switch (view) {
      case 'periodic-table': return 'Sistem Periodik Unsur';
      case 'atom-builder': return 'Struktur Atom & Konfigurasi Kuantum';
      case 'bonding-lab': return 'Ikatan Kimia & Interaksi Molekul';
      case 'geometry': return 'Geometri Molekul VSEPR';
      case 'stoichiometry': return 'Stoikiometri & Hukum Dasar';
      case 'titration': return 'Titrasi Asam-Basa Kuantitatif';
      case 'volta-lab': return 'Sel Volta & Elektrokimia';
      case 'kinetics-lab': return 'Laju Reaksi & Energi Aktivasi';
      case 'equilibrium-lab': return 'Kesetimbangan Le Chatelier';
      case 'thermochemistry-lab': return 'Termokimia & Kalorimeter';
      case 'colligative-lab': return 'Sifat Koligatif Larutan';
      case 'colloid-lab': return 'Sistem Koloid & Tyndall';
      case 'electrolysis-lab': return 'Sel Elektrolisis & Hukum Faraday';
      case 'flame-test-lab': return 'Uji Nyala Kimia Unsur Golongan Utama';
      case 'buffer-hydrolysis-lab': return 'Larutan Penyangga & Hidrolisis Garam';
      case 'solubility-ksp-lab': return 'Kelarutan & Hasil Kali Kelarutan (Ksp)';
      case 'organic-lab': return 'Kimia Organik & Gugus Hidrokarbon';
      case 'macromolecule-lab': return 'Makromolekul & Biopolimer';
      default: return 'Evaluasi Kimia';
    }
  };

  const topicTitle = getTopicTitle(activeView);

  // States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'answering' | 'feedback' | 'completed'>('idle');
  
  // Quiz running parameters
  const [questionsPool, setQuestionsPool] = useState<AdaptiveQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [history, setHistory] = useState<{
    question: AdaptiveQuestion;
    selectedIdx: number;
    isCorrect: boolean;
    difficulty: 'mudah' | 'sedang' | 'sukar';
    scoreEarned: number;
  }[]>([]);
  
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [currentRound, setCurrentRound] = useState(1); // 1, 2, 3
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [systemLog, setSystemLog] = useState<string>('Memulai simulasi adaptif...');

  // Reset quiz when view changes
  useEffect(() => {
    setGameState('idle');
    setIsSidebarOpen(false);
    setHistory([]);
    setUsedIds([]);
    setCurrentRound(1);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
  }, [activeView]);

  // Load questions for the active topic
  const startQuiz = () => {
    const pool = ADAPTIVE_QUIZ_DATA.filter(q => q.category === activeView);
    setQuestionsPool(pool);
    
    // Step 1: Find 'sedang' question as starting baseline
    const starter = pool.find(q => q.difficulty === 'sedang') || pool[0];
    if (starter) {
      setCurrentQuestion(starter);
      setUsedIds([starter.id]);
      setGameState('answering');
      setCurrentRound(1);
      setScore(0);
      setStreak(0);
      setHistory([]);
      setSelectedOption(null);
      setSystemLog('Sistem dikonfigurasi pada level SEDANG. Menganalisis parameter kognitif...');
    }
  };

  const handleSelectOption = (idx: number) => {
    if (gameState !== 'answering') return;
    setSelectedOption(idx);
  };

  const submitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    let points = 0;
    
    if (isCorrect) {
      if (currentQuestion.difficulty === 'mudah') points = 15;
      else if (currentQuestion.difficulty === 'sedang') points = 30;
      else if (currentQuestion.difficulty === 'sukar') points = 60;
      
      // Streak bonus
      if (streak > 0) {
        points += 10;
      }
    }

    const newHistoryItem = {
      question: currentQuestion,
      selectedIdx: selectedOption,
      isCorrect,
      difficulty: currentQuestion.difficulty,
      scoreEarned: isCorrect ? points : 0
    };

    setHistory(prev => [...prev, newHistoryItem]);
    if (isCorrect) {
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setGameState('feedback');
  };

  const nextRound = () => {
    if (currentRound >= 3) {
      // Quiz completed!
      finishQuiz();
      return;
    }

    // Determine next question adaptively
    const lastItem = history[history.length - 1];
    const isLastCorrect = lastItem?.isCorrect;
    const lastDifficulty = lastItem?.difficulty;

    let nextDifficulty: 'mudah' | 'sedang' | 'sukar' = 'sedang';

    if (currentRound === 1) {
      // Round 1 was 'sedang'.
      // If correct -> go to 'sukar'
      // If incorrect -> go to 'mudah'
      nextDifficulty = isLastCorrect ? 'sukar' : 'mudah';
      
      if (isLastCorrect) {
        setSystemLog('Performa prima terdeteksi! Menaikkan level ke SUKAR untuk tantangan puncak.');
      } else {
        setSystemLog('Bantuan adaptasi dipicu. Menyesuaikan level ke MUDAH demi memperkokoh fondasi.');
      }
    } else if (currentRound === 2) {
      // We are at Round 2. We need to explore the remaining difficulty question
      // This is the 3rd question. Let's find the difficulty that hasn't been tested yet
      const testedDifficulties = history.map(h => h.difficulty);
      const allDiffs: ('mudah' | 'sedang' | 'sukar')[] = ['mudah', 'sedang', 'sukar'];
      const remaining = allDiffs.find(d => !testedDifficulties.includes(d));
      nextDifficulty = remaining || 'sedang';
      setSystemLog(`Mengeksplorasi parameter penutup. Menyetel level ke ${nextDifficulty.toUpperCase()}...`);
    }

    // Find question of this difficulty that isn't used
    const nextQ = questionsPool.find(q => q.difficulty === nextDifficulty && !usedIds.includes(q.id))
      || questionsPool.find(q => !usedIds.includes(q.id))
      || questionsPool[0];

    if (nextQ) {
      setCurrentQuestion(nextQ);
      setUsedIds(prev => [...prev, nextQ.id]);
      setSelectedOption(null);
      setCurrentRound(prev => prev + 1);
      setGameState('answering');
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setGameState('completed');
    
    // Broadcast success to global ChemVibe system using CustomEvent
    // Calculate final stats
    const correctCount = history.filter(h => h.isCorrect).length;
    const finalAccuracy = Math.round((correctCount / 3) * 100);

    const eventDetail = {
      activityType: 'quiz_completed',
      title: 'Menyelesaikan Kuis Adaptif',
      description: `Evaluasi Lab: ${topicTitle} (Akurasi: ${finalAccuracy}%, Skor: ${score} Pts)`,
      score: {
        earned: score,
        total: 110 // Max score theoretically with streaks
      }
    };

    window.dispatchEvent(new CustomEvent('chemvibe_activity', {
      detail: eventDetail
    }));
  };

  return (
    <>
      {/* Floating Sparkly Quiz Action Button */}
      <div className="fixed bottom-24 lg:bottom-6 right-6 z-50">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="relative flex items-center gap-2.5 px-4.5 py-3 bg-gradient-to-r from-pink-600 via-indigo-650 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 rounded-full text-white text-xs font-black uppercase tracking-wider shadow-2xl transition-all cursor-pointer border border-pink-400/30 group hover:scale-105 active:scale-95"
          id="btn-evaluate-adaptive"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full blur opacity-30 group-hover:opacity-75 transition-all animate-pulse" />
          <BrainCircuit className="w-4 h-4 text-white relative animate-pulse shrink-0" />
          <span className="relative">Kuis Adaptif Lab</span>
          
          {/* Subtle tag count completed */}
          {gameState === 'completed' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
          )}
        </button>
      </div>

      {/* Side Over Panel Wrapper */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className={`absolute inset-0 backdrop-blur-xs cursor-zoom-out ${theme === 'dark' ? 'bg-slate-950/70' : 'bg-slate-100/70'}`}
            />

            {/* Sidebar content container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`relative w-full sm:w-[480px] h-full border-l shadow-2xl flex flex-col z-10 ${theme === 'dark' ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-300'}`}
            >
              {/* Header */}
              <div className={`p-5 border-b flex items-center justify-between ${theme === 'dark' ? 'border-slate-900 bg-slate-900/40' : 'border-slate-300 bg-slate-100/40'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                    <BrainCircuit className="w-5 h-5 text-pink-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Kuis Evaluasi Adaptif</h3>
                    <p className="text-[10px] text-slate-400 font-mono line-clamp-1">Topik: {topicTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className={`p-1 px-2.5 border rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* IDLE STATE */}
                {gameState === 'idle' && (
                  <div className="space-y-6 py-4 animate-fade-in">
                    
                    {/* Welcome Banner */}
                    <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-3 relative overflow-hidden">
                      <div className="absolute right-[-20px] top-[-20px] opacity-10">
                        <BrainCircuit className="w-32 h-32 text-indigo-400" />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        <span className="text-[10px] font-mono text-pink-400 font-black uppercase tracking-wider">Smart Engine Aktif</span>
                      </div>
                      
                      <h4 className="text-sm font-extrabold text-white leading-tight">
                        Ukur Pemahaman Eksperimen Lab Anda!
                      </h4>
                      
                      <p className="text-xs text-slate-350 leading-relaxed">
                        Evaluasi ini dirancang menggunakan algoritma adaptif. Soal berikutnya akan menyesuaikan kesulitan (Mudah ↔ Sedang ↔ Sukar) secara langsung berdasarkan respons kebenaran jawaban Anda.
                      </p>
                    </div>

                    {/* Quick Rules */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Sistem Penilaian Adaptif</h5>
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className={`p-2.5 border rounded-xl text-center space-y-1 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[8px] font-bold rounded">MUDAH</span>
                          <p className="text-sm font-black text-white font-mono">15 Pts</p>
                          <p className="text-[8px] text-slate-500">Konsep dasaran</p>
                        </div>
                        <div className={`p-2.5 border rounded-xl text-center space-y-1 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                          <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[8px] font-bold rounded">SEDANG</span>
                          <p className="text-sm font-black text-white font-mono">30 Pts</p>
                          <p className="text-[8px] text-slate-500">Aplikasi rumus</p>
                        </div>
                        <div className={`p-2.5 border rounded-xl text-center space-y-1 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                          <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-[8px] font-bold rounded">SUKAR</span>
                          <p className="text-sm font-black text-white font-mono">60 Pts</p>
                          <p className="text-[8px] text-slate-500">Analisis kuantum</p>
                        </div>
                      </div>
                    </div>

                    {/* Class context if any */}
                    {currentUser?.classCode && (
                      <div className={`p-3 border rounded-xl flex items-center justify-between gap-3 text-xs ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-400" />
                          <span className="text-slate-300 font-medium">Grup Kelas Terhubung:</span>
                        </div>
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[9px] font-bold rounded uppercase">
                          {currentUser.className}
                        </span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-900">
                      <button
                        onClick={startQuiz}
                        className="w-full py-3 bg-pink-650 hover:bg-pink-550 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2.5 cursor-pointer shadow-lg transition-all"
                      >
                        <span>Mulai Kuis Adaptif ({topicTitle})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                )}

                {/* RUNNING STATE: ANSWERING OR FEEDBACK */}
                {(gameState === 'answering' || gameState === 'feedback') && currentQuestion && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Header stats bar */}
                    <div className={`flex items-center justify-between gap-4 border p-3 rounded-2xl ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                      
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-slate-500 font-mono font-bold">SOAL KE</p>
                        <p className="text-xs font-black text-white font-mono">{currentRound} dari 3</p>
                      </div>

                      <div className="h-6 w-px bg-slate-850" />

                      <div className="space-y-0.5 text-center">
                        <p className="text-[9px] text-slate-500 font-mono font-bold">TINGKAT SOAL</p>
                        <div>
                          {currentQuestion.difficulty === 'mudah' && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-black rounded uppercase">
                              🟢 Mudah (+15 Pts)
                            </span>
                          )}
                          {currentQuestion.difficulty === 'sedang' && (
                            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] font-black rounded uppercase">
                              🟡 Sedang (+30 Pts)
                            </span>
                          )}
                          {currentQuestion.difficulty === 'sukar' && (
                            <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-[9px] font-black rounded uppercase">
                              🔴 Sukar (+60 Pts)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="h-6 w-px bg-slate-850" />

                      <div className="space-y-0.5 text-right">
                        <p className="text-[9px] text-slate-500 font-mono font-bold">TOTAL SKOR</p>
                        <p className="text-xs font-black text-teal-400 font-mono">{score} Pts</p>
                      </div>

                    </div>

                    {/* Engine Adaptive Log */}
                    <div className={`p-2.5 border border-indigo-500/15 rounded-xl flex items-center gap-2 text-[10px] font-mono leading-normal shadow-inner ${theme === 'dark' ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping shrink-0" />
                      <p className="truncate"><span className="text-pink-400 font-bold">AutoPilot:</span> {systemLog}</p>
                    </div>

                    {/* Question text */}
                    <div className={`p-5 border rounded-2xl ${theme === 'dark' ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                      <p className="text-sm text-white font-semibold leading-relaxed whitespace-pre-wrap">
                        {currentQuestion.text}
                      </p>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2.5">
                      {currentQuestion.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrectAnswer = idx === currentQuestion.correctIndex;
                        
                        // Option coloring depending on feedback mode vs answering mode
                        let optionStyle = 'bg-slate-900/40 border-slate-850 text-slate-300 hover:border-slate-750 hover:bg-slate-900';
                        
                        if (gameState === 'answering') {
                          if (isSelected) {
                            optionStyle = 'bg-pink-500/10 border-pink-500 text-pink-300 font-bold';
                          }
                        } else if (gameState === 'feedback') {
                          if (isCorrectAnswer) {
                            optionStyle = 'bg-emerald-500/15 border-emerald-500/80 text-emerald-300 font-bold';
                          } else if (isSelected && !isCorrectAnswer) {
                            optionStyle = 'bg-rose-500/15 border-rose-500/80 text-rose-300 font-bold';
                          } else {
                            optionStyle = 'bg-slate-900/20 border-slate-900 text-slate-500 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectOption(idx)}
                            disabled={gameState === 'feedback'}
                            type="button"
                            className={`w-full text-left p-4 rounded-xl border text-xs leading-normal transition-all flex items-center justify-between gap-3 ${
                              gameState === 'answering' ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                            } ${optionStyle}`}
                          >
                            <span className="flex-1 pr-2">{opt}</span>
                            
                            {/* Checkmark or select indicators */}
                            <div className="shrink-0">
                              {gameState === 'answering' ? (
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-pink-500 bg-pink-500' : 'border-slate-800'
                                }`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              ) : (
                                <>
                                  {isCorrectAnswer && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />}
                                  {isSelected && !isCorrectAnswer && <XCircle className="w-4.5 h-4.5 text-rose-400" />}
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Dynamic Action Area: Submit button vs Feedback card */}
                    {gameState === 'answering' && (
                      <div className="pt-3">
                        <button
                          onClick={submitAnswer}
                          disabled={selectedOption === null}
                          className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Kunci Jawaban</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {gameState === 'feedback' && (
                      <div className="space-y-4 pt-3 border-t border-slate-900 animate-fade-in">
                        
                        {/* Explanation Box */}
                        <div className={`p-4.5 border rounded-2xl space-y-2.5 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-teal-400" />
                            <h5 className="text-[10px] font-mono font-black text-teal-400 uppercase tracking-wider">Pemahaman Konsep (Akurasi Adaptif)</h5>
                          </div>
                          
                          <p className="text-[11.5px] text-slate-300 leading-relaxed">
                            {currentQuestion.explanation}
                          </p>
                        </div>

                        {/* Continue Button */}
                        <button
                          onClick={nextRound}
                          className="w-full py-3 bg-pink-650 hover:bg-pink-550 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                        >
                          <span>{currentRound < 3 ? 'Konfirmasi & Soal Berikutnya' : 'Selesaikan Evaluasi Adaptif'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    )}

                  </div>
                )}

                {/* COMPLETED STATE */}
                {gameState === 'completed' && (
                  <div className="space-y-6 py-2 animate-fade-in">
                    
                    {/* Achievement Graphic Card */}
                    <div className="p-6 bg-gradient-to-br from-indigo-950/80 to-slate-950 border border-indigo-500/20 rounded-3xl text-center space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="relative inline-block">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full blur animate-pulse" />
                        <div className={`relative w-16 h-16 border rounded-full flex items-center justify-center mx-auto text-pink-400 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                          <Award className="w-8 h-8 text-pink-400 animate-bounce" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-base font-extrabold text-white">Evaluasi Terakreditasi!</h4>
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Kuis Adaptif: {topicTitle}</p>
                      </div>

                      <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                        Kerja bagus! Sesi belajar mandiri Anda telah disinkronkan secara real-time dengan Peta Kemahiran &amp; Papan Peringkat Global.
                      </p>

                      <div className="grid grid-cols-2 gap-3.5 pt-2">
                        <div className={`p-3 border rounded-2xl ${theme === 'dark' ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                          <p className="text-[9px] text-slate-500 font-mono font-bold">TOTAL SKOR</p>
                          <p className="text-xl font-black text-teal-400 font-mono">{score} Pts</p>
                        </div>
                        <div className={`p-3 border rounded-2xl ${theme === 'dark' ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                          <p className="text-[9px] text-slate-500 font-mono font-bold">AKURASI REKOR</p>
                          <p className="text-xl font-black text-pink-400 font-mono">
                            {Math.round((history.filter(h => h.isCorrect).length / 3) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Learning Curve Graph Visualization (Adaptive Trajectory) */}
                    <div className={`p-5 border rounded-2xl space-y-3.5 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        <h5 className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
                          Grafik Lintasan Kognitif Adaptif
                        </h5>
                      </div>

                      {/* Map-based timeline path */}
                      <div className="flex items-center justify-between gap-2 relative pt-2">
                        {/* Connecting Line */}
                        <div className="absolute top-7 left-1/12 right-1/12 h-0.5 bg-slate-800 z-0" />

                        {history.map((hist, index) => {
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center relative z-10 space-y-1.5">
                              
                              {/* Round indicator */}
                              <span className="text-[9px] font-mono text-slate-500 font-bold">S{index + 1}</span>
                              
                              {/* Level circular badge */}
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold font-mono text-xs shadow-md ${
                                hist.isCorrect 
                                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                                  : 'bg-rose-500/10 border-rose-500 text-rose-450'
                              }`} title={hist.question.text}>
                                {hist.difficulty === 'mudah' ? 'M' : hist.difficulty === 'sedang' ? 'S' : 'K'}
                              </div>

                              <div className="text-center space-y-0.5">
                                <p className="text-[8.5px] font-mono font-black uppercase text-slate-300">
                                  {hist.difficulty}
                                </p>
                                <p className={`text-[8px] font-medium font-mono ${hist.isCorrect ? 'text-emerald-400' : 'text-slate-550'}`}>
                                  {hist.isCorrect ? `+${hist.scoreEarned} Pts` : 'Gagal'}
                                </p>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                      <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                        <p className="text-[9.5px] text-slate-400 font-mono leading-relaxed text-center">
                          ℹ️ Grafik merefleksikan perubahan bobot nalar Anda. Berhasil menjawab tingkat <span className="text-amber-400">Sedang</span> meluncurkan Anda ke tingkat <span className="text-rose-400">Sukar</span>!
                        </p>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="pt-3 border-t border-slate-900 flex gap-3">
                      <button
                        onClick={startQuiz}
                        className={`flex-1 py-3 hover:bg-slate-850 border font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-750 text-white' : 'bg-slate-100 border-slate-300 hover:border-slate-400 text-slate-900'}`}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mulai Lagi</span>
                      </button>
                      
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex-1 py-3 bg-pink-650 hover:bg-pink-550 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <span>Selesai</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
