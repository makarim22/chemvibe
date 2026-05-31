/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChemicalElement {
  number: number;
  symbol: string;
  name: string;
  weight: number;
  category: ElementCategory;
  configuration: string;
  electronegativity: number | null;
  phase: 'Gas' | 'Liquid' | 'Solid' | 'Synthetic';
  shells: number[];
  discoveredBy?: string;
  summary: string;
  valenceElectrons: number;
}

export type ElementCategory = 
  | 'alkali-metals' 
  | 'alkaline-earth' 
  | 'transition-metals' 
  | 'post-transition' 
  | 'metalloids' 
  | 'nonmetals' 
  | 'noble-gases' 
  | 'lanthanides'
  | 'actinides';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  category: string;
  hint?: string;
}

export interface VSEPRMolecule {
  formula: string;
  name: string;
  geometry: string;
  stericNumber: number;
  lonePairs: number;
  bondAngles: string;
  hybridization: string;
  description: string;
}

export interface StoichReaction {
  id: string;
  equation: string; // e.g. "2 H2 + O2 -> 2 H2O"
  reactants: { symbol: string; coef: number; mw: number; name: string }[];
  products: { symbol: string; coef: number; mw: number; name: string }[];
}

export interface MasteryDay {
  day: string;
  level: number; // percentage (0 - 100)
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string; // e.g. custom initials
  createdAt: string;
  completedMissions?: number[];
  atomHighscore?: number;
  periodicHighscore?: number;
  role?: 'guru' | 'siswa';
  classCode?: string;
  className?: string;
}

export interface Classroom {
  code: string;
  className: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  activityType: 'quiz_completed' | 'flashcard_reviewed' | 'simulation_run' | 'element_inspected';
  title: string;
  description: string;
  score?: {
    earned: number;
    total: number;
  };
  timestamp: string;
}

export interface UserProgressLog {
  userId: string;
  masteryLevels: MasteryDay[];
  activities: ActivityLog[];
  completedLabs: string[];
}

