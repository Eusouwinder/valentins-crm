'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageBubble, type MessageBubbleData } from './MessageBubble';
import { MessageThreadSkeleton } from './skeletons/MessageThreadSkeleton';

// =============================================================================
// TYPES
// =============================================================================

interface MessageThreadProps {
  messages: MessageBubbleData[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

interface MessageGroup {
  date: Date;
  messages: MessageBubbleData[];
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDateSeparator(date: Date): string {
  if (isToday(date)) {
    return 'Hoje';
  }
  if (isYesterday(date)) {
    return 'Ontem';
  }
  return format(date, "d 'de' MMMM", { locale: ptBR });
}

function groupMessagesByDate(messages: MessageBubbleData[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let currentGroup: MessageGroup | null = null;

  for (const message of messages) {
    const messageDate = new Date(message.createdAt);

    if (!currentGroup || !isSameDay(currentGroup.date, messageDate)) {
      currentGroup = {
        date: messageDate,
        messages: [],
      };
      groups.push(currentGroup);
    }

    currentGroup.messages.push(message);
  }

  return groups;
}

// =============================================================================
// DATE SEPARATOR
// =============================================================================

function DateSeparator({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="px-3 py-1 rounded-full bg-[var(--color-muted)] text-xs text-[var(--color-text-muted)]">
        {formatDateSeparator(date)}
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MessageThread({
  messages,
  isLoading = false,
  isFetchingMore = false,
  hasMore = false,
  onLoadMore,
  className,
}: MessageThreadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Group messages by date
  const messageGroups = useMemo(() => groupMessagesByDate(messages), [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (isNewMessage && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Infinite scroll handler
  const handleScroll = () => {
    if (!containerRef.current || !hasMore || isFetchingMore || !onLoadMore) return;

    const { scrollTop } = containerRef.current;

    // Load more when scrolled near top
    if (scrollTop < 100) {
      onLoadMore();
    }
  };

  if (isLoading) {
    return <MessageThreadSkeleton className={className} />;
  }

  if (messages.length === 0) {
    return (
      <div className={cn('flex-1 flex items-center justify-center', className)}>
        <div className="text-center p-8">
          <p className="text-sm text-[var(--color-text-muted)]">
            Nenhuma mensagem ainda
          </p>
          <p className="text-xs text-[var(--color-text-subtle)] mt-1">
            Envie uma mensagem para iniciar a conversa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn(
        'flex-1 overflow-y-auto px-4 py-2',
        'scroll-smooth',
        className
      )}
    >
      {/* Load more indicator */}
      {isFetchingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--color-text-muted)]" />
        </div>
      )}

      {/* Load more button */}
      {hasMore && !isFetchingMore && onLoadMore && (
        <div className="flex justify-center py-2">
          <button
            onClick={onLoadMore}
            className="text-xs text-[var(--color-info)] hover:underline"
          >
            Carregar mensagens anteriores
          </button>
        </div>
      )}

      {/* Message groups */}
      {messageGroups.map((group, groupIndex) => (
        <div key={group.date.toISOString()}>
          <DateSeparator date={group.date} />

          <div className="space-y-2">
            {group.messages.map((message, messageIndex) => {
              // Show sender for first message or when sender changes
              const prevMessage = messageIndex > 0 ? group.messages[messageIndex - 1] : null;
              const showSender =
                message.direction === 'inbound' &&
                (!prevMessage ||
                  prevMessage.direction !== message.direction ||
                  prevMessage.senderName !== message.senderName);

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showSender={showSender}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Bottom anchor for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
}
