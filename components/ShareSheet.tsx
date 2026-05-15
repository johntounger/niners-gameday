'use client';

import { useEffect, useState } from 'react';
import { Game, Guest, TailgateItem } from '@/lib/types';
import { buildShareText } from '@/lib/format';

interface Props {
  game: Game;
  guests: Guest[];
  items: TailgateItem[];
  onClose: () => void;
}

export default function ShareSheet({ game, guests, items, onClose }: Props) {
  const text = buildShareText({ game, guests, items });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  async function copy() {
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 800);
    } catch (e) {
      console.error('Clipboard write failed', e);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-[420px] rounded-t-[20px] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="display text-[22px] tracking-[0.04em] m-0 mb-1">SEND DETAILS TO GUESTS</h3>
        <div className="text-[13px] text-[var(--ink-2)] mb-3.5">
          Tap &quot;Copy&quot; then paste into Messages, WhatsApp, or text.
        </div>
        <pre
          className="bg-[#F0F0F4] rounded-[10px] p-3.5 text-[13px] leading-[1.5] mb-3.5 whitespace-pre-wrap m-0"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Monaco, monospace' }}
        >
          {text}
        </pre>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-[10px] border-none text-[14px] font-bold cursor-pointer bg-[#F0F0F4] text-[var(--ink)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={copy}
            className="flex-1 py-3 rounded-[10px] border-none text-[14px] font-bold cursor-pointer bg-red text-white"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
