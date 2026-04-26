"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, ImageIcon, Search, LayoutDashboard, Send, Sparkles,
  Sun, Moon, Loader2, Trash2, Download, ExternalLink, Globe,
  Zap, Brain, Palette, TrendingUp, ArrowRight, ChevronRight,
  Copy, Check, Volume2, VolumeX, Eye, History, Code2, Hash,
  MessageSquare, RefreshCw, Activity, Mic, FileText, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MarkdownRenderer } from "@/components/markdown-renderer";

// Types
interface ChatMessage { role: "user" | "assistant"; content: string; timestamp: Date; }
interface GeneratedImage { id: string; prompt: string; image: string; size: string; timestamp: Date; }
interface SearchResult { url: string; name: string; snippet: string; host_name: string; rank: number; date: string; favicon: string; }

// Toast hook (simple)
function useToast() {
  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    if (typeof window !== "undefined" && variant === "destructive") {
      console.error(`[Toast] ${title}: ${description}`);
    }
  };
  return { toast };
}

// Theme hook
function useTheme() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => { document.documentElement.classList.toggle("dark", isDark); }, [isDark]);
  return { isDark, toggle: () => setIsDark(!isDark) };
}

// ─── AI Chat ────────────────────────────────────────────────────────
function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim(), timestamp: new Date() };
    setMessages(p => [...p, userMsg]); setInput(""); setIsLoading(true);
    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history, conversationId }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      if (data.conversationId && !conversationId) setConversationId(data.conversationId);
      setMessages(p => [...p, { role: "assistant", content: data.response, timestamp: new Date() }]);
    } catch (e) { toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const speak = async (idx: number, content: string) => {
    if (playingIdx === idx) { audioRef.current?.pause(); audioRef.current = null; setPlayingIdx(null); return; }
    try {
      setPlayingIdx(idx);
      const res = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: content.slice(0, 2000), voice: "tongtong", speed: 1.0 }) });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const audio = new Audio(url); audioRef.current = audio;
      audio.onended = () => { setPlayingIdx(null); audioRef.current = null; };
      await audio.play();
    } catch { setPlayingIdx(null); toast({ title: "TTS Error", variant: "destructive" }); }
  };

  const clear = () => { setMessages([]); setConversationId(null); audioRef.current?.pause(); setPlayingIdx(null); };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
        <div className="flex items-center gap-3">
          <div className="relative"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><Bot className="w-5 h-5 text-white" /></div><div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background animate-pulse" /></div>
          <div><h3 className="font-semibold text-sm">Z.ai Assistant</h3><p className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Online • LLM + TTS + Markdown</p></div>
        </div>
        <div className="flex items-center gap-1">{messages.length > 0 && <Badge variant="secondary" className="text-[10px] mr-2">{messages.length} msgs</Badge>}<Button variant="ghost" size="sm" onClick={clear}><Trash2 className="w-4 h-4" /></Button></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center"><Brain className="w-12 h-12 text-emerald-500" /></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
            </motion.div>
            <div><h3 className="text-xl font-bold">Start a Conversation</h3><p className="text-sm text-muted-foreground mt-1 max-w-md">Ask anything — code, analysis, writing, research. Supports <strong>markdown</strong>, <strong>code highlighting</strong>, and <strong>text-to-speech</strong>.</p></div>
            <div className="grid grid-cols-2 gap-2 mt-2 max-w-lg">
              {["Write a Python quicksort with comments","Explain quantum computing simply","Create a React custom hook","Write a SQL query for top customers","REST vs GraphQL differences","TypeScript generic deep partial"].map(s => (
                <Button key={s} variant="outline" size="sm" className="text-xs h-auto py-2.5 px-3 justify-start hover:bg-emerald-500/10 hover:border-emerald-500/30" onClick={() => setInput(s)}><ChevronRight className="w-3 h-3 mr-1.5 shrink-0 text-emerald-500" />{s}</Button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>{messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-emerald-500/10"><Bot className="w-4 h-4 text-white" /></div>}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
              {msg.role === "assistant" ? <MarkdownRenderer content={msg.content} /> : <div className="whitespace-pre-wrap">{msg.content}</div>}
              <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-border/30">
                <span className="text-[10px] opacity-40">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                {msg.role === "assistant" && (<>
                  <button onClick={() => { navigator.clipboard.writeText(msg.content); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2000); }} className="p-1 rounded hover:bg-muted">{copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-40" />}</button>
                  <button onClick={() => speak(idx, msg.content)} className="p-1 rounded hover:bg-muted">{playingIdx === idx ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 opacity-40" />}</button>
                </>)}
              </div>
            </div>
          </motion.div>
        ))}</AnimatePresence>
        {isLoading && <div className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-white" /></div><div className="bg-card border border-border rounded-2xl px-4 py-3"><div className="flex gap-1.5 items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0ms]" /><span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:150ms]" /><span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:300ms]" /><span className="text-xs text-muted-foreground ml-2">Thinking...</span></div></div></div>}
        <div ref={endRef} />
      </div>
      <div className="p-4 border-t border-border"><div className="flex gap-2"><Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Type your message... (Enter to send)" disabled={isLoading} className="flex-1" /><Button onClick={send} disabled={!input.trim() || isLoading} size="icon" className="bg-gradient-to-r from-emerald-500 to-teal-600 shrink-0"><Send className="w-4 h-4" /></Button></div></div>
    </div>
  );
}

// ─── Image Studio ───────────────────────────────────────────────────
function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [analyzeMode, setAnalyzeMode] = useState(false);
  const [analyzeQ, setAnalyzeQ] = useState("Describe this image in detail");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    if (!prompt.trim() || isGenerating) return; setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: prompt.trim(), size }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      const img: GeneratedImage = { id: data.id || Date.now().toString(), prompt: prompt.trim(), image: data.image, size: data.size, timestamp: new Date() };
      setImages(p => [img, ...p]); setSelectedImage(img);
    } catch (e) { toast({ title: "Failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" }); }
    finally { setIsGenerating(false); }
  };

  const analyze = async () => {
    if (!selectedImage || isAnalyzing) return; setIsAnalyzing(true); setAnalysis(null);
    try {
      const res = await fetch("/api/vlm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: `data:image/png;base64,${selectedImage.image}`, question: analyzeQ }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error); setAnalysis(data.analysis);
    } catch { toast({ title: "Analysis Failed", variant: "destructive" }); }
    finally { setIsAnalyzing(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-violet-500/5 to-purple-500/5">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20"><ImageIcon className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-sm">Image Studio</h3><p className="text-xs text-muted-foreground">AI Gen + Vision Analysis</p></div></div>
        <div className="flex items-center gap-2"><Badge variant="secondary" className="text-[10px]">{images.length} images</Badge><Button variant={analyzeMode ? "default" : "outline"} size="sm" className="text-xs gap-1" onClick={() => setAnalyzeMode(!analyzeMode)}><Eye className="w-3 h-3" />Vision AI</Button></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card><CardContent className="p-4 space-y-3">
          <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the image you want to create..." className="min-h-[80px] resize-none" />
          <div className="flex gap-2 items-center">
            <Select value={size} onValueChange={setSize}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent>{["1024x1024","768x1344","1344x768","1152x864","1440x720"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            <Button onClick={generate} disabled={!prompt.trim() || isGenerating} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600">{isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate</>}</Button>
          </div>
          <div className="flex flex-wrap gap-1.5">{["Futuristic cityscape at sunset, cyberpunk","Cute robot reading in a cozy library","Majestic dragon over snow mountains","Abstract fluid art, vibrant neon colors","Astronaut floating in space","Enchanted forest with glowing mushrooms","Steampunk clockwork city with flying ships","Underwater crystal palace bioluminescent"].map(s => <Button key={s} variant="outline" size="sm" className="text-[10px] h-7" onClick={() => setPrompt(s)}>{s.slice(0, 30)}...</Button>)}</div>
        </CardContent></Card>
        {analyzeMode && selectedImage && (
          <Card className="border-violet-500/30 bg-violet-500/5"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4 text-violet-500" />Vision AI</CardTitle></CardHeader><CardContent className="space-y-3">
            <Input value={analyzeQ} onChange={e => setAnalyzeQ(e.target.value)} placeholder="Ask about the image..." />
            <Button onClick={analyze} disabled={isAnalyzing} className="w-full bg-gradient-to-r from-violet-500 to-purple-600">{isAnalyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Eye className="w-4 h-4 mr-2" />Analyze</>}</Button>
            {analysis && <div className="bg-card rounded-lg p-3 border text-sm"><MarkdownRenderer content={analysis} /></div>}
          </CardContent></Card>
        )}
        {selectedImage && <Card className="overflow-hidden shadow-lg"><CardContent className="p-0"><div className="relative group"><img src={`data:image/png;base64,${selectedImage.image}`} alt={selectedImage.prompt} className="w-full" /><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"><Button variant="secondary" size="sm" onClick={() => { const a = document.createElement("a"); a.href = `data:image/png;base64,${selectedImage.image}`; a.download = `zai-${selectedImage.id}.png`; a.click(); }}><Download className="w-4 h-4 mr-1" />Download</Button><Button variant="secondary" size="sm" onClick={() => { setAnalyzeMode(true); setAnalyzeQ("Describe this image in detail"); }}><Eye className="w-4 h-4 mr-1" />Analyze</Button></div></div><div className="p-3"><p className="text-xs text-muted-foreground">{selectedImage.prompt}</p><div className="flex gap-2 mt-2"><Badge variant="outline" className="text-[10px]">{selectedImage.size}</Badge><Badge variant="outline" className="text-[10px]">{selectedImage.timestamp.toLocaleTimeString()}</Badge></div></div></CardContent></Card>}
        {images.length > 1 && <div><h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Palette className="w-4 h-4" />Gallery</h4><div className="grid grid-cols-3 gap-2">{images.map(img => <motion.div key={img.id} whileHover={{ scale: 1.05 }} className={`cursor-pointer rounded-lg overflow-hidden border-2 ${selectedImage?.id === img.id ? "border-violet-500" : "border-border"}`} onClick={() => setSelectedImage(img)}><img src={`data:image/png;base64,${img.image}`} alt={img.prompt} className="w-full aspect-square object-cover" /></motion.div>)}</div></div>}
        {images.length === 0 && !isGenerating && <div className="flex flex-col items-center justify-center py-16"><Palette className="w-10 h-10 text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground">No images yet. Describe your vision above!</p></div>}
      </div>
    </div>
  );
}

// ─── Web Search ─────────────────────────────────────────────────────
function WebSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  const search = async () => {
    if (!query.trim() || isSearching) return; setIsSearching(true); setHasSearched(true); setAiSummary(null);
    try { const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&num=10`); const data = await res.json(); if (!res.ok) throw new Error(data.error); setResults(data.results); }
    catch (e) { toast({ title: "Search Failed", description: e instanceof Error ? e.message : "Error", variant: "destructive" }); }
    finally { setIsSearching(false); }
  };

  const summarize = async () => {
    if (!results.length || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const ctx = results.slice(0, 5).map((r, i) => `${i + 1}. ${r.name}\n${r.snippet}`).join("\n\n");
      const summaryPrompt = "Summarize these search results for query: " + query + "\n\n" + ctx;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: summaryPrompt }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiSummary(data.response);
    } catch {
      toast({ title: "Summary Failed", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20"><Search className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-sm">Web Search</h3><p className="text-xs text-muted-foreground">Real-time + AI Summary</p></div></div>
        {hasSearched && <Badge variant="secondary" className="text-[10px]">{results.length} results</Badge>}
      </div>
      <div className="p-4 border-b border-border"><div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") search(); }} placeholder="Search the web..." className="pl-10" /></div><Button onClick={search} disabled={!query.trim() || isSearching} className="bg-gradient-to-r from-amber-500 to-orange-600">{isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}</Button></div>
        {results.length > 0 && <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={summarize} disabled={isSummarizing}>{isSummarizing ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />AI Summarizing...</> : <><Brain className="w-3 h-3 mr-1" />AI Summarize Results</>}</Button>}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {aiSummary && <Card className="border-amber-500/30 bg-amber-500/5"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-amber-500" /><span className="text-xs font-semibold">AI Summary</span></div><div className="text-sm"><MarkdownRenderer content={aiSummary} /></div></CardContent></Card>}
        {!hasSearched && <div className="flex flex-col items-center justify-center h-full text-center"><Globe className="w-10 h-10 text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground mb-4">Search anything across the web</p><div className="grid grid-cols-2 gap-2 max-w-md">{["Latest AI news","Next.js 16 features","TypeScript best practices","React 19 updates"].map(s => <Button key={s} variant="outline" size="sm" className="text-xs" onClick={() => setQuery(s)}>{s}</Button>)}</div></div>}
        {isSearching && <div className="flex flex-col items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" /></div>}
        {!isSearching && results.map((r, i) => <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}><Card className="hover:shadow-lg transition-all cursor-pointer group"><CardContent className="p-4"><div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">{r.favicon ? <img src={r.favicon} alt="" className="w-5 h-5" /> : <Globe className="w-4 h-4 text-muted-foreground" />}</div><div className="flex-1 min-w-0"><h4 className="font-medium text-sm truncate group-hover:text-amber-500 transition-colors">{r.name}</h4><p className="text-xs text-muted-foreground mt-0.5">{r.host_name}</p><p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.snippet}</p></div><a href={r.url} target="_blank" rel="noopener noreferrer" className="shrink-0" onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button></a></div></CardContent></Card></motion.div>)}
      </div>
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState<{ conversations: number; messages: number; images: number; searches: number; tts: number; vision: number } | null>(null);
  useEffect(() => { fetch("/api/history").then(r => r.json()).then(d => { if (d.stats) setStats(d.stats); }).catch(() => {}); }, []);

  const caps = [
    { label: "Natural Language Processing", value: 98, color: "bg-emerald-500" },
    { label: "Code Generation & Debug", value: 95, color: "bg-violet-500" },
    { label: "Creative Writing", value: 92, color: "bg-amber-500" },
    { label: "Image Understanding (VLM)", value: 88, color: "bg-rose-500" },
    { label: "Web Research & Search", value: 96, color: "bg-cyan-500" },
    { label: "Text-to-Speech", value: 94, color: "bg-teal-500" },
    { label: "Data Analysis", value: 90, color: "bg-pink-500" },
    { label: "Vision Analysis", value: 87, color: "bg-orange-500" },
  ];
  const statCards = [
    { icon: MessageSquare, label: "Chats", value: stats?.conversations || 0, color: "from-emerald-500 to-teal-600" },
    { icon: Hash, label: "Messages", value: stats?.messages || 0, color: "from-violet-500 to-purple-600" },
    { icon: ImageIcon, label: "Images", value: stats?.images || 0, color: "from-rose-500 to-pink-600" },
    { icon: Search, label: "Searches", value: stats?.searches || 0, color: "from-amber-500 to-orange-600" },
    { icon: Volume2, label: "TTS", value: stats?.tts || 0, color: "from-cyan-500 to-blue-600" },
    { icon: Eye, label: "Vision", value: stats?.vision || 0, color: "from-teal-500 to-emerald-600" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-rose-500/5 to-pink-500/5">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20"><LayoutDashboard className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-sm">Dashboard</h3><p className="text-xs text-muted-foreground">Analytics & Capabilities</p></div></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">{statCards.map(s => <Card key={s.label}><CardContent className="p-4"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2 shadow-md`}><s.icon className="w-5 h-5 text-white" /></div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></CardContent></Card>)}</div>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4 text-rose-500" />AI Capabilities</CardTitle></CardHeader><CardContent className="space-y-3">{caps.map(c => <div key={c.label}><div className="flex justify-between text-xs mb-1"><span>{c.label}</span><span className="text-muted-foreground font-medium">{c.value}%</span></div><div className="h-1.5 bg-muted rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${c.value}%` }} transition={{ duration: 1 }} className={`h-full rounded-full ${c.color}`} /></div></div>)}</CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" />All Features</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-2">{[{ icon: Bot, l: "AI Chat" },{ icon: ImageIcon, l: "Image Gen" },{ icon: Eye, l: "Vision AI" },{ icon: Volume2, l: "TTS" },{ icon: Search, l: "Web Search" },{ icon: Brain, l: "AI Summary" },{ icon: Code2, l: "Code Blocks" },{ icon: History, l: "DB History" },{ icon: Download, l: "Export" },{ icon: Moon, l: "Dark Mode" }].map(f => <div key={f.l} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"><f.icon className="w-4 h-4 text-muted-foreground shrink-0" /><span className="text-xs">{f.l}</span></div>)}</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Code2 className="w-4 h-4 text-cyan-500" />Tech Stack</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-1.5">{["Next.js 16","TypeScript","React 19","Tailwind CSS 4","shadcn/ui","Prisma ORM","Framer Motion","Z.ai SDK","ReactMarkdown","Recharts","SQLite","Lucide Icons"].map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div></CardContent></Card>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState("home");
  const { isDark, toggle } = useTheme();

  const tabs = [
    { id: "home", label: "Home", icon: Sparkles },
    { id: "chat", label: "Chat", icon: Bot },
    { id: "image", label: "Image", icon: ImageIcon },
    { id: "search", label: "Search", icon: Search },
    { id: "dashboard", label: "Board", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 via-violet-500 to-amber-500 flex items-center justify-center shadow-lg shadow-violet-500/20"><Zap className="w-4 h-4 text-white" /></div>
            <span className="font-bold text-lg tracking-tight">Z.ai<span className="text-muted-foreground font-normal ml-1">PowerHub</span></span>
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 hidden sm:inline-flex">v3.0</Badge>
          </div>
          <div className="flex items-center gap-0.5">
            {tabs.map(t => <Button key={t.id} variant={tab === t.id ? "secondary" : "ghost"} size="sm" onClick={() => setTab(t.id)} className="gap-1.5 text-xs" ><t.icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t.label}</span></Button>)}
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {tab === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto px-4 py-16">
              <div className="text-center mb-20">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.8 }} className="inline-flex mb-6">
                  <div className="relative"><div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500 via-violet-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-violet-500/30"><Zap className="w-14 h-14 text-white" /></div><motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"><Sparkles className="w-4 h-4 text-white" /></motion.div><motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }} className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"><Bot className="w-3.5 h-3.5 text-white" /></motion.div></div>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">AI <span className="bg-gradient-to-r from-emerald-500 via-violet-500 to-amber-500 bg-clip-text text-transparent">PowerHub</span></motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">Next-level AI platform: intelligent chat, stunning image generation, vision analysis, text-to-speech, and real-time web search.</motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-2 mb-8">{["AI Chat","Image Gen","Vision AI","TTS","Web Search","AI Summary","Code Blocks","DB History"].map(t => <Badge key={t} variant="secondary" className="text-xs py-1 px-3">{t}</Badge>)}</motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap justify-center gap-3">
                  <Button size="lg" onClick={() => setTab("chat")} className="bg-gradient-to-r from-emerald-500 to-teal-600 gap-2 shadow-lg shadow-emerald-500/20"><Bot className="w-5 h-5" />Start AI Chat<ArrowRight className="w-4 h-4" /></Button>
                  <Button size="lg" variant="outline" onClick={() => setTab("image")} className="gap-2"><ImageIcon className="w-5 h-5" />Generate Images</Button>
                  <Button size="lg" variant="outline" onClick={() => setTab("search")} className="gap-2"><Search className="w-5 h-5" />Search the Web</Button>
                </motion.div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mb-20">
                {[{ icon: Bot, title: "AI Chat", desc: "Context-aware LLM with markdown, syntax-highlighted code, text-to-speech, and conversation history.", color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20", t: "chat", tags: ["Markdown","Code","TTS","History"] },
                  { icon: ImageIcon, title: "Image Studio", desc: "Generate stunning AI images, analyze with Vision AI, download, and browse your gallery.", color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/20", t: "image", tags: ["7 Sizes","Vision AI","Gallery","Download"] },
                  { icon: Search, title: "Web Search", desc: "Real-time web search with AI-powered summarization of results.", color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20", t: "search", tags: ["Real-time","AI Summary","10+ Results"] }
                ].map((f, i) => (
                  <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }}>
                    <Card className={`group cursor-pointer hover:shadow-2xl ${f.shadow} transition-all h-full`} onClick={() => setTab(f.t)}>
                      <CardContent className="p-6">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}><f.icon className="w-7 h-7 text-white" /></div>
                        <h3 className="text-xl font-semibold mb-2">{f.title}</h3><p className="text-sm text-muted-foreground leading-relaxed mb-3">{f.desc}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">{f.tags.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
                        <div className="flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Try now <ChevronRight className="w-4 h-4" /></div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mb-20">
                <h2 className="text-2xl font-bold text-center mb-8">Power Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[{ icon: Volume2, t: "Text-to-Speech", d: "Hear AI responses read aloud" },{ icon: Eye, t: "Vision Analysis", d: "Analyze images with AI vision" },{ icon: Code2, t: "Code Highlighting", d: "Syntax highlighting + copy" },{ icon: Brain, t: "AI Summarization", d: "Smart search summaries" },{ icon: History, t: "DB Persistence", d: "All data saved to SQLite" },{ icon: Moon, t: "Dark/Light Mode", d: "Beautiful theme toggle" },{ icon: Download, t: "Export Images", d: "Download as PNG files" },{ icon: FileText, t: "Markdown Chat", d: "Full markdown in responses" }].map((f, i) => (
                    <Card key={f.t} className="hover:shadow-md transition-shadow"><CardContent className="p-4"><f.icon className="w-6 h-6 mb-2 text-muted-foreground" /><h4 className="text-sm font-semibold">{f.t}</h4><p className="text-[11px] text-muted-foreground mt-1">{f.d}</p></CardContent></Card>
                  ))}
                </div>
              </motion.div>
              <div className="text-center text-sm text-muted-foreground pb-8"><p className="font-medium">Built with Next.js 16 • TypeScript • Tailwind CSS 4 • Z.ai SDK</p><p className="mt-1 text-xs">Open source on GitHub • Ready for deployment</p></div>
            </motion.div>
          )}
          {tab === "chat" && <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto h-[calc(100vh-3.5rem)]"><AIChat /></motion.div>}
          {tab === "image" && <motion.div key="image" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto h-[calc(100vh-3.5rem)]"><ImageStudio /></motion.div>}
          {tab === "search" && <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto h-[calc(100vh-3.5rem)]"><WebSearch /></motion.div>}
          {tab === "dashboard" && <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto h-[calc(100vh-3.5rem)]"><Dashboard /></motion.div>}
        </AnimatePresence>
      </main>
    </div>
  );
}
