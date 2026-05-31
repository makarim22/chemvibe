/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FLASHCARDS_DATA } from '../data';
import { Flashcard } from '../types';
import { 
  BookOpen, 
  Sparkles, 
  AlertCircle, 
  PlusCircle, 
  RefreshCcw, 
  HelpCircle, 
  Eye, 
  Search, 
  Shuffle, 
  Timer,
  Zap, 
  Award, 
  BarChart2, 
  Filter,
  CheckCircle2,
  Trash2,
  Cloud,
  CloudLightning,
  CloudOff,
  Database
} from 'lucide-react';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface FlashcardReviewProps {
  onCardReviewed: (success: boolean) => void;
}

export default function FlashcardReview({ onCardReviewed }: FlashcardReviewProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);

  // Load custom cards initially from local storage or cloud
  const [customCards, setCustomCards] = useState<Flashcard[]>([]);

  // Combine default flashcards with user's custom persisted ones
  const [deck, setDeck] = useState<Flashcard[]>(FLASHCARDS_DATA);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  
  // Custom Card Creator state
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<string>('');
  const [customHint, setCustomHint] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('Organic Chemistry');
  const [otherCategory, setOtherCategory] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Search and Filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isShuffleActive, setIsShuffleActive] = useState<boolean>(false);

  // Gamified & Spaced Repetition Session statistics
  const [sessionReviewed, setSessionReviewed] = useState<number>(0);
  const [sessionStreak, setSessionStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [ratingsCount, setRatingsCount] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0
  });

  // Integrated Speed Trial mode state
  const [isTimerMode, setIsTimerMode] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(20);

  // Listen to Auth State securely from Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsLoadingCloud(true);
        try {
          const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'flashcards'));
          const list: Flashcard[] = [];
          querySnapshot.forEach((doc) => {
            list.push(doc.data() as Flashcard);
          });
          setCustomCards(list);
          setDeck([...list, ...FLASHCARDS_DATA]);
        } catch (error) {
          console.error("Gagal memuat kartu flash dari cloud: ", error);
          // Fallback to local storage if firestore read fails
          const saved = localStorage.getItem('chemvibe_custom_cards');
          const parsedCustom = saved ? JSON.parse(saved) : [];
          setCustomCards(parsedCustom);
          setDeck([...parsedCustom, ...FLASHCARDS_DATA]);
        } finally {
          setIsLoadingCloud(false);
        }
      } else {
        // Fallback to local storage for guests
        const saved = localStorage.getItem('chemvibe_custom_cards');
        const parsedCustom = saved ? JSON.parse(saved) : [];
        setCustomCards(parsedCustom);
        setDeck([...parsedCustom, ...FLASHCARDS_DATA]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync state shifts of deck to LocalStorage or Cloud Firestore
  const saveCustomCards = async (updated: Flashcard[], singleCardToSave?: Flashcard, idToDelete?: string) => {
    setCustomCards(updated);
    setDeck([...updated, ...FLASHCARDS_DATA]);

    if (currentUser) {
      if (singleCardToSave) {
        const path = `users/${currentUser.uid}/flashcards/${singleCardToSave.id}`;
        try {
          await setDoc(doc(db, 'users', currentUser.uid, 'flashcards', singleCardToSave.id), singleCardToSave);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
      }
      if (idToDelete) {
        const path = `users/${currentUser.uid}/flashcards/${idToDelete}`;
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'flashcards', idToDelete));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, path);
        }
      }
    } else {
      try {
        localStorage.setItem('chemvibe_custom_cards', JSON.stringify(updated));
      } catch (e) {
        console.error("Local storage allocation failed: ", e);
      }
    }
  };

  // Local-to-Cloud Sync helper triggers
  const hasUnsynchronizedLocalCards = useMemo(() => {
    if (!currentUser) return false;
    try {
      const saved = localStorage.getItem('chemvibe_custom_cards');
      if (!saved) return false;
      const parsed: Flashcard[] = JSON.parse(saved);
      if (parsed.length === 0) return false;
      
      const cloudIds = new Set(customCards.map(c => c.id));
      return parsed.some(c => !cloudIds.has(c.id));
    } catch {
      return false;
    }
  }, [currentUser, customCards]);

  const handleSyncLocalCardsWithCloud = async () => {
    if (!currentUser) return;
    setIsLoadingCloud(true);
    try {
      const saved = localStorage.getItem('chemvibe_custom_cards');
      if (!saved) return;
      const parsed: Flashcard[] = JSON.parse(saved);
      if (parsed.length === 0) return;

      // Save each to Firestore
      for (const card of parsed) {
        await setDoc(doc(db, 'users', currentUser.uid, 'flashcards', card.id), card);
      }

      // Re-fetch consolidated list
      const querySnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'flashcards'));
      const list: Flashcard[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data() as Flashcard);
      });
      setCustomCards(list);
      setDeck([...list, ...FLASHCARDS_DATA]);

      // Clear the local storage backup
      localStorage.setItem('chemvibe_custom_cards', '[]');
    } catch (error) {
      console.error("Gagal menyinkronkan kartu lokal ke cloud: ", error);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  // Compile list of unique categories available inside the active collection
  const availableCategories = useMemo(() => {
    const defaultCats = Array.from(new Set(FLASHCARDS_DATA.map(c => c.category)));
    const customCats = customCards.map(c => c.category);
    return Array.from(new Set([...customCats, ...defaultCats]));
  }, [customCards]);

  // Compute filtered card subset
  const filteredCards = useMemo(() => {
    let list = [...deck];
    
    if (selectedCategory !== 'All') {
      list = list.filter(card => card.category === selectedCategory);
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(card => 
        card.question.toLowerCase().includes(query) || 
        card.answer.toLowerCase().includes(query) ||
        card.category.toLowerCase().includes(query)
      );
    }
    
    return list;
  }, [deck, selectedCategory, searchQuery]);

  const activeCard = filteredCards[currentIndex];

  // Reset indices on query or filter adaptation to avoid overflow index failures
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  }, [selectedCategory, searchQuery, isShuffleActive]);

  // Active Timer Tick effect
  useEffect(() => {
    let intervalId: any;
    if (isTimerMode && !isFlipped && currentIndex < filteredCards.length) {
      intervalId = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setIsFlipped(true); // Auto-flip on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerMode, isFlipped, currentIndex, filteredCards.length]);

  // Reset timer on moving to the next question
  const resetTimerValue = () => {
    setTimeLeft(20);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffleDeck = () => {
    const shuffleList = (targetArr: Flashcard[]) => {
      const arr = [...targetArr];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    if (!isShuffleActive) {
      setDeck(prev => shuffleList(prev));
      setIsShuffleActive(true);
    } else {
      // Revert to natural order with custom first
      setDeck([...customCards, ...FLASHCARDS_DATA]);
      setIsShuffleActive(false);
    }
  };

  const handleAnswerRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const isSuccess = rating !== 'again';
    onCardReviewed(isSuccess);

    // Update stats
    setSessionReviewed(prev => prev + 1);
    setRatingsCount(prev => ({
      ...prev,
      [rating]: prev[rating] + 1
    }));

    if (rating === 'good' || rating === 'easy') {
      setSessionStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else if (rating === 'again') {
      setSessionStreak(0);
    }

    // Dynamic flip back transition before pushing index
    setIsFlipped(false);
    setShowHint(false);

    setTimeout(() => {
      if (currentIndex + 1 < filteredCards.length) {
        setCurrentIndex(currentIndex + 1);
        resetTimerValue();
      } else {
        setCurrentIndex(filteredCards.length); // triggers completed screen
      }
    }, 250);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    resetTimerValue();
  };

  const handleDeleteCustomCard = async (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customCards.filter(c => c.id !== cardId);
    await saveCustomCards(updated, undefined, cardId);
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || !customAnswer.trim()) return;

    const finalCategory = customCategory === 'Other' && otherCategory.trim() 
      ? otherCategory.trim() 
      : customCategory;

    const newCard: Flashcard = {
      id: `custom-${Date.now()}`,
      category: finalCategory,
      question: customQuestion.trim(),
      answer: customAnswer.trim(),
      hint: customHint.trim() || undefined
    };

    const updated = [newCard, ...customCards];
    await saveCustomCards(updated, newCard);

    // Clear and return focus
    setCustomQuestion('');
    setCustomAnswer('');
    setCustomHint('');
    setOtherCategory('');
    setIsCreating(false);
    setIsFlipped(false);
    setShowHint(false);
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10" id="flashcard-anki-labs">
      
      {/* Unsynchronized Alert Strip */}
      {hasUnsynchronizedLocalCards && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in ring-1 ring-amber-500/10 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Cloud className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-none">Sinkronisasi Kartu Kustom Tersedia</h4>
              <p className="text-[11px] text-zinc-350 mt-1.5 leading-relaxed">Kami mendeteksi adanya kartu kustom lokal Anda. Sinkronisasikan sekarang untuk menyimpannya di awan cloud Firestore Anda secara aman!</p>
            </div>
          </div>
          <button
            onClick={handleSyncLocalCardsWithCloud}
            disabled={isLoadingCloud}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl hover:brightness-110 active:scale-95 duration-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10"
          >
            {isLoadingCloud ? (
              <>
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyelaraskan...</span>
              </>
            ) : (
              <>
                <CloudLightning className="w-3.5 h-3.5" />
                <span>Unggah ke Awan</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Title block with persistent custom toggle */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center pb-5 border-b border-white/5 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">Anki Core</span>
            <h2 className="text-2xl font-black text-white tracking-tight font-sans">Spaced-Repetition Chemistry Flashcards</h2>
            
            {/* Cloud Status Indicator */}
            {currentUser ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-teal-500/15 text-teal-400 border border-teal-500/20 font-bold uppercase flex items-center gap-1.5" title="Semua data disinkronisasikan ke database cloud (Firestore)">
                <Database className="w-3 h-3 text-teal-400 animate-pulse" />
                <span>Cloud Synced</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700 font-bold uppercase flex items-center gap-1.5" title="Data disimpan di browser lokal (LocalStorage). Masuk untuk menyimpan ke cloud.">
                <CloudOff className="w-3 h-3 text-zinc-400" />
                <span>Local State Only</span>
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Metode belajar aktif menggunakan kartu flash dan feedback spasial. Tarik memori jangka panjang Anda dengan cepat untuk mengingat konsep senyawa, ikatan, mekanika kuantum, dan indikator kimia.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button
            onClick={handleShuffleDeck}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isShuffleActive 
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-300' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
            }`}
            title="Kocok urutan kartu secara random"
          >
            <Shuffle className={`w-3.5 h-3.5 ${isShuffleActive ? 'animate-spin' : ''}`} />
            {isShuffleActive ? 'Random On' : 'Kocok Deck'}
          </button>
          <button
            onClick={() => setIsTimerMode(!isTimerMode)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isTimerMode 
                ? 'bg-red-500/15 border-red-500/45 text-red-300' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
            }`}
            title="Aktifkan timer batas berpikir cepat"
          >
            <Timer className={`w-3.5 h-3.5 ${isTimerMode ? 'animate-pulse' : ''}`} />
            {isTimerMode ? 'Speed Timer On' : 'Mode Cepat'}
          </button>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer active:scale-95 hover:brightness-110 transition-all ml-auto xl:ml-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            {isCreating ? 'Kembali Ke Deck' : 'Buat Kartu Baru'}
          </button>
        </div>
      </div>

      {/* Gamified Statistical Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Streak Sekarang</div>
            <div className="text-lg font-black text-white">{sessionStreak} <span className="text-xs text-amber-400 font-normal">kartu</span></div>
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Award className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Streak Tertinggi</div>
            <div className="text-lg font-black text-white">{maxStreak} <span className="text-xs text-teal-400 font-normal">max</span></div>
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Sesi Direview</div>
            <div className="text-lg font-black text-white">{sessionReviewed} <span className="text-xs text-purple-400 font-normal">total</span></div>
          </div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BarChart2 className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Distribusi feedback</div>
            <div className="flex gap-1.5 mt-1 text-[10px]">
              <span className="text-red-400" title="Again">{ratingsCount.again}x</span>
              <span className="text-zinc-500">|</span>
              <span className="text-orange-400" title="Hard">{ratingsCount.hard}x</span>
              <span className="text-zinc-500">|</span>
              <span className="text-blue-400" title="Good">{ratingsCount.good}x</span>
              <span className="text-zinc-500">|</span>
              <span className="text-green-400" title="Easy">{ratingsCount.easy}x</span>
            </div>
          </div>
        </div>
      </div>

      {isCreating ? (
        /* Create Card Panel */
        <div className="glass-panel max-w-xl mx-auto rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden ring-1 ring-white/5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tambahkan Unit Kartu Baru</h3>
              <p className="text-[11px] text-zinc-400">Arsip kustom disimpan secara privat pada device penyimpanan lokal Anda.</p>
            </div>
          </div>

          <form onSubmit={handleCreateCard} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-mono tracking-wider font-bold uppercase text-[9.5px]">Kategori Kimia</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:border-amber-500 focus:outline-none placeholder-zinc-650"
                >
                  <option value="Elements">Elements (Daftar Unsur)</option>
                  <option value="Molecular Geometry">Molecular Geometry (Geometri Molekul)</option>
                  <option value="Chemical Bonding">Chemical Bonding (Ikatan Kimia)</option>
                  <option value="Titration Metrics">Titration Metrics (Indikator &amp; pH)</option>
                  <option value="Stoichiometry">Stoichiometry (Perhitungan Mol)</option>
                  <option value="Atomic Physics">Atomic Physics (Model &amp; Fisika Atom)</option>
                  <option value="Organic Chemistry">Organic Chemistry (Kovalen Karbon)</option>
                  <option value="Chemical Point &amp; Equilibrium">Equilibrium &amp; Gas Law (Kesetimbangan)</option>
                  <option value="Thermochemistry">Thermochemistry (Entalpi Panas)</option>
                  <option value="Electrochemistry">Electrochemistry (Faraday &amp; Volt)</option>
                  <option value="Kinetics">Kinetics (Laju Reaksi)</option>
                  <option value="Colloids &amp; Solutions">Colloids &amp; Solutions (Campuran)</option>
                  <option value="Macromolecules">Macromolecules (Biomolekul)</option>
                  <option value="Other">Lainnya (Ketik Manual)</option>
                </select>
              </div>

              {customCategory === 'Other' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-zinc-400 font-mono tracking-wider font-bold uppercase text-[9.5px]">Nama Kategori Kustom</label>
                  <input
                    type="text"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                    placeholder="Contoh: Kesetimbangan Asam"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 font-mono tracking-wider font-bold uppercase text-[9.5px]">Pertanyaan Praktikum / Teori (FRONT SIDE)</label>
              <textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Misal: Berapa muatan formal atom pusat sulfur di molekul SF6?"
                rows={3}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20 text-xs leading-relaxed"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-mono tracking-wider font-bold uppercase text-[9.5px]">Jawaban Detail &amp; Analisis (BACK SIDE)</label>
              <textarea
                value={customAnswer}
                onChange={(e) => setCustomAnswer(e.target.value)}
                placeholder="Misal: Muatan formal Sulfur adalah 0. Konfigurasi 6e- valensi luar digunakan penuh mengikat 6F menghasilkan ikatan elektro-netral simetris."
                rows={3}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20 text-xs leading-relaxed"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 font-sans font-bold text-[11px] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-500/70" />
                <span>Petunjuk Rahasia (Hint - Opsional)</span>
              </label>
              <input
                type="text"
                value={customHint}
                onChange={(e) => setCustomHint(e.target.value)}
                placeholder="Misal: Gunakan perhitungan Muatan Formal = V - N - B/2"
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold rounded-xl cursor-pointer hover:bg-zinc-850 active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold rounded-xl text-zinc-950 shadow-lg shadow-amber-500/10 cursor-pointer active:scale-95 transition-all"
              >
                Masukkan ke Deck Belajar
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Active Cards Session visualization mode */
        <div className="space-y-6">
          
          {/* Active Navigation Sidebar filter and search widget row */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-3 rounded-2xl flex flex-col md:flex-row gap-3 items-center">
            <div className="relative w-full md:w-56 shrink-0">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                <Filter className="w-3.5 h-3.5" />
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-8.5 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl focus:outline-none focus:border-teal-500 cursor-pointer w-full"
              >
                <option value="All">Semua Kategori ({deck.length})</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pertanyaan flashcard..."
                className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 pl-9 pr-4 py-1.5 rounded-xl focus:outline-none focus:border-teal-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1.5 text-zinc-500 hover:text-white font-mono text-[10px]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="max-w-xl mx-auto flex flex-col items-center">
            {currentIndex < filteredCards.length ? (
              <div className="w-full space-y-5">
                
                {/* Active index card and visual meta header */}
                <div className="flex justify-between items-center text-xs font-mono text-zinc-500 px-1">
                  <span className="flex items-center gap-1.5 uppercase">
                    <span className="w-2 h-2 rounded-full bg-amber-400 block" />
                    Topik: <span className="text-amber-400 font-bold">{activeCard.category}</span>
                  </span>
                  <span>{currentIndex + 1} / {filteredCards.length} CARD</span>
                </div>

                {/* Speed timer visual banner bar (Only triggers if speed timer mode active) */}
                {isTimerMode && (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-mono text-red-400 uppercase">
                      <span className="flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                        <span>SPEED RETRIEVAL TICK-CLOCK</span>
                      </span>
                      <span>{timeLeft} DETIK TERSISA</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          timeLeft > 10 ? 'bg-teal-500' : timeLeft > 5 ? 'bg-orange-500' : 'bg-red-500 animate-pulse'
                        }`}
                        style={{ width: `${(timeLeft / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 3D Rotating card board box model */}
                <div className="card-perspective w-full h-[340px]">
                  <div 
                    onClick={handleFlip}
                    className={`w-full h-full cursor-pointer relative card-inner ${isFlipped ? 'card-flip' : ''}`}
                  >
                    {/* FRONT SIDE (Question card view) */}
                    <div className="absolute inset-0 bg-zinc-900 border-2 border-zinc-850 rounded-3xl flex flex-col justify-between p-6 shadow-2xl backface-hidden ring-1 ring-white/5 overflow-hidden group">
                      
                      {/* Decorative layout element */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/2 rounded-full blur-2xl group-hover:bg-amber-500/5 transition-all" />
                      
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 select-none">
                        <span>FRONT SIDE (SISI PERTANYAAN)</span>
                        <BookOpen className="w-4.5 h-4.5 text-amber-500" />
                      </div>

                      <div className="text-center py-4 flex flex-col justify-center items-center flex-1">
                        <div className="text-sm md:text-base font-bold text-slate-100 select-normal leading-relaxed max-w-md px-2 font-sans md:px-4 text-balance">
                          {activeCard.question}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-850/60 select-none">
                        {activeCard.id.startsWith('custom-') ? (
                          <button
                            onClick={(e) => handleDeleteCustomCard(activeCard.id, e)}
                            className="bg-zinc-950/80 p-2 border border-zinc-850 text-red-400 hover:text-red-300 hover:border-red-500/30 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-mono text-[10px]"
                            title="Hapus kartu kustom dari perangkat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <div className="w-5" />
                        )}
                        <span className="text-center font-mono text-[9px] text-zinc-500 tracking-wider">
                          TEKAN DI SINI UNTUK BALIK KARTU
                        </span>
                        <div className="w-5" />
                      </div>
                    </div>

                    {/* BACK SIDE (Answer explanation view) */}
                    <div className="absolute inset-0 bg-zinc-950 border-2 border-amber-500/50 rounded-3xl flex flex-col justify-between p-6 shadow-2xl [transform:rotateY(180deg)] backface-hidden ring-1 ring-amber-500/10 overflow-y-auto">
                      
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                        <span>BACK SIDE (KUNCI PENJELASAN)</span>
                        <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                      </div>

                      <div className="py-4 text-[13px] md:text-sm font-sans text-amber-100 font-normal leading-relaxed text-center px-2 md:px-5">
                        {activeCard.answer}
                      </div>

                      <div className="text-center font-mono text-[9px] text-zinc-500 tracking-wider select-none">
                        KLIK LAGI UNTUK ROTASI KE DEPAN
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hints drawer helper */}
                {activeCard.hint && (
                  <div className="text-center">
                    {showHint ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 text-xs text-amber-200 rounded-xl leading-normal mt-1 shadow-md animate-fade-in max-w-sm text-left">
                        <AlertCircle className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                        <span>Petunjuk: {activeCard.hint}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowHint(true)}
                        className="text-xs font-mono text-amber-500/70 hover:text-amber-400 hover:underline transition-all cursor-pointer inline-flex items-center gap-1.5 hover:scale-103 font-bold"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Buka petunjuk bantuan (Reveal Hint)</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Flashcard Evaluation Rating controls */}
                <div className="space-y-3.5">
                  {isFlipped ? (
                    <div className="space-y-2">
                      <div className="text-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
                        Seberapa baik Anda mengingat materi ini?
                      </div>
                      <div className="grid grid-cols-4 gap-2 animate-fade-in text-xs font-mono">
                        <button
                          onClick={() => handleAnswerRating('again')}
                          className="py-3 bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 active:scale-95 duration-100 rounded-2xl font-bold cursor-pointer transition-all flex flex-col items-center gap-0.5"
                        >
                          <span className="font-sans font-extrabold text-[12.5px] tracking-tight">Again</span>
                          <span className="text-[9px] opacity-70 font-semibold font-sans">&lt; 1 mnt</span>
                        </button>
                        <button
                          onClick={() => handleAnswerRating('hard')}
                          className="py-3 bg-orange-500/10 border border-orange-500/40 text-orange-400 hover:bg-orange-500/20 active:scale-95 duration-100 rounded-2xl font-bold cursor-pointer transition-all flex flex-col items-center gap-0.5"
                        >
                          <span className="font-sans font-extrabold text-[12.5px] tracking-tight">Hard</span>
                          <span className="text-[9px] opacity-70 font-semibold font-sans">12 jam</span>
                        </button>
                        <button
                          onClick={() => handleAnswerRating('good')}
                          className="py-3 bg-blue-500/10 border border-blue-500/40 text-blue-400 hover:bg-blue-500/20 active:scale-95 duration-100 rounded-2xl font-bold cursor-pointer transition-all flex flex-col items-center gap-0.5"
                        >
                          <span className="font-sans font-extrabold text-[12.5px] tracking-tight">Good</span>
                          <span className="text-[9px] opacity-70 font-semibold font-sans">2 hari</span>
                        </button>
                        <button
                          onClick={() => handleAnswerRating('easy')}
                          className="py-3 bg-green-500/10 border border-green-500/40 text-green-400 hover:bg-green-500/20 active:scale-95 duration-100 rounded-2xl font-bold cursor-pointer transition-all flex flex-col items-center gap-0.5"
                        >
                          <span className="font-sans font-extrabold text-[12.5px] tracking-tight">Easy</span>
                          <span className="text-[9px] opacity-70 font-semibold font-sans">6 hari</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleFlip}
                      className="w-full py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white rounded-2xl text-sm font-bold flex justify-center items-center gap-2 hover:bg-zinc-850 hover:border-zinc-700 active:scale-[0.98] transition-all cursor-pointer shadow-lg group relative overflow-hidden"
                    >
                      <Eye className="w-4.5 h-4.5 text-amber-500 animate-pulse group-hover:scale-110 transition-transform" />
                      <span>Buka Kunci Penjelasan (Reveal Answer)</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Completed Deck state */
              <div className="glass-panel text-center p-8 rounded-3xl w-full space-y-6 flex flex-col items-center shadow-xl ring-1 ring-white/5 max-w-md">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner animate-bounce">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-white">Sesi Deck Selesai!</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Semua kartu terpilih telah berhasil Anda review dan amati secara sukses. Kurva memori Anda disegarkan kembali untuk retensi jangka panjang maksimal.
                  </p>
                </div>

                {/* Session Report Card */}
                <div className="bg-zinc-950/80 rounded-2xl p-4 w-full border border-zinc-900 space-y-3.5 text-left text-xs font-mono">
                  <div className="text-[10px] text-zinc-500 border-b border-zinc-900 pb-2 flex justify-between uppercase">
                    <span>Laporan Analisis Retensi Sesi</span>
                    <span className="text-teal-400">Complete</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pb-1">
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">Review Terjawab</span>
                      <span className="text-sm font-black text-white">{sessionReviewed} kartu</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase">Streak Maksimal</span>
                      <span className="text-sm font-black text-teal-400">{maxStreak} kartu</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase mb-1">Rincian Rating Tombol</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 text-[10px]">{ratingsCount.again}x Again</span>
                      <span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-400 text-[10px]">{ratingsCount.hard}x Hard</span>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px]">{ratingsCount.good}x Good</span>
                      <span className="px-2 py-0.5 rounded-lg bg-green-500/10 text-green-400 text-[10px]">{ratingsCount.easy}x Easy</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full pt-1">
                  {selectedCategory !== 'All' || searchQuery !== '' ? (
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                        handleReset();
                      }}
                      className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-bold rounded-2xl text-xs active:scale-95 transition-all text-center cursor-pointer"
                    >
                      Buka Semua Kat
                    </button>
                  ) : null}
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 text-zinc-950 font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Review Ulang Deck
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
