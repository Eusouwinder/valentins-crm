'use client';

import React, { useEffect } from 'react';
import { MessageSquare, User, Phone, Mail, Building2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMessagingController } from './hooks/useMessagingController';
import {
  ConversationList,
  MessageThread,
  MessageInput,
} from './components';

// =============================================================================
// CONTACT PANEL
// =============================================================================

interface ContactPanelProps {
  conversation: {
    externalContactId: string;
    externalContactName?: string;
    externalContactAvatar?: string;
    channelType: string;
    channelName: string;
  } | null;
  className?: string;
}

function ContactPanel({ conversation, className }: ContactPanelProps) {
  if (!conversation) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-full bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-4">
            <User className="w-6 h-6 text-[var(--color-text-muted)]" />
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            Selecione uma conversa para ver os detalhes
          </p>
        </div>
      </div>
    );
  }

  const displayName = conversation.externalContactName || conversation.externalContactId;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          {conversation.externalContactAvatar ? (
            <img
              src={conversation.externalContactAvatar}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
              <User className="w-6 h-6 text-[var(--color-text-muted)]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {displayName}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] capitalize">
              {conversation.channelType}
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Contact Info */}
        <div>
          <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Informações
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-[var(--color-text-muted)]" />
              <span className="text-[var(--color-text-secondary)]">
                {conversation.externalContactId}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-[var(--color-text-muted)]" />
              <span className="text-[var(--color-text-secondary)]">
                {conversation.channelName}
              </span>
            </div>
          </div>
        </div>

        {/* Actions placeholder */}
        <div>
          <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Ações Rápidas
          </h4>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg hover:bg-[var(--color-muted)] transition-colors">
              <User className="w-4 h-4 text-[var(--color-text-muted)]" />
              <span className="text-[var(--color-text-secondary)]">Ver contato</span>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg hover:bg-[var(--color-muted)] transition-colors">
              <Building2 className="w-4 h-4 text-[var(--color-text-muted)]" />
              <span className="text-[var(--color-text-secondary)]">Vincular a deal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// EMPTY THREAD STATE
// =============================================================================

function EmptyThreadState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-16 h-16 rounded-full bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-[var(--color-text-muted)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">
          Selecione uma conversa
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          Escolha uma conversa da lista para ver as mensagens
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// CONVERSATION HEADER
// =============================================================================

interface ConversationHeaderProps {
  conversation: {
    externalContactName?: string;
    externalContactId: string;
    externalContactAvatar?: string;
    channelType: string;
  };
}

function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const displayName = conversation.externalContactName || conversation.externalContactId;

  return (
    <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
      {conversation.externalContactAvatar ? (
        <img
          src={conversation.externalContactAvatar}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
          <User className="w-5 h-5 text-[var(--color-text-muted)]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {displayName}
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] capitalize">
          {conversation.channelType}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export function MessagingPage() {
  const {
    // Conversations
    conversations,
    conversationsLoading,
    selectedConversationId,
    selectConversation,
    selectedConversation,

    // Messages
    messages,
    messagesLoading,
    hasMoreMessages,
    isFetchingMoreMessages,
    loadMoreMessages,

    // Actions
    sendMessage,
    markAsRead,

    // Window state
    windowExpired,
    windowExpiresAt,
  } = useMessagingController();

  // Mark as read when conversation changes
  useEffect(() => {
    if (selectedConversationId && selectedConversation?.unreadCount) {
      markAsRead();
    }
  }, [selectedConversationId, selectedConversation?.unreadCount, markAsRead]);

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Conversation List - Left Panel */}
      <div className="w-80 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <ConversationList
          conversations={conversations}
          isLoading={conversationsLoading}
          activeConversationId={selectedConversationId || undefined}
          onSelectConversation={selectConversation}
        />
      </div>

      {/* Message Thread - Center Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg)]">
        {selectedConversation ? (
          <>
            <ConversationHeader conversation={selectedConversation} />
            <MessageThread
              messages={messages}
              isLoading={messagesLoading}
              hasMore={hasMoreMessages}
              isFetchingMore={isFetchingMoreMessages}
              onLoadMore={loadMoreMessages}
              className="flex-1"
            />
            <MessageInput
              onSend={sendMessage}
              windowExpired={windowExpired}
              windowExpiresAt={windowExpiresAt}
            />
          </>
        ) : (
          <EmptyThreadState />
        )}
      </div>

      {/* Contact Panel - Right Panel */}
      <div className="w-72 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] hidden xl:block">
        <ContactPanel conversation={selectedConversation} />
      </div>
    </div>
  );
}
