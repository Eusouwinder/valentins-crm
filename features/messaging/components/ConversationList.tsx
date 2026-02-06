'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Inbox, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConversationItem, type ConversationItemData } from './ConversationItem';
import { ConversationListSkeleton } from './skeletons/ConversationListSkeleton';
import type { ConversationStatus, ChannelType } from '@/lib/messaging/types';

// =============================================================================
// TYPES
// =============================================================================

interface ConversationListProps {
  conversations: ConversationItemData[];
  isLoading?: boolean;
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation?: () => void;
  className?: string;
}

type FilterStatus = 'all' | ConversationStatus;

// =============================================================================
// FILTER TABS
// =============================================================================

const STATUS_TABS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'open', label: 'Abertas' },
  { value: 'resolved', label: 'Resolvidas' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function ConversationList({
  conversations,
  isLoading = false,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  className,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelType | 'all'>('all');

  // Get unique channels for filter
  const availableChannels = useMemo(() => {
    const channels = new Set<ChannelType>();
    conversations.forEach((c) => channels.add(c.channelType));
    return Array.from(channels);
  }, [conversations]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Status filter
      if (statusFilter !== 'all' && conv.status !== statusFilter) {
        return false;
      }

      // Channel filter
      if (channelFilter !== 'all' && conv.channelType !== channelFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = (conv.externalContactName || '').toLowerCase();
        const id = conv.externalContactId.toLowerCase();
        const preview = (conv.lastMessagePreview || '').toLowerCase();
        return name.includes(query) || id.includes(query) || preview.includes(query);
      }

      return true;
    });
  }, [conversations, statusFilter, channelFilter, searchQuery]);

  // Count unread
  const unreadCount = useMemo(() => {
    return conversations.filter((c) => c.unreadCount > 0 && c.status === 'open').length;
  }, [conversations]);

  if (isLoading) {
    return <ConversationListSkeleton className={className} />;
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Conversas
            </h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full bg-[var(--conversation-unread-dot)] text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
              title="Nova conversa"
            >
              <Plus className="w-5 h-5 text-[var(--color-text-secondary)]" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 text-sm rounded-lg',
              'bg-[var(--color-muted)] border border-transparent',
              'placeholder:text-[var(--color-text-muted)]',
              'focus:outline-none focus:border-[var(--color-border)] focus:bg-[var(--color-surface)]',
              'transition-colors'
            )}
          />
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 mt-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                statusFilter === tab.value
                  ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Channel Filter (if multiple channels) */}
        {availableChannels.length > 1 && (
          <div className="flex gap-1 mt-2 overflow-x-auto">
            <button
              onClick={() => setChannelFilter('all')}
              className={cn(
                'px-2 py-1 text-xs rounded-md transition-colors whitespace-nowrap',
                channelFilter === 'all'
                  ? 'bg-[var(--color-muted)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              Todos
            </button>
            {availableChannels.map((channel) => (
              <button
                key={channel}
                onClick={() => setChannelFilter(channel)}
                className={cn(
                  'px-2 py-1 text-xs rounded-md transition-colors whitespace-nowrap capitalize',
                  channelFilter === channel
                    ? 'bg-[var(--color-muted)] text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                )}
              >
                {channel}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <EmptyState
            hasFilters={searchQuery !== '' || statusFilter !== 'all' || channelFilter !== 'all'}
            onClearFilters={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setChannelFilter('all');
            }}
          />
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={onSelectConversation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--color-muted)] flex items-center justify-center mb-4">
        {hasFilters ? (
          <Filter className="w-6 h-6 text-[var(--color-text-muted)]" />
        ) : (
          <Inbox className="w-6 h-6 text-[var(--color-text-muted)]" />
        )}
      </div>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
        {hasFilters ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">
        {hasFilters
          ? 'Tente ajustar os filtros de busca'
          : 'As conversas aparecerão aqui quando houver mensagens'}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-[var(--color-info)] hover:underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
