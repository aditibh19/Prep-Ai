import { useState, useEffect, useRef, useCallback } from "react";
import {
  useGetInterview,
  useSubmitInterviewAnswer,
  useEndInterview,
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import {
  Send,
  StopCircle,
  Bot,
  User,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// ─── Web Speech API types ───────────────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

function useSpeechRecognition(onResult: (text: string) => void) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const supported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
      if (transcript) onResult(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [supported, onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, start, stop, supported };
}

function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [supported]);

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, cancel, supported };
}

// ─── Waveform visual ────────────────────────────────────────────────────
function VoiceWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-0.5 rounded-full bg-primary transition-all ${active ? "voice-bar" : "h-1 opacity-30"}`}
          style={active ? { height: `${10 + Math.sin(i * 1.2) * 8}px` } : undefined}
        />
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────
export default function LiveInterviewPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const [, setLocation] = useLocation();
  const [answer, setAnswer] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAiMsgRef = useRef<string>("");

  const { data: session, isLoading, refetch } = useGetInterview(id, {
    query: {
      queryKey: ["interview", id],
      refetchInterval: (query) => {
        const d = query.state.data;
        if (d?.status === "completed") return false;
        if (d?.messages && d.messages.length > 0 && d.messages[d.messages.length - 1].role === "user") {
          return 2000;
        }
        return false;
      },
    },
  });

  const { isSpeaking, speak, cancel: cancelSpeech, supported: synthSupported } = useSpeechSynthesis();

  const { isListening, start: startListening, stop: stopListening, supported: recogSupported } =
    useSpeechRecognition((transcript) => {
      setAnswer(transcript);
    });

  const submitMutation = useSubmitInterviewAnswer({
    mutation: {
      onSuccess: () => {
        setAnswer("");
        refetch();
      },
      onError: () => {
        toast.error("Failed to submit answer");
      },
    },
  });

  const endMutation = useEndInterview({
    mutation: {
      onSuccess: () => {
        cancelSpeech();
        toast.success("Interview completed");
        setLocation(`/interviews/${id}/report`);
      },
    },
  });

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages]);

  // Redirect on completion
  useEffect(() => {
    if (session?.status === "completed") {
      cancelSpeech();
      setLocation(`/interviews/${id}/report`);
    }
  }, [session?.status, id, setLocation, cancelSpeech]);

  // Auto-speak new AI messages
  useEffect(() => {
    if (!session?.messages || !autoSpeak || !synthSupported) return;
    const msgs = session.messages;
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg?.role === "ai" && lastMsg.content !== lastAiMsgRef.current) {
      lastAiMsgRef.current = lastMsg.content;
      speak(lastMsg.content);
    }
  }, [session?.messages, autoSpeak, speak, synthSupported]);

  // Auto-submit after voice capture (with small delay so user sees transcript)
  useEffect(() => {
    if (voiceMode && answer && !isListening) {
      const timer = setTimeout(() => {
        if (answer.trim()) handleSubmit();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [answer, isListening, voiceMode]);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    cancelSpeech();
    submitMutation.mutate({ id, data: { answer } });
  };

  const handleEnd = () => {
    if (confirm("End this interview? A full report will be generated.")) {
      cancelSpeech();
      endMutation.mutate({ id });
    }
  };

  const toggleVoice = () => {
    if (isListening) stopListening();
    else if (voiceMode) startListening();
    setVoiceMode((v) => !v);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const isWaitingForAi =
    session.messages.length > 0 &&
    session.messages[session.messages.length - 1].role === "user";

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white">{session.role} Interview</h1>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono animate-pulse px-1.5 py-0">
                LIVE
              </Badge>
            </div>
            <p className="text-xs text-white/40 font-mono mt-0.5">{session.difficulty} · Q {session.questionCount}/8</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice mode toggle */}
          {recogSupported && (
            <button
              onClick={toggleVoice}
              title={voiceMode ? "Switch to text mode" : "Switch to voice mode"}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-sm border transition-all ${
                voiceMode
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-white/4 border-white/8 text-white/40 hover:text-white/70"
              }`}
            >
              {voiceMode ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
              {voiceMode ? "Voice On" : "Voice Off"}
            </button>
          )}

          {/* TTS toggle */}
          {synthSupported && (
            <button
              onClick={() => { setAutoSpeak((a) => !a); cancelSpeech(); }}
              title={autoSpeak ? "Mute AI voice" : "Unmute AI voice"}
              className={`p-1.5 rounded-sm border transition-all ${
                autoSpeak
                  ? "bg-white/6 border-white/8 text-white/60"
                  : "bg-white/4 border-white/5 text-white/25"
              }`}
            >
              {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
          )}

          <Button
            size="sm"
            variant="destructive"
            onClick={handleEnd}
            disabled={endMutation.isPending}
            className="rounded-sm text-xs h-8"
          >
            <StopCircle className="mr-1.5 h-3.5 w-3.5" />
            End
          </Button>
        </div>
      </div>

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-5 scroll-smooth">
        {session.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-mono ${
                msg.role === "ai"
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "bg-white/6 text-white/60 border border-white/8"
              }`}
            >
              {msg.role === "ai" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </div>

            <div className={`flex flex-col gap-2 max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "ai"
                    ? "bg-white/[0.03] border border-white/6 text-white/90"
                    : "bg-white/6 border border-white/8 text-white/80"
                }`}
              >
                {msg.content}
              </div>

              {msg.role === "user" && msg.feedback && (
                <div className="w-full px-4 py-3 bg-white/[0.02] border border-white/6 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Evaluation</span>
                    <span className={`text-xs font-mono font-bold ${
                      (msg.score ?? 0) >= 7 ? "text-green-400" :
                      (msg.score ?? 0) >= 5 ? "text-yellow-400" :
                      "text-red-400"
                    }`}>
                      {msg.score}/10
                    </span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{msg.feedback}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {isWaitingForAi && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/15 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="px-4 py-3 bg-white/[0.03] border border-white/6 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs text-white/30 font-mono">analyzing...</span>
            </div>
          </div>
        )}

        {isSpeaking && (
          <div className="flex items-center gap-2 px-1">
            <Volume2 className="h-3 w-3 text-primary/60" />
            <VoiceWave active={true} />
            <span className="text-[10px] font-mono text-white/25">speaking</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-border">
        {voiceMode ? (
          /* Voice mode UI */
          <div className="flex flex-col items-center gap-4 py-2">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isWaitingForAi || submitMutation.isPending}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${
                isListening
                  ? "bg-primary border-primary shadow-[0_0_32px_rgba(239,68,68,0.4)] scale-110"
                  : "bg-white/4 border-white/10 hover:bg-white/8 hover:border-primary/40"
              } disabled:opacity-40`}
            >
              {isListening ? (
                <VoiceWave active={true} />
              ) : (
                <Mic className="h-6 w-6 text-white/60" />
              )}
            </button>
            <p className="text-xs text-white/30 font-mono">
              {isListening ? "Listening… speak your answer" : "Tap to speak"}
            </p>
            {answer && (
              <div className="w-full bg-white/[0.03] border border-white/6 px-4 py-3 text-sm text-white/70">
                {answer}
              </div>
            )}
          </div>
        ) : (
          /* Text mode UI */
          <div className="relative">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={isWaitingForAi ? "Waiting for interviewer…" : "Type your answer… (Enter to send, Shift+Enter for newline)"}
              disabled={isWaitingForAi || submitMutation.isPending}
              className="pr-12 min-h-[90px] resize-none bg-white/[0.03] border-white/8 focus-visible:ring-primary/40 focus-visible:border-primary/30 text-sm text-white/80 placeholder:text-white/20 rounded-sm"
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={isWaitingForAi || submitMutation.isPending || !answer.trim()}
              className="absolute bottom-3 right-3 h-7 w-7 bg-primary hover:bg-primary/90 text-white rounded-sm"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
