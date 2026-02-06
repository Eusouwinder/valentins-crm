'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMessagingConversations } from '@/lib/query/hooks/useMessagingConversationsQuery';
import { useMessagingMessages } from '@/lib/query/hooks/useMessagingMessagesQuery';
import type { ConversationItemData } from '../components/ConversationItem';
import type { MessageBubbleData } from '../components/MessageBubble';
import type { MessageContent, ConversationFilters, ConversationView, MessagingMessage } from '@/lib/messaging/types';

// =============================================================================
// TYPES
// =============================================================================

interface UseMessagingControllerOptions {
  initialFilters?: Partial<ConversationFilters>;
}

interface UseMessagingControllerReturn {
  // Conversations
  conversations: ConversationItemData[];
  conversationsLoading: boolean;
  selectedConversationId: string | null;
  selectConversation: (id: string | null) => void;
  selectedConversation: ConversationItemData | null;

  // Messages
  messages: MessageBubbleData[];
  messagesLoading: boolean;
  hasMoreMessages: boolean;
  isFetchingMoreMessages: boolean;
  loadMoreMessages: () => void;

  // Actions
  sendMessage: (content: MessageContent) => Promise<void>;
  markAsRead: () => Promise<void>;

  // Window state
  windowExpired: boolean;
  windowExpiresAt: string | undefined;

  // Filters
  filters: ConversationFilters;
  updateFilters: (filters: Partial<ConversationFilters>) => void;
}

// =============================================================================
// TRANSFORM FUNCTIONS
// =============================================================================

function transformToConversationItem(conv: ConversationView): ConversationItemData {
  return {
    id: conv.id,
    externalContactId: conv.externalContactId,
    externalContactName: conv.externalContactName,
    externalContactAvatar: conv.externalContactAvatar,
    channelType: conv.channelType,
    channelName: conv.channelName,
    status: conv.status,
    unreadCount: conv.unreadCount,
    lastMessageAt: conv.lastMessageAt,
    lastMessagePreview: conv.lastMessagePreview,
    lastMessageDirection: conv.lastMessageDirection,
    windowExpiresAt: conv.windowExpiresAt,
    assignedUserName: conv.assignedUserName,
  };
}

function transformToMessageBubble(msg: MessagingMessage): MessageBubbleData {
  return {
    id: msg.id,
    direction: msg.direction,
    contentType: msg.contentType,
    content: msg.content,
    status: msg.status,
    createdAt: msg.createdAt,
    senderName: msg.senderName,
    senderProfileUrl: msg.senderProfileUrl,
    errorMessage: msg.errorMessage,
  };
}

// =============================================================================
// HOOK
// =============================================================================

export function useMessagingController(
  options: UseMessagingControllerOptions = {}
): UseMessagingControllerReturn {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [filters, setFilters] = useState<ConversationFilters>({
    status: 'all',
    sortBy: 'lastMessageAt',
    sortOrder: 'desc',
    ...options.initialFilters,
  });

  // Fetch conversations
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
  } = useMessagingConversations(filters);

  // Transform conversations - data is ConversationView[] directly
  const conversations = useMemo(() => {
    if (!conversationsData) return [];
    return conversationsData.map(transformToConversationItem);
  }, [conversationsData]);

  // Get selected conversation
  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.find((c) => c.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  // Fetch messages for selected conversation - data is MessagingMessage[] directly
  const {
    data: messagesData,
    isLoading: messagesLoading,
  } = useMessagingMessages(selectedConversationId || undefined, { pageIndex, pageSize: 50 });

  // Transform messages
  const messages = useMemo(() => {
    if (!messagesData) return [];
    // Sort by date (oldest first for display)
    return messagesData
      .map(transformToMessageBubble)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messagesData]);

  // Window state
  const windowExpiresAt = selectedConversation?.windowExpiresAt;
  const windowExpired = windowExpiresAt
    ? new Date(windowExpiresAt) < new Date()
    : false;

  // Actions
  const selectConversation = useCallback((id: string | null) => {
    setSelectedConversationId(id);
    setPageIndex(0); // Reset pagination when changing conversation
  }, []);

  const sendMessage = useCallback(async (content: MessageContent) => {
    if (!selectedConversationId) return;

    try {
      const response = await fetch('/api/messaging/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      // The message will appear via realtime subscription
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [selectedConversationId]);

  const markAsRead = useCallback(async () => {
    if (!selectedConversationId) return;

    try {
      await fetch(`/api/messaging/conversations/${selectedConversationId}/read`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [selectedConversationId]);

  // For now, simple pagination - load more by incrementing page
  const loadMoreMessages = useCallback(() => {
    setPageIndex((prev) => prev + 1);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<ConversationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    // Conversations
    conversations,
    conversationsLoading,
    selectedConversationId,
    selectConversation,
    selectedConversation,

    // Messages
    messages,
    messagesLoading: messagesLoading && !!selectedConversationId,
    hasMoreMessages: (messagesData?.length || 0) >= 50, // Has more if we got a full page
    isFetchingMoreMessages: false, // Not using infinite query for now
    loadMoreMessages,

    // Actions
    sendMessage,
    markAsRead,

    // Window state
    windowExpired,
    windowExpiresAt,

    // Filters
    filters,
    updateFilters,
  };
}
