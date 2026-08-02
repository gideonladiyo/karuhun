import React from 'react';
import { Shield, BookOpen, Award, ExternalLink } from 'lucide-react';
import { GUILD_BRANCHES } from '@/services/imageUtils';

export const GuildRulesModal: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-8 border border-zinc-700 space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-white" />
          <span>Karuhun Alliance Rules &amp; Operational Standards</span>
        </div>
        <h2 className="text-3xl font-heading font-black text-white">
          GUILD RULES &amp; <span className="text-zinc-500">STRUCTURE</span>
        </h2>
        <p className="text-sm font-sans text-zinc-300 max-w-2xl leading-relaxed">
          Karuhun (夜) is a competitive Punishing: Gray Raven guild corps operating across Asia-Pacific and North America servers.
        </p>
      </div>

      {/* 4 Guild Branches Reference */}
      <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
        <h3 className="text-xl font-heading font-bold text-white flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>ALLIANCE DIVISIONS &amp; GUILD IDS</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GUILD_BRANCHES.map((b) => (
            <div key={b.id} className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-tech font-bold text-zinc-400 uppercase tracking-widest">{b.region}</span>
              <h4 className="font-heading font-bold text-base text-white">{b.name}</h4>
              <div className="text-xs font-tech text-zinc-300 space-y-1">
                <div>Guild ID: <span className="font-bold text-white">{b.id}</span></div>
                <div>Server: <span className="font-bold uppercase text-zinc-400">{b.server}</span></div>
                <div>Role: <span className="text-zinc-500">{b.tag}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Ranks Mapping (Rule.txt) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Warzone Ranks */}
        <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
          <h3 className="text-xl font-heading font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>WARZONE RANK LEVELS</span>
          </h3>

          <div className="space-y-3 font-tech">
            <div className="flex justify-between items-center bg-black p-3 rounded-xl border border-zinc-800">
              <span className="font-bold text-white">Legend Division</span>
              <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold uppercase">ID Level: 16</span>
            </div>

            <div className="flex justify-between items-center bg-black p-3 rounded-xl border border-zinc-800">
              <span className="font-bold text-zinc-300">Hero Division</span>
              <span className="bg-zinc-800 text-zinc-200 px-3 py-1 rounded-full text-xs font-bold uppercase">ID Level: 15</span>
            </div>

            <div className="flex justify-between items-center bg-black p-3 rounded-xl border border-zinc-800">
              <span className="font-bold text-zinc-400">Leader Division</span>
              <span className="bg-zinc-900 text-zinc-400 px-3 py-1 rounded-full text-xs font-bold uppercase">ID Level: 14</span>
            </div>
          </div>
        </div>

        {/* PPC Ranks */}
        <div className="glass-panel rounded-2xl p-6 border border-zinc-800 space-y-4">
          <h3 className="text-xl font-heading font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>PHANTOM PAIN CAGE (PPC) RANKS</span>
          </h3>

          <div className="space-y-3 font-tech">
            <div className="flex justify-between items-center bg-black p-3 rounded-xl border border-zinc-800">
              <span className="font-bold text-white">Ultimate PPC (Level 80 - 120)</span>
              <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold uppercase">ID Level: 4</span>
            </div>

            <div className="flex justify-between items-center bg-black p-3 rounded-xl border border-zinc-800">
              <span className="font-bold text-zinc-300">Advanced PPC</span>
              <span className="bg-zinc-800 text-zinc-200 px-3 py-1 rounded-full text-xs font-bold uppercase">ID Level: 3</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recruitment & Application rules */}
      <div className="glass-panel rounded-2xl p-6 border border-zinc-700 space-y-4 text-center">
        <h3 className="text-xl font-heading font-bold text-white">
          RECRUITMENT &amp; DISCORD COMMUNITY
        </h3>
        <p className="text-sm font-sans text-zinc-300 max-w-xl mx-auto">
          All active command operatives are encouraged to participate in weekly guild contribution battles and join our official community Discord.
        </p>
        <a
          href="https://linktr.ee/karuhuncorps"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-black font-heading font-bold text-xs hover:bg-zinc-200 transition-all shadow-lg uppercase"
        >
          <span>Visit Official Karuhun Discord</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
