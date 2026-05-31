/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Mail, Lock, ShieldCheck, X, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { UserAccount } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { INITIAL_MASTERY_DATA } from '../data';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'guru' | 'siswa'>('siswa');

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim() || (isSignUp && !name.trim())) {
      setError('Harap isi semua bidang yang diperlukan.');
      return;
    }

    if (password.length < 5) {
      setError('Password harus minimal 5 karakter demi keamanan laboratorium.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Create user in firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const firebaseUser = userCredential.user;

        // Set display name in Auth
        await updateProfile(firebaseUser, { displayName: name.trim() });

        const creationTimeStr = firebaseUser.metadata.creationTime 
          ? new Date(firebaseUser.metadata.creationTime).toISOString() 
          : new Date().toISOString();

        const userAcct: UserAccount = {
          id: firebaseUser.uid,
          name: name.trim(),
          email: firebaseUser.email || email.trim(),
          createdAt: creationTimeStr,
          role: role
        };

        // Create document in Firestore
        try {
          // Store selected registration role in localStorage temporarily
          localStorage.setItem('chemvibe_registration_role', role);
          localStorage.setItem('chemvibe_role_mode', role);

          await setDoc(doc(db, 'users', firebaseUser.uid), {
            id: userAcct.id,
            name: userAcct.name,
            email: userAcct.email,
            createdAt: userAcct.createdAt,
            role: role,
            masteryLevels: INITIAL_MASTERY_DATA
          });
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }

        setSuccess('Registrasi sukses! Menghubungkan konsol...');
        setTimeout(() => {
          onLoginSuccess(userAcct);
          onClose();
          // Reset state
          setName('');
          setEmail('');
          setPassword('');
          setLoading(false);
        }, 1000);

      } else {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const firebaseUser = userCredential.user;

        const userAcct: UserAccount = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Peneliti',
          email: firebaseUser.email || email.trim(),
          createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime).toISOString() : new Date().toISOString()
        };

        setSuccess(`Selamat datang kembali, ${userAcct.name}!`);
        setTimeout(() => {
          onLoginSuccess(userAcct);
          onClose();
          // Reset state
          setEmail('');
          setPassword('');
          setLoading(false);
        }, 1000);
      }
    } catch (err: any) {
      setLoading(false);
      let errMsg = err.message || 'Terjadi kesalahan sistem.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Email ini sudah terdaftar sebagai peneliti.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Format email tidak valid.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password terlalu lemah.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Kredensial salah. Silakan periksa kembali email dan password.';
      } else if (err.code === 'auth/network-request-failed' || (err.message && err.message.includes('network-request-failed'))) {
        errMsg = 'Koneksi ke Firebase gagal (auth/network-request-failed). Hal ini biasanya terjadi jika Anda menyalakan Ad-Blocker (uBlock Origin/AdBlock), Brave Shields, atau ekstensi privasi yang memblokir request ke API Google. Silakan nonaktifkan Ad-Blocker pada domain ini, gunakan mode Penyamaran (Incognito), atau buka aplikasi ini di tab baru.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Autentikasi Email/Password belum diaktifkan di Firebase Console Anda. Silakan buka Firebase Console (https://console.firebase.google.com/project/molten-goal-398807/authentication/providers), pilih tab "Sign-in method", lalu aktifkan opsi "Email/Password" agar pendaftaran dan login dapat berfungsi secara riil.';
      }
      setError(errMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient glowing lines */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500"></div>
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-900 transition-colors"
          id="auth-modal-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-black text-white">
                {isSignUp ? 'Daftar Akun Lab Baru' : 'Masuk Konsol ChemVibe'}
              </h3>
              <p className="text-[10px] text-teal-400 uppercase tracking-widest font-mono font-bold">
                {isSignUp ? 'CREATE_LAB_CREDENTIALS' : 'RE-AUTHENTICATE_SECURE_NODE'}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-normal">
            {isSignUp 
              ? 'Mulai perjalanan riset virtual Anda. Hubungkan progress pembelajaran Anda dengan akun permanen demi visualisasi progress jangka panjang.'
              : 'Silakan masuk untuk memulihkan sertifikat, riwayat kuis, kustomisasi liasons kation, dan metrik pembelajaran.'
            }
          </p>

          <form onSubmit={handleAuth} className="space-y-3 pt-2">
            {isSignUp && (
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] sm:text-[10px] font-mono text-slate-500 font-bold uppercase block">PERAN DI LABORATORIUM (ROLE)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('siswa')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer border transition-all text-center flex items-center justify-center gap-1.5 ${
                      role === 'siswa'
                        ? 'bg-teal-500/10 border-teal-500 text-teal-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <span>Peneliti (Siswa)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('guru')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer border transition-all text-center flex items-center justify-center gap-1.5 ${
                      role === 'guru'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-indigo-400/80'
                    }`}
                  >
                    <span>Pendidik (Guru)</span>
                  </button>
                </div>
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">NAMA LENGKAP PENELITI</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Marie Curie"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">EMAIL PENELITI</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="curie@chemvibe.edu"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-500 font-bold uppercase block">SANDI KORIDOR (PASSWORD)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500/50 font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 font-mono">
                {error}
              </div>
            )}

            {success && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-750 disabled:text-slate-500 disabled:scale-100 text-slate-950 font-bold rounded-xl text-xs hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <span className="animate-pulse">Sedang Menghubungkan...</span>
              ) : isSignUp ? (
                <>
                  Daftar & Hubungkan <UserPlus className="w-4 h-4" />
                </>
              ) : (
                <>
                  Autentikasi Konsol <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
              }}
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors underline decoration-dotted underline-offset-4"
            >
              {isSignUp ? 'Sudah memiliki akun? Masuk di sini.' : 'Belum punya sertifikat lab? Registrasi diri sekarang.'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
