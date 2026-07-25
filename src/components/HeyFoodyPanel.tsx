import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, Mic, Send, Sparkles, X } from "lucide-react";
import type { HeyFoodyMessage, HeyFoodyPhase } from "../hooks/useHeyFoody";
import type { ConciergeRecommendation } from "../services/concierge";

type HeyFoodyPanelProps = {
  active: boolean;
  phase: HeyFoodyPhase;
  messages: HeyFoodyMessage[];
  recipe: ConciergeRecommendation | null;
  stepIndex: number;
  busy: boolean;
  isListening: boolean;
  speechSupported: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  onNext: () => void;
  onMicToggle: () => void;
};

const phaseLabel: Record<HeyFoodyPhase, string> = {
  inactive: "",
  awaiting_request: "Waiting for your request",
  generating: "Building your recipe",
  guiding: "Step-by-step cooking",
  answering: "Answering your question",
  complete: "Recipe complete",
};

export const HeyFoodyPanel: React.FC<HeyFoodyPanelProps> = ({
  active,
  phase,
  messages,
  recipe,
  stepIndex,
  busy,
  isListening,
  speechSupported,
  onClose,
  onSubmit,
  onNext,
  onMicToggle,
}) => {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, phase]);

  if (!active) {
    return null;
  }

  const showNext =
    recipe && (phase === "guiding" || phase === "answering") && stepIndex < recipe.steps.length;
  const currentStep = recipe?.steps[stepIndex];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-5xl px-3 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:px-4 sm:pb-24">
      <div className="overflow-hidden rounded-[28px] border border-emerald-500/30 bg-[#0b0b0c]/95 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-amber-400">
              <Sparkles size={18} className="text-black" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Hey Foody™</p>
              <p className="text-xs text-emerald-300">{phaseLabel[phase]}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit Hey Foody"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-zinc-300 transition hover:bg-white/15 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[42vh] space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                  message.role === "user"
                    ? "rounded-br-sm bg-emerald-500 font-medium text-black"
                    : "rounded-bl-sm border border-white/10 bg-white/[0.05] text-zinc-200"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 size={15} className="animate-spin text-emerald-400" />
              Hey Foody is thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        {currentStep && showNext && (
          <div className="border-t border-white/10 px-4 py-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Current step {stepIndex + 1}
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-200">{currentStep}</p>
              <button
                type="button"
                onClick={onNext}
                disabled={busy}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next step
                <ArrowRight size={16} />
              </button>
              <p className="mt-2 text-center text-[11px] text-zinc-500">
                Or say &quot;next&quot; when this step is done
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!input.trim() || busy) return;
            onSubmit(input);
            setInput("");
          }}
          className="flex items-center gap-2 border-t border-white/10 px-3 py-3"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              phase === "awaiting_request"
                ? "What would you like to cook?"
                : "Ask a cooking question or type next"
            }
            disabled={busy || isListening}
            className="flex-1 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-500/40"
          />
          {speechSupported && (
            <button
              type="button"
              onClick={onMicToggle}
              disabled={busy}
              aria-label={isListening ? "Stop listening" : "Speak to Hey Foody"}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                isListening
                  ? "bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/40 animate-pulse"
                  : "bg-white/10 text-zinc-300 hover:bg-white/15 hover:text-emerald-300"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Mic size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={busy || isListening || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>

        {isListening && (
          <p className="flex items-center justify-center gap-2 px-4 pb-3 text-xs text-emerald-300">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Listening…
          </p>
        )}
      </div>
    </div>
  );
};
