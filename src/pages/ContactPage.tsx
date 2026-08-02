import React from 'react';
import {
  MAIN_DISCORD_LINK,
  OFFICIAL_YOUTUBE_LINK,
  OFFICIAL_TIKTOK_LINK,
  CONTRIBUTORS_LIST,
  ContributorItem
} from '@/data/static/contactData';
import larkshinPp from '../assets/contributor/larkshin_pp.webp';
import karuhunAdminPp from '../assets/contributor/karuhun_admin_pp.png';
import {
  Mail,
  Heart,
  Globe,
  ExternalLink
} from 'lucide-react';

const HUAXU_PP = 'https://huaxu.app/_nuxt/normalv2.small.BNupcPRj.webp';

const DiscordIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.83V7.58a6.34 6.34 0 0 0-3.37 1 6.34 6.34 0 1 0 9.71 5.39V9.11a8.31 8.31 0 0 0 5.07 1.73v-3.75a4.85 4.85 0 0 1-1.3-.4z"/>
  </svg>
);

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const ContactPage: React.FC = () => {
  const getAvatarUrl = (key: ContributorItem['avatarKey']) => {
    if (key === 'larkshin') return larkshinPp;
    if (key === 'admin') return karuhunAdminPp;
    return HUAXU_PP;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Header Banner */}
      <div className="minimal-card p-6 sm:p-10 text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5 text-white" />
          <span>CONTACT &amp; COMMUNITY</span>
        </div>
        
        <h1 className="text-2xl sm:text-4xl font-heading font-bold text-white tracking-tight">
          GET IN TOUCH WITH <span className="text-zinc-500 font-normal">KARUHUN</span>
        </h1>

        <p className="text-xs sm:text-sm font-tech text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Official social channels, community platforms, and project contributors supporting Karuhun Guild Portal.
        </p>

        {/* Official Karuhun Social & Contact Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={OFFICIAL_YOUTUBE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#09090b] hover:bg-white text-zinc-300 hover:text-black border border-[#27272a] text-xs font-tech font-bold transition-all shadow-sm group"
          >
            <YoutubeIcon className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors" />
            <span>@karuhun_union67</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </a>

          <a
            href={OFFICIAL_TIKTOK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#09090b] hover:bg-white text-zinc-300 hover:text-black border border-[#27272a] text-xs font-tech font-bold transition-all shadow-sm group"
          >
            <TikTokIcon className="w-4 h-4 text-rose-400 group-hover:text-black transition-colors" />
            <span>@karuhunguild.official</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </a>

          <a
            href={MAIN_DISCORD_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#09090b] hover:bg-white text-zinc-300 hover:text-black border border-[#27272a] text-xs font-tech font-bold transition-all shadow-sm group"
          >
            <DiscordIcon className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
            <span>Discord Server</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </a>
        </div>
      </div>

      {/* Contributors Section (Huaxu Style Layout) */}
      <div className="minimal-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white flex items-center space-x-2.5">
            <Heart className="w-5 h-5 text-white" />
            <span>Contributors</span>
          </h2>
          <p className="text-xs sm:text-sm font-tech text-zinc-400 leading-relaxed">
            During the development I&apos;ve relied on several people to help me create things or get things done that I wouldn&apos;t be able to achieve by myself:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {CONTRIBUTORS_LIST.map((c) => (
            <div
              key={c.id}
              className="bg-[#09090b] border border-[#27272a] hover:border-zinc-500 rounded-2xl p-5 flex items-start space-x-4 transition-colors"
            >
              {/* Contributor Avatar */}
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-black border border-[#27272a] p-0.5 flex-shrink-0 overflow-hidden shadow-md">
                <img
                  src={getAvatarUrl(c.avatarKey)}
                  alt={c.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Contributor Content & Links */}
              <div className="min-w-0 flex-1 space-y-2">
                <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                  {c.name}
                </h3>

                <p className="text-xs font-tech text-zinc-300 leading-relaxed">
                  {c.description}
                </p>

                {/* Social Handles & Links (If any) */}
                {(c.website || c.discordTag || c.tiktok) && (
                  <div className="flex flex-col gap-1.5 pt-1 text-xs font-tech">
                    {c.website && (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-zinc-400 hover:text-white transition-colors group"
                      >
                        <Globe className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                        <span className="underline truncate">{c.website}</span>
                      </a>
                    )}

                    {c.discordTag && (
                      <div className="inline-flex items-center space-x-1.5 text-zinc-400">
                        <DiscordIcon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="font-bold text-zinc-300">{c.discordTag}</span>
                      </div>
                    )}

                    {c.tiktok && (
                      <a
                        href={c.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-zinc-400 hover:text-white transition-colors group"
                      >
                        <TikTokIcon className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 group-hover:text-rose-300" />
                        <span className="underline truncate">@larkshinnn</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
