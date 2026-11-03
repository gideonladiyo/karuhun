import React from 'react';
import {
  MAIN_DISCORD_LINK,
  OFFICIAL_YOUTUBE_LINK,
  OFFICIAL_TIKTOK_LINK,
  CONTRIBUTORS_LIST,
  ContributorItem
} from '@/data/static/contactData';
import larkshinPp from '@/assets/contributors/larkshin_pp.webp';
import karuhunAdminPp from '@/assets/contributors/karuhun_admin_pp.png';
import {
  Mail,
  Heart,
  Globe,
  ExternalLink
} from 'lucide-react';
import { PlatformIcon } from '@/components/ui/platform-icon';
import { SafeImage } from '@/components/ui/safe-image';

const HUAXU_PP = 'https://huaxu.app/_nuxt/normalv2.small.BNupcPRj.webp';

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
            <PlatformIcon platform="youtube" className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors" />
            <span>@karuhun_union67</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </a>

          <a
            href={OFFICIAL_TIKTOK_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#09090b] hover:bg-white text-zinc-300 hover:text-black border border-[#27272a] text-xs font-tech font-bold transition-all shadow-sm group"
          >
            <PlatformIcon platform="tiktok" className="w-4 h-4 text-rose-400 group-hover:text-black transition-colors" />
            <span>@karuhunguild.official</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </a>

          <a
            href={MAIN_DISCORD_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#09090b] hover:bg-white text-zinc-300 hover:text-black border border-[#27272a] text-xs font-tech font-bold transition-all shadow-sm group"
          >
            <PlatformIcon platform="discord" className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
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
                <SafeImage
                  src={getAvatarUrl(c.avatarKey)}
                  alt={c.name}
                  hideOnError
                  className="w-full h-full object-cover rounded-xl"
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
                        <PlatformIcon platform="discord" className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
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
                        <PlatformIcon platform="tiktok" className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 group-hover:text-rose-300" />
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
