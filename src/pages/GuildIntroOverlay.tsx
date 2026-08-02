import React, { useState, useRef } from 'react';
const karuhunLogo = '/logo.png';
const karuhunIntroVideo = '/videos/guild-intro.mp4';
import { ArrowRight, Volume2, VolumeX, SkipForward } from 'lucide-react';

interface GuildIntroOverlayProps {
  onEnter: () => void;
}

export const GuildIntroOverlay: React.FC<GuildIntroOverlayProps> = ({ onEnter }) => {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Cinematic MP4 Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={karuhunIntroVideo}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover filter contrast-125 brightness-90 opacity-70"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
      </div>

      {/* Top Bar Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-3">
        <button
          onClick={toggleMute}
          className="p-3 rounded-full bg-zinc-900/80 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-all backdrop-blur-md"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>

        <button
          onClick={handleStart}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-zinc-900/80 border border-zinc-700 hover:border-white text-xs font-tech font-bold text-zinc-300 hover:text-white transition-all backdrop-blur-md"
        >
          <span>SKIP INTRO</span>
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Center Cinematic Card */}
      <div className="relative z-10 max-w-lg w-full mx-4 p-8 text-center space-y-6 animate-fadeIn">
        {/* Main Logo Container */}
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center p-2 bg-black/60 rounded-3xl border-2 border-white shadow-2xl shadow-white/10 backdrop-blur-md">
          <img
            src={karuhunLogo}
            alt="Karuhun Logo"
            className="w-full h-full object-contain filter contrast-125 drop-shadow-lg"
          />
        </div>

        {/* Guild Branding */}
        <div className="space-y-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white text-black font-tech font-black text-xs uppercase tracking-widest shadow-md">
            PGR INTERNATIONAL GUILD
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-black text-white tracking-wider">
            KARUHUN <span className="text-zinc-500">夜</span>
          </h1>
          <p className="text-xs font-tech text-zinc-300 tracking-wider uppercase">
            Asia-Pacific &amp; North America Operational Command
          </p>
        </div>

        {/* Enter Button */}
        <div className="pt-4">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-heading font-black text-sm transition-all duration-300 shadow-2xl shadow-white/20 hover:scale-105 uppercase tracking-wider group"
          >
            <span>ENTER WEBSITE PORTAL</span>
            <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
