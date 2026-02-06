'use client';

import React, { memo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Play,
  Mic,
  MapPin,
  User,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  MessageContent,
  MessageStatus,
  MessageDirection,
  TextContent,
  ImageContent,
  VideoContent,
  AudioContent,
  DocumentContent,
  LocationContent,
} from '@/lib/messaging/types';

// =============================================================================
// TYPES
// =============================================================================

export interface MessageBubbleData {
  id: string;
  direction: MessageDirection;
  contentType: string;
  content: MessageContent;
  status: MessageStatus;
  createdAt: string;
  senderName?: string;
  senderProfileUrl?: string;
  errorMessage?: string;
}

interface MessageBubbleProps {
  message: MessageBubbleData;
  showSender?: boolean;
}

// =============================================================================
// STATUS ICON
// =============================================================================

function StatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case 'pending':
      return <Clock className="w-3.5 h-3.5 text-[var(--msg-status-pending)]" />;
    case 'sent':
      return <Check className="w-3.5 h-3.5 text-[var(--msg-status-sent)]" />;
    case 'delivered':
      return <CheckCheck className="w-3.5 h-3.5 text-[var(--msg-status-delivered)]" />;
    case 'read':
      return <CheckCheck className="w-3.5 h-3.5 text-[var(--msg-status-read)]" />;
    case 'failed':
      return <AlertCircle className="w-3.5 h-3.5 text-[var(--msg-status-failed)]" />;
    default:
      return null;
  }
}

// =============================================================================
// CONTENT RENDERERS
// =============================================================================

function TextMessageContent({ content }: { content: TextContent }) {
  return (
    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      {content.text}
    </p>
  );
}

function ImageMessageContent({ content, isOutbound }: { content: ImageContent; isOutbound: boolean }) {
  return (
    <div className="space-y-1">
      <div className="relative rounded-lg overflow-hidden max-w-[280px]">
        <img
          src={content.mediaUrl}
          alt={content.caption || 'Imagem'}
          className="w-full h-auto max-h-[300px] object-cover"
          loading="lazy"
        />
      </div>
      {content.caption && (
        <p className="text-sm whitespace-pre-wrap break-words">{content.caption}</p>
      )}
    </div>
  );
}

function VideoMessageContent({ content }: { content: VideoContent }) {
  return (
    <div className="space-y-1">
      <div className="relative rounded-lg overflow-hidden max-w-[280px] bg-black/10">
        <video
          src={content.mediaUrl}
          controls
          className="w-full h-auto max-h-[300px]"
          preload="metadata"
        />
      </div>
      {content.caption && (
        <p className="text-sm whitespace-pre-wrap break-words">{content.caption}</p>
      )}
    </div>
  );
}

function AudioMessageContent({ content }: { content: AudioContent }) {
  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <div className="w-10 h-10 rounded-full bg-[var(--color-muted)] flex items-center justify-center shrink-0">
        <Mic className="w-5 h-5 text-[var(--color-text-muted)]" />
      </div>
      <audio
        src={content.mediaUrl}
        controls
        className="flex-1 h-8"
        preload="metadata"
      />
    </div>
  );
}

function DocumentMessageContent({ content }: { content: DocumentContent }) {
  return (
    <a
      href={content.mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-lg bg-[var(--color-muted)]/50 hover:bg-[var(--color-muted)] transition-colors min-w-[200px]"
    >
      <div className="w-10 h-10 rounded-lg bg-[var(--color-info-bg)] flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-[var(--color-info)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{content.fileName}</p>
        {content.fileSize && (
          <p className="text-xs text-[var(--color-text-muted)]">
            {formatFileSize(content.fileSize)}
          </p>
        )}
      </div>
      <Download className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
    </a>
  );
}

function LocationMessageContent({ content }: { content: LocationContent }) {
  const mapsUrl = `https://www.google.com/maps?q=${content.latitude},${content.longitude}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-lg bg-[var(--color-muted)]/50 hover:bg-[var(--color-muted)] transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-[var(--color-error-bg)] flex items-center justify-center shrink-0">
        <MapPin className="w-5 h-5 text-[var(--color-error)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{content.name || 'Localização'}</p>
        {content.address && (
          <p className="text-xs text-[var(--color-text-muted)] truncate">
            {content.address}
          </p>
        )}
      </div>
    </a>
  );
}

function UnsupportedContent({ type }: { type: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-muted)]/50 text-sm text-[var(--color-text-muted)]">
      <AlertCircle className="w-4 h-4" />
      <span>Tipo de mensagem não suportado: {type}</span>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderContent(content: MessageContent, isOutbound: boolean) {
  switch (content.type) {
    case 'text':
      return <TextMessageContent content={content} />;
    case 'image':
      return <ImageMessageContent content={content} isOutbound={isOutbound} />;
    case 'video':
      return <VideoMessageContent content={content} />;
    case 'audio':
      return <AudioMessageContent content={content} />;
    case 'document':
      return <DocumentMessageContent content={content} />;
    case 'location':
      return <LocationMessageContent content={content} />;
    case 'sticker':
      return (
        <img
          src={(content as { mediaUrl: string }).mediaUrl}
          alt="Sticker"
          className="w-32 h-32 object-contain"
        />
      );
    default:
      return <UnsupportedContent type={content.type} />;
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  showSender = false,
}) => {
  const { direction, content, status, createdAt, senderName, errorMessage } = message;
  const isOutbound = direction === 'outbound';

  const time = format(new Date(createdAt), 'HH:mm', { locale: ptBR });

  return (
    <div
      className={cn(
        'flex gap-2 max-w-[80%]',
        isOutbound ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {/* Sender avatar (for inbound only) */}
      {!isOutbound && showSender && (
        <div className="shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
            <User className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'relative rounded-2xl px-3 py-2',
          isOutbound
            ? 'bg-[var(--bubble-outbound-bg)] text-[var(--bubble-outbound-text)]'
            : 'bg-[var(--bubble-inbound-bg)] border border-[var(--bubble-inbound-border)] text-[var(--color-text-primary)]',
          // Rounded corners
          isOutbound ? 'rounded-br-md' : 'rounded-bl-md'
        )}
      >
        {/* Sender name (for inbound group messages) */}
        {!isOutbound && showSender && senderName && (
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
            {senderName}
          </p>
        )}

        {/* Content */}
        {renderContent(content, isOutbound)}

        {/* Error message */}
        {status === 'failed' && errorMessage && (
          <p className="text-xs text-[var(--msg-status-failed)] mt-1">
            {errorMessage}
          </p>
        )}

        {/* Time and status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isOutbound ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isOutbound ? 'text-white/70' : 'text-[var(--color-text-muted)]'
            )}
          >
            {time}
          </span>
          {isOutbound && <StatusIcon status={status} />}
        </div>
      </div>
    </div>
  );
};

export const MessageBubble = memo(MessageBubbleComponent);
