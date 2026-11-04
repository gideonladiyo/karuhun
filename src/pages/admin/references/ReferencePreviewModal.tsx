import React from 'react';
import {
  ReferenceItem,
  CATEGORIES_CONFIG,
  detectVideoPlatform,
} from '@/data/static/reffsData';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { MultiPlatformVideoPlayer } from '@/components/reffs/MultiPlatformVideoPlayer';
import { Button } from '@/components/ui/button';
import { Badge, Modal, StatusBadge } from '@/components/admin/AdminPrimitives';

export interface ReferencePreviewModalProps {
  reference: ReferenceItem | null;
  onClose: () => void;
}

export const ReferencePreviewModal: React.FC<ReferencePreviewModalProps> = ({
  reference,
  onClose,
}) => {
  if (!reference) return null;

  const categoryLabel =
    CATEGORIES_CONFIG[reference.category]?.label || reference.category;

  return (
    <Modal
      open={Boolean(reference)}
      onClose={onClose}
      title={reference.title}
      maxWidthClass="max-w-3xl"
      subtitle={
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge tone="neutral">
            {categoryLabel} • {reference.subcategory}
          </Badge>
          {reference.author && <Badge tone="neutral">Author: {reference.author}</Badge>}
          <StatusBadge isPublished={reference.isPublished !== false} />
        </div>
      }
    >
      <div className="space-y-6">
        <div className="w-full flex justify-center">
          <MultiPlatformVideoPlayer
            platform={
              reference.platform ||
              detectVideoPlatform(reference.videoUrl || reference.youtubeUrl || '')
            }
            videoId={reference.videoId}
            videoUrl={reference.videoUrl || reference.youtubeUrl || ''}
            title={reference.title}
            thumbnailUrl={reference.thumbnailUrl}
          />
        </div>

        <div className="space-y-2">
          <h4 className="font-heading font-bold text-sm text-white">
            Panduan Strategi &amp; Rotasi
          </h4>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5">
            <MarkdownRenderer content={reference.description} />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#27272a]">
          <Button type="button" onClick={onClose}>
            Tutup Preview
          </Button>
        </div>
      </div>
    </Modal>
  );
};
