'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage } from '@/types';
import { generateId } from '@/utils/helpers';
import styles from './page.module.css';

const quickActions = [
  'How do I register to vote?',
  'What is EVM?',
  'Explain NOTA',
  'Election timeline steps',
  'What are my voting rights?',
  'How is PM elected?',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Namaste! I'm **Election Buddy**, your AI guide to understanding Indian elections!\n\nI can help you with:\n- 🗳️ How to vote and register\n- 📅 Election process and timeline\n- 📋 Your rights as a voter\n- 🏛️ How government is formed\n- 📊 Election facts and statistics\n\nWhat would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.filter(m => m.id !== 'welcome').map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        }),
      });
      const data = await response.json();
      const botMsg: ChatMessage = { id: generateId(), role: 'assistant', content: data.response || 'I apologize, I had trouble processing that. Please try again!', timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = { id: generateId(), role: 'assistant', content: '⚠️ I\'m having trouble connecting. Please try again in a moment.', timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      // Restore focus to input after response
      inputRef.current?.focus();
    }
  }, [isLoading, messages]);

  const handleSubmit = useCallback((e: React.FormEvent) => { e.preventDefault(); sendMessage(input); }, [input, sendMessage]);

  const renderContent = useCallback((content: string) => {
    return content.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <span key={i} dangerouslySetInnerHTML={{ __html: boldLine }} />;
    }).reduce((acc: React.ReactNode[], el, i) => {
      if (i > 0) acc.push(<br key={`br-${i}`} />);
      acc.push(el);
      return acc;
    }, []);
  }, []);

  const messageCount = useMemo(() => messages.length, [messages]);

  return (
    <div className="page-content">
      <div className={styles.chatContainer} role="region" aria-label="Election Buddy Chat">
        <div className={styles.chatHeader}>
          <div className={styles.chatTitle} id="chat-title">🤖 Election Buddy</div>
          <div className={styles.chatSubtitle} id="chat-subtitle">AI-powered by Gemini • Non-partisan • Educational</div>
        </div>

        <div
          className={styles.messages}
          role="log"
          aria-live="polite"
          aria-label={`Chat messages — ${messageCount} messages`}
          aria-describedby="chat-subtitle"
          aria-busy={isLoading}
        >
          {messages.map(msg => (
            <div key={msg.id} className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAssistant}`}>
              <div
                className={`${styles.messageAvatar} ${msg.role === 'user' ? styles.messageAvatarUser : styles.messageAvatarBot}`}
                aria-hidden="true"
              >
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div
                className={`${styles.messageBubble} ${msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleBot}`}
                role={msg.role === 'assistant' ? 'status' : undefined}
              >
                {renderContent(msg.content)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.messageAssistant}`}>
              <div className={`${styles.messageAvatar} ${styles.messageAvatarBot}`} aria-hidden="true">🤖</div>
              <div className={`${styles.messageBubble} ${styles.messageBubbleBot}`} role="status" aria-label="Election Buddy is typing">
                <div className={styles.typingIndicator} aria-hidden="true">
                  <div className={styles.typingDot} /><div className={styles.typingDot} /><div className={styles.typingDot} />
                </div>
                <span className="sr-only">Election Buddy is typing a response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.quickActions} role="group" aria-label="Quick action suggestions">
          {quickActions.map(action => (
            <button key={action} className={styles.quickAction} onClick={() => sendMessage(action)} disabled={isLoading} aria-label={`Ask: ${action}`}>
              {action}
            </button>
          ))}
        </div>

        <form className={styles.inputArea} onSubmit={handleSubmit} role="search" aria-label="Send a message to Election Buddy">
          <input
            ref={inputRef}
            className={styles.chatInput}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about elections, voting, or your rights..."
            aria-label="Chat message input"
            aria-describedby="chat-input-hint"
            id="chat-input"
            disabled={isLoading}
            maxLength={2000}
            autoComplete="off"
          />
          <span id="chat-input-hint" className="sr-only">Maximum 2000 characters. Press Enter to send.</span>
          <button type="submit" className={styles.sendBtn} disabled={isLoading || !input.trim()} id="chat-send-btn" aria-label={isLoading ? 'Sending message...' : 'Send message'}>
            {isLoading ? '⏳' : '📨'} Send
          </button>
        </form>
      </div>
    </div>
  );
}
