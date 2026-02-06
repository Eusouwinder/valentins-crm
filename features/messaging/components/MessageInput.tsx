'use client';

import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile, X, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageContent, TextContent } from '@/lib/messaging/types';

// =============================================================================
// TYPES
// =============================================================================

interface MessageInputProps {
  onSend: (content: MessageContent) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  windowExpired?: boolean;
  windowExpiresAt?: string;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Digite uma mensagem...',
  windowExpired = false,
  windowExpiresAt,
  className,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate remaining window time
  const windowTimeRemaining = windowExpiresAt
    ? Math.max(0, Math.floor((new Date(windowExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))
    : null;

  // Auto-resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  // Handle send
  const handleSend = useCallback(async () => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending || disabled || windowExpired) return;

    const content: TextContent = {
      type: 'text',
      text: trimmedText,
    };

    setIsSending(true);

    try {
      await onSend(content);
      setText('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }, [text, isSending, disabled, windowExpired, onSend]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && !isSending && !disabled && !windowExpired;

  return (
    <div className={cn('border-t border-[var(--color-border)]', className)}>
      {/* Window expiry warning */}
      {windowExpired && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-error-bg)] text-[var(--color-error-text)]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-sm">
            Janela de resposta expirada. Use um template para reabrir a conversa.
          </span>
        </div>
      )}

      {windowTimeRemaining !== null && windowTimeRemaining > 0 && windowTimeRemaining <= 4 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="text-sm">
            Janela de resposta expira em {windowTimeRemaining}h
          </span>
        </div>
      )}

      {/* Input area */}
      <div className="p-3">
        <div
          className={cn(
            'flex items-end gap-2 p-2 rounded-xl',
            'bg-[var(--color-muted)] border border-transparent',
            'focus-within:border-[var(--color-border)] focus-within:bg-[var(--color-surface)]',
            'transition-colors',
            (disabled || windowExpired) && 'opacity-50'
          )}
        >
          {/* Attachment button (placeholder for future) */}
          <button
            type="button"
            disabled={disabled || windowExpired}
            className={cn(
              'p-2 rounded-lg transition-colors shrink-0',
              'hover:bg-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed',
              'text-[var(--color-text-muted)]'
            )}
            title="Anexar arquivo (em breve)"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={windowExpired ? 'Janela expirada' : placeholder}
            disabled={disabled || windowExpired}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent',
              'text-sm text-[var(--color-text-primary)]',
              'placeholder:text-[var(--color-text-muted)]',
              'focus:outline-none',
              'disabled:cursor-not-allowed',
              'max-h-[150px]'
            )}
          />

          {/* Emoji button (placeholder for future) */}
          <button
            type="button"
            disabled={disabled || windowExpired}
            className={cn(
              'p-2 rounded-lg transition-colors shrink-0',
              'hover:bg-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed',
              'text-[var(--color-text-muted)]'
            )}
            title="Emojis (em breve)"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'p-2 rounded-lg transition-colors shrink-0',
              canSend
                ? 'bg-[var(--bubble-outbound-bg)] text-white hover:opacity-90'
                : 'bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed'
            )}
            title="Enviar (Enter)"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Help text */}
        <p className="text-xs text-[var(--color-text-subtle)] mt-1.5 px-2">
          Pressione <kbd className="px-1 py-0.5 rounded bg-[var(--color-muted)] text-[var(--color-text-muted)]">Enter</kbd> para enviar, <kbd className="px-1 py-0.5 rounded bg-[var(--color-muted)] text-[var(--color-text-muted)]">Shift+Enter</kbd> para nova linha
        </p>
      </div>
    </div>
  );
}
