import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import {
  ReferenceItem,
  CATEGORIES_CONFIG,
  detectVideoPlatform,
} from '@/data/static/reffsData';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { MultiPlatformVideoPlayer } from '@/components/reffs/MultiPlatformVideoPlayer';
import { Button } from '@/components/ui/button';
import { PlatformBadge } from '@/components/ui/platform-icon';
import { Badge, Modal, StatusBadge } from '@/components/admin/AdminPrimitives';

export interface ReferencePreviewModalProps {
  reference: ReferenceItem | null;
  onClose: () => void;
}

export const ReferencePreviewModal: React.FC<ReferencePreviewModalProps> = ({
  reference,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [reference?.id]);

  if (!reference) return null;

  const rawUrl = reference.videoUrl || reference.youtubeUrl || '';
  const platform = reference.platform || detectVideoPlatform(rawUrl);
  const isVertical = platform === 'tiktok';
  const platformLabel =
    platform === 'tiktok' ? 'TikTok' : platform === 'bilibili' ? 'Bilibili' : 'YouTube';
  const categoryLabel =
    CATEGORIES_CONFIG[reference.category]?.label || reference.category;

  const handleCopyLink = () => {
    if (!rawUrl) return;
    navigator.clipboard.writeText(rawUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const infoAndStrategyBlock = (
    <div className="space-y-4 min-w-0 flex flex-col">
      {/* Info & External Link Bar */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5 text-xs">
          <div>
            <span className="text-zinc-500">Author: </span>
            <strong className="text-white">
              {reference.author || 'Karuhun Tactical'}
            </strong>
          </div>
          {reference.dateAdded && (
            <div className="text-zinc-500">
              Ditambahkan: <span className="text-zinc-300">{reference.dateAdded}</span>
            </div>
          )}
        </div>

        {rawUrl && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Link</span>
                </>
              )}
            </Button>

            <Button asChild size="sm">
              <a href={rawUrl} target="_blank" rel="noopener noreferrer">
                <span>Buka di {platformLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* Strategy Guide */}
      <div className="space-y-2">
        <h4 className="font-heading font-bold text-sm text-white">
          Panduan Strategi &amp; Rotasi
        </h4>
        <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 sm:p-5">
          <MarkdownRenderer content={reference.description} />
        </div>
      </div>

      {/* Optional Tips */}
      {reference.tips && reference.tips.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-heading font-bold text-sm text-white">
            Tips Utama
          </h4>
          <ol className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 space-y-2 text-xs text-zinc-300 list-decimal list-inside">
            {reference.tips.map((tip, idx) => (
              <li key={idx} className="leading-relaxed">
                {tip}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      open={Boolean(reference)}
      onClose={onClose}
      title={reference.title}
      maxWidthClass={isVertical ? 'max-w-4xl' : 'max-w-3xl'}
      subtitle={
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge tone="neutral">
            {categoryLabel} • {reference.subcategory}
          </Badge>
          <PlatformBadge platform={platform} />
          <StatusBadge isPublished={reference.isPublished !== false} />
        </div>
      }
      footer={
        <div className="flex items-center justify-end">
          <Button type="button" onClick={onClose}>
            Tutup Preview
          </Button>
        </div>
      }
    >
      {isVertical ? (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          <MultiPlatformVideoPlayer
            platform={platform}
            videoId={reference.videoId}
            videoUrl={rawUrl}
            title={reference.title}
            thumbnailUrl={reference.thumbnailUrl}
            compact
          />
          {infoAndStrategyBlock}
        </div>
      ) : (
        <div className="space-y-5">
          <MultiPlatformVideoPlayer
            platform={platform}
            videoId={reference.videoId}
            videoUrl={rawUrl}
            title={reference.title}
            thumbnailUrl={reference.thumbnailUrl}
            compact
          />
          {infoAndStrategyBlock}
        </div>
      )}
    </Modal>
  );
};
