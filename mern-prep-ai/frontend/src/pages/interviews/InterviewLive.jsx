import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import api from "../../lib/api.js";
import { toast } from "sonner";
import {
  Send, StopCircle, Bot, User, Loader2,
  Mic, MicOff, Volume2, VolumeX,
} from "lucide-react";

// ─── Web Speech API hooks ─────────────────────────────────────────────────────

function useSpeechRecognition(onResult) {
  const ref = useRef(null);
  const [listening, setListening] = useState(false);
  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const recognition = new SR();
    // continuous=true keeps the mic listening through natural pauses
    // (breathing, thinking mid-sentence) instead of stopping after a
    // few seconds of silence, which is what continuous=false does.
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      // Concatenate every result the engine has produced so far this
      // session (continuous mode fires onresult repeatedly, not once).
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      transcript = transcript.trim();
      if (transcript) onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      // "no-speech" fires on brief silence even in continuous mode on
      // some browsers; don't treat it as a hard stop from the UI's
      // perspective, just let onend handle the listening flag.
      if (e.error !== "no-speech") setListening(false);
    };
    ref.current = recognition;
    recognition.start();
    setListening(true);
  }, [supported, onResult]);

  const stop = useCallback(() => { ref.current?.stop(); setListening(false); }, []);
  return { listening, start, stop, supported };
}

function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [supported]);

  const cancel = useCallback(() => { window.speechSynthesis?.cancel(); setSpeaking(false); }, []);
  return { speaking, speak, cancel, supported };
}

// ─── Voice waveform ───────────────────────────────────────────────────────────
function VoiceWave({ active }) {
  return (
    <div className="flex items-center gap-[3px] h-5">
      {[1,2,3,4,5].map(i => (
        <div key={i}
          className={`w-[3px] rounded-full bg-primary origin-bottom transition-all ${active ? "voice-bar" : "h-1 opacity-20"}`}
          style={active ? { height: `${8 + Math.abs(Math.sin(i)) * 12}px` } : undefined}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function InterviewLive({ params }) {
  const id = params.id;
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [answer, setAnswer] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const scrollRef = useRef(null);
  const lastAiRef = useRef("");
  const reportRequestedRef = useRef(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["interview", id],
    queryFn: () => api.get(`/interviews/${id}`).then(r => r.data),
    refetchInterval: (q) => {
      const s = q.state.data?.session;
      if (!s || s.status === "completed") return false;
      const last = s.messages[s.messages.length - 1];
      return last?.role === "user" ? 2000 : false;
    },
  });

  const { speaking, speak, cancel: cancelSpeech, supported: synthOk } = useSpeechSynthesis();
  const { listening, start: startMic, stop: stopMic, supported: recogOk } =
    useSpeechRecognition((text) => setAnswer(text));

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [data?.session?.messages?.length]);

  const endMutation = useMutation({
    mutationFn: () => api.post(`/interviews/${id}/end`),
    onSuccess: () => {
      cancelSpeech();
      qc.invalidateQueries({ queryKey: ["interviews"] });
      setLocation(`/interviews/${id}/report`);
    },
    onError: () => {
      toast.error("Failed to generate report");
      reportRequestedRef.current = false; // allow retry
    },
  });

  // When the last answer flips status to "completed", generate the real
  // report via /end BEFORE redirecting. Redirecting immediately on
  // status === "completed" (the old behavior) skipped /end entirely,
  // which is why the report page used to show blank scores/strengths.
  useEffect(() => {
    const session = data?.session;
    if (!session || session.status !== "completed" || reportRequestedRef.current) return;

    reportRequestedRef.current = true;
    cancelSpeech();

    if (session.report?.overallScore != null) {
      // Report already exists (e.g. ended manually before) — just go.
      setLocation(`/interviews/${id}/report`);
    } else {
      endMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.session?.status]);

  // Auto-speak new AI messages
  useEffect(() => {
    if (!data?.session || !autoSpeak || !synthOk) return;
    const msgs = data.session.messages;
    const last = msgs[msgs.length - 1];
    if (last?.role === "ai" && last.content !== lastAiRef.current) {
      lastAiRef.current = last.content;
      speak(last.content);
    }
  }, [data?.session?.messages, autoSpeak, speak, synthOk]);

  // Voice answers now wait for explicit submission instead of auto-submitting,
  // so you can review/correct misheard words before sending. See the
  // "Voice UI" block below for the Edit/Send controls.

  const submitMutation = useMutation({
    mutationFn: (ans) => api.post(`/interviews/${id}/answer`, { answer: ans }),
    onSuccess: () => { setAnswer(""); refetch(); },
    onError: () => toast.error("Failed to submit answer"),
  });

  const doSubmit = (text) => {
    const val = (text ?? answer).trim();
    if (!val) return;
    cancelSpeech();
    submitMutation.mutate(val);
  };

  const handleEnd = () => {
    if (reportRequestedRef.current) return;
    if (window.confirm("End this interview? A full AI report will be generated.")) {
      reportRequestedRef.current = true;
      cancelSpeech();
      endMutation.mutate();
    }
  };

  if (isLoading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  const session = data?.session;
  if (!session) return null;

  // While the final report is being generated, show a clear loading state
  // instead of a blank/empty live screen.
  if (session.status === "completed" && endMutation.isPending) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-white/40 font-mono">Generating your report…</p>
      </div>
    );
  }

  const waitingForAi =
    session.messages.length > 0 &&
    session.messages[session.messages.length - 1].role === "user";

  return (
    <div style={{ height: "calc(100vh - 80px)" }} className="flex flex-col max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg">{session.role} Interview</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 animate-pulse">
              LIVE
            </span>
          </div>
          <p className="text-xs text-white/30 font-mono mt-0.5">
            {session.difficulty} · {session.topic} · Q {session.questionCount}/{session.maxQuestions}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice toggle */}
          {recogOk && (
            <button onClick={() => { if (listening) stopMic(); setVoiceMode(v => !v); }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border rounded-sm transition-all ${
                voiceMode
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-white/4 border-white/8 text-white/40 hover:text-white/70"
              }`}>
              {voiceMode ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
              {voiceMode ? "Voice On" : "Text Mode"}
            </button>
          )}

          {/* TTS toggle */}
          {synthOk && (
            <button onClick={() => { setAutoSpeak(v => !v); cancelSpeech(); }}
              className={`p-1.5 border rounded-sm transition-all ${
                autoSpeak ? "border-white/10 text-white/50" : "border-white/5 text-white/20"
              }`}>
              {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
          )}

          <button onClick={handleEnd} disabled={endMutation.isPending}
            className="flex items-center gap-1.5 px-3 h-8 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-sm transition-colors disabled:opacity-50">
            <StopCircle className="h-3.5 w-3.5" /> End
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-5 space-y-4">
        {session.messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === "ai"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-white/6 text-white/50 border border-white/8"
            }`}>
              {msg.role === "ai" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </div>

            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-3 text-sm leading-relaxed ${
                msg.role === "ai"
                  ? "bg-white/[0.03] border border-white/6 text-white/85"
                  : "bg-white/5 border border-white/8 text-white/75"
              }`}>
                {msg.content}
              </div>

              {msg.role === "user" && msg.feedback && (
                <div className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Evaluation</span>
                    <span className={`text-xs font-mono font-bold ${
                      msg.score >= 7 ? "text-green-400" : msg.score >= 5 ? "text-yellow-400" : "text-red-400"
                    }`}>{msg.score}/10</span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{msg.feedback}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {waitingForAi && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="px-4 py-3 bg-white/[0.03] border border-white/6 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs text-white/30 font-mono">thinking…</span>
            </div>
          </div>
        )}

        {speaking && (
          <div className="flex items-center gap-2 px-1">
            <Volume2 className="h-3 w-3 text-primary/50" />
            <VoiceWave active={true} />
            <span className="text-[10px] font-mono text-white/20">speaking</span>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="pt-4 border-t border-white/8">
        {voiceMode ? (
          /* ── Voice UI ── */
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative">
              {listening && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
              <button
                onClick={listening ? stopMic : startMic}
                disabled={waitingForAi || submitMutation.isPending}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${
                  listening
                    ? "bg-primary border-primary shadow-[0_0_40px_rgba(239,68,68,0.35)] scale-110"
                    : "bg-white/4 border-white/10 hover:border-primary/40 hover:bg-white/8"
                } disabled:opacity-40`}
              >
                {listening ? <VoiceWave active={true} /> : <Mic className="h-6 w-6 text-white/50" />}
              </button>
            </div>

            <p className="text-xs text-white/25 font-mono">
              {listening ? "Listening… speak your answer" : answer ? "Review your answer below, then send" : "Tap to speak"}
            </p>

            {answer && (
              <div className="w-full flex flex-col gap-2">
                {/* Editable so misheard words from speech recognition can be corrected before sending */}
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  rows={3}
                  className="w-full resize-none bg-white/[0.03] border border-white/6 px-4 py-3 text-sm text-white/75"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setAnswer("")}
                    disabled={submitMutation.isPending}
                    className="flex-1 h-9 border border-white/10 text-white/50 hover:text-white text-xs font-semibold rounded-sm transition-colors disabled:opacity-40"
                  >
                    Clear &amp; retry
                  </button>
                  <button
                    onClick={() => doSubmit()}
                    disabled={waitingForAi || submitMutation.isPending || !answer.trim()}
                    className="flex-1 h-9 bg-primary hover:bg-red-600 text-white text-xs font-semibold rounded-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    {submitMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Send Answer
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Text UI ── */
          <div className="relative">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSubmit(); } }}
              placeholder={waitingForAi ? "Waiting for interviewer…" : "Type your answer… (Enter to send, Shift+Enter for new line)"}
              disabled={waitingForAi || submitMutation.isPending}
              rows={3}
              className="resize-none pr-12 text-sm"
              style={{ paddingRight: "3rem" }}
            />
            <button
              onClick={() => doSubmit()}
              disabled={waitingForAi || submitMutation.isPending || !answer.trim()}
              className="absolute bottom-3 right-3 w-7 h-7 bg-primary hover:bg-red-600 text-white rounded-sm flex items-center justify-center disabled:opacity-40 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}