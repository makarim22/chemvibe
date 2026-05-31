/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { REACTIONS_DATA } from '../data';
import { StoichReaction } from '../types';
import { Scale, Info } from 'lucide-react';

export default function StoichiometryCalculator({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [selectedReaction, setSelectedReaction] = useState<StoichReaction>(REACTIONS_DATA[0]); // Default Water synthesis
  const [mass1, setMass1] = useState<string>('10.0'); // Mass of reactant 1 in grams
  const [mass2, setMass2] = useState<string>('80.0'); // Mass of reactant 2 in grams

  // 1. Calculate everything synchronously during render
  const r1 = selectedReaction.reactants[0];
  const r2 = selectedReaction.reactants[1];

  const m1 = parseFloat(mass1) || 0;
  const m2 = parseFloat(mass2) || 0;

  const moles1 = m1 / r1.mw;
  const moles2 = m2 / r2.mw;

  let limitingReactant = 'Isi data awal';
  let theoreticalYield: { symbol: string; mass: number; name: string; mw: number }[] = [];
  let excessLeftover: { symbol: string; mass: number } | null = null;

  if (moles1 > 0 && moles2 > 0) {
    const ratio1 = moles1 / r1.coef;
    const ratio2 = moles2 / r2.coef;

    const limitingIdx = ratio1 < ratio2 ? 0 : 1;
    const limitingReactantObj = selectedReaction.reactants[limitingIdx];
    const excessReactantObj = selectedReaction.reactants[limitingIdx === 0 ? 1 : 0];

    limitingReactant = `${limitingReactantObj.name} (${limitingReactantObj.symbol})`;

    const limitingRatio = Math.min(ratio1, ratio2);

    theoreticalYield = selectedReaction.products.map(p => {
      const pMoles = limitingRatio * p.coef;
      const pMass = pMoles * p.mw;
      return {
        symbol: p.symbol,
        mass: pMass,
        name: p.name,
        mw: p.mw
      };
    });

    const excessMolesInitially = limitingIdx === 0 ? moles2 : moles1;
    const excessCoef = excessReactantObj.coef;
    const excessMolesCons = limitingRatio * excessCoef;
    const excessMolesRem = Math.max(0, excessMolesInitially - excessMolesCons);
    const excessMassRem = excessMolesRem * excessReactantObj.mw;

    excessLeftover = {
      symbol: excessReactantObj.symbol,
      mass: excessMassRem
    };
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-black text-white tracking-tight">Stoichiometry Calculator</h2>
        <p className="text-slate-400 text-sm">
          Pilih reaksi kimia, tentukan massa reaktan mula-mula, dan temukan reaktan pembatas serta hasil teoritis zat produk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Reactants inputs side options (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`glass-panel rounded-2xl p-6 space-y-5 border ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-slate-100/50'}`}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-400" />
              Pilih Reaksi Kimia
            </h3>

            {/* Reaction option radio list */}
            <div className="space-y-2.5">
              {REACTIONS_DATA.map((rxn) => {
                const isSelected = selectedReaction.id === rxn.id;
                return (
                  <button
                    key={rxn.id}
                    onClick={() => {
                      setSelectedReaction(rxn);
                      setMass1('10.0'); // reset
                      setMass2('80.0');
                    }}
                    className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-teal-500/10 border-teal-500 text-white shadow-md' 
                        : 'bg-slate-950/40 border-slate-905 text-slate-400 hover:text-slate-205 hover:bg-slate-900'
                    }`}
                  >
                    <div className="font-mono text-xs text-slate-500 block">REACTION FORMULA</div>
                    <div className="text-lg font-black font-sans mt-1 tracking-tight">{rxn.equation}</div>
                  </button>
                );
              })}
            </div>

            {/* Reactant Mass entry inputs fields */}
            <div className="border-t border-slate-800 pt-5 space-y-4">
              <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-widest block font-bold">Mass Inputs (Grams)</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold font-sans">
                    Massa {selectedReaction.reactants[0].symbol} (g)
                  </label>
                  <input
                    type="number"
                    value={mass1}
                    aria-label={`Massa ${selectedReaction.reactants[0].symbol} dalam gram`}
                    onChange={(e) => setMass1(e.target.value)}
                    className={`w-full border rounded-lg p-2 font-mono text-sm focus:border-teal-500 focus:outline-none ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-slate-100/80 border-slate-300 text-slate-900'}`}
                    placeholder="Masukkan massa"
                  />
                  <span className="text-[10px] text-slate-505 font-mono block text-slate-500">
                    MW: {selectedReaction.reactants[0].mw.toFixed(3)} g/mol
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold font-sans">
                    Massa {selectedReaction.reactants[1].symbol} (g)
                  </label>
                  <input
                    type="number"
                    value={mass2}
                    aria-label={`Massa ${selectedReaction.reactants[1].symbol} dalam gram`}
                    onChange={(e) => setMass2(e.target.value)}
                    className={`w-full border rounded-lg p-2 font-mono text-sm focus:border-teal-500 focus:outline-none ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-slate-100/80 border-slate-300 text-slate-900'}`}
                    placeholder="Masukkan massa"
                  />
                  <span className="text-[10px] text-slate-505 font-mono block text-slate-500">
                    MW: {selectedReaction.reactants[1].mw.toFixed(3)} g/mol
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Math results diagnostic display grid (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`glass-panel rounded-2xl p-6 space-y-6 border ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-slate-100/50'}`}>
            <h3 className="text-sm font-mono text-slate-500 font-bold uppercase tracking-widest">
              Laporan Hasil Stoikiometri
            </h3>

            {/* Calculations summaries row metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${theme === 'dark' ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                <div>
                  <span className="text-[10px] font-mono text-slate-500">LIMITING REACTANT</span>
                  <div className="text-lg font-black text-teal-400 font-sans tracking-tight mt-1">
                    {limitingReactant}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-2 select-none">
                  Zat ini habis bereaksi terlebih dahulu dan membatasi massa zat hasil reaksi yang dapat diproduksi.
                </p>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col justify-between ${theme === 'dark' ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                <div>
                  <span className="text-[10px] font-mono text-slate-500">EXCESS LEFTOVER SPEC</span>
                  <div className="text-lg font-black text-amber-500 font-sans tracking-tight mt-1">
                    {excessLeftover ? `${excessLeftover.mass.toFixed(3)}g sisa` : '0g (Reaktif Setara)'}
                  </div>
                </div>
                {excessLeftover && (
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-2">
                    Masih ada sisa reaktan senilai <span className="font-bold text-white">{excessLeftover.mass.toFixed(1)}g</span> unsur <span className="font-bold text-white">{excessLeftover.symbol}</span> setelah reaksi berhenti.
                  </p>
                )}
              </div>
            </div>

            {/* Products yield calculations results */}
            <div className="space-y-3 border-t border-slate-800 pt-5">
              <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-widest block font-bold">Hasil Produk Teoritis (Yield)</span>
              <div className="space-y-2">
                {theoreticalYield.length > 0 ? (
                  theoreticalYield.map((p) => (
                    <div key={p.symbol} className={`flex justify-between items-center p-3.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                      <div>
                        <span className="text-xs font-black font-sans text-white">{p.name} ({p.symbol})</span>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Massa Teoritis = mol × MW
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black font-mono text-white">{p.mass.toFixed(3)} g</span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          { (p.mass / p.mw).toFixed(3) } moles
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic">Masukkan nilai massa reaktan yang valid untuk memulai perhitungan molekuler.</div>
                )}
              </div>
            </div>

            {/* Molar summary step diagram */}
            <div className="bg-teal-500/[0.02] border border-teal-500/10 p-4 rounded-xl text-xs space-y-2.5">
              <div className="font-bold text-white flex items-center gap-1.5 font-sans">
                <Info className="w-4 h-4 text-teal-400" />
                Siklus Pembelajaran Mol Reaksi
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-500 border-b border-slate-800 pb-2">
                <div>PARAMETER</div>
                <div>{selectedReaction.reactants[0].symbol}</div>
                <div>{selectedReaction.reactants[1].symbol}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono text-slate-300">
                <div className="text-slate-500 text-left">Initial Grams</div>
                <div>{(parseFloat(mass1) || 0).toFixed(1)}g</div>
                <div>{(parseFloat(mass2) || 0).toFixed(1)}g</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono text-zinc-300">
                <div className="text-slate-500 text-left">Initial Moles</div>
                <div>{moles1.toFixed(3)} mol</div>
                <div>{moles2.toFixed(3)} mol</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
