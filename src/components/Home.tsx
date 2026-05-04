import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Volume2, Copy, Share2, Languages, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translateToGujarati, generateGujaratiSpeech, speechToText, type TranslationResult } from '../services/geminiService';
import { db } from '../lib/db';
import { playPcmAudio } from '../lib/audio';
import { cn } from '../lib/utils';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<AudioBufferSourceNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsTranslating(true);
          try {
            const transcription = await speechToText(base64Audio);
            setInputText(transcription);
            // Auto translate after voice input
            const translation = await translateToGujarati(transcription);
            setResult(translation);
            await db.history.add({
              inputText: translation.originalText,
              translatedText: translation.translatedText,
              sourceLanguage: translation.detectedLanguage,
              inputType: 'voice',
              timestamp: Date.now()
            });
          } catch (error) {
            console.error(error);
          } finally {
            setIsTranslating(false);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic permission denied", err);
      alert("Microphone permission is required for voice input.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleTranslate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTranslating) return;

    setIsTranslating(true);
    try {
      const translation = await translateToGujarati(inputText);
      setResult(translation);
      
      // Save to history
      await db.history.add({
        inputText: translation.originalText,
        translatedText: translation.translatedText,
        sourceLanguage: translation.detectedLanguage,
        inputType: isRecording ? 'voice' : 'text',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(error);
      alert("Failed to translate. Please check your connection.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = async () => {
    if (!result?.translatedText || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      const base64Audio = await generateGujaratiSpeech(result.translatedText);
      if (base64Audio) {
        audioRef.current = await playPcmAudio(base64Audio);
        audioRef.current.onended = () => setIsSpeaking(false);
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error(error);
      setIsSpeaking(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.translatedText);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    try {
      await navigator.share({
        title: 'Gujarati Translation',
        text: `${result.originalText} -> ${result.translatedText}`,
      });
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden pb-20">
      {/* Header Area */}
      <div className="px-6 pt-10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[var(--primary)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <span className="text-white text-2xl font-bold leading-none">ગુ</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--primary)]">GujaratiVani</h1>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
              AI Precision • V1.0.4
            </p>
          </div>
        </div>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-12">
        
        {/* Input Card */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Source Text</span>
            <span className="text-[10px] bg-white border border-gray-200 text-[var(--text-secondary)] px-3 py-1 rounded-full font-bold">Auto-Detect</span>
          </div>
          <div className="card relative p-7 focus-within:ring-4 focus-within:ring-[var(--primary)]/10">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="What would you like to say in Gujarati?"
              className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[140px] text-xl font-medium placeholder:text-gray-300 leading-relaxed"
            />
            <div className="flex justify-between items-center mt-6">
              <button 
                type="button"
                onClick={toggleRecording}
                className={cn(
                  "p-4 rounded-full transition-all shadow-sm",
                  isRecording 
                    ? "bg-red-500 text-white animate-pulse ring-8 ring-red-100" 
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                <Mic className="w-6 h-6" />
              </button>
              <button 
                onClick={() => handleTranslate()}
                disabled={!inputText.trim() || isTranslating}
                className="btn-primary rounded-2xl px-10"
              >
                {isTranslating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Translate
              </button>
            </div>
          </div>
        </div>

        {/* Output Area */}
        <AnimatePresence mode="wait">
          {result && !isTranslating && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card bg-[var(--primary-bg)] border-[var(--primary-border)] p-7 space-y-5"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">Gujarati Translation</span>
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="btn-icon p-2 hover:bg-white text-[var(--primary)]"><Copy className="w-4 h-4" /></button>
                  <button onClick={handleShare} className="btn-icon p-2 hover:bg-white text-[var(--primary)]"><Share2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)] font-medium italic opacity-60 leading-relaxed">
                  {result.originalText}
                </p>
                <p className="text-3xl font-black font-display text-[var(--text-accent)] leading-[1.1] tracking-tight">
                  {result.translatedText}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 mt-4 border-t border-[var(--primary-border)]/50">
                <div className="flex gap-3">
                  <button 
                    onClick={handleSpeak}
                    disabled={isSpeaking}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-90",
                      isSpeaking 
                        ? "bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20" 
                        : "bg-white text-[var(--primary)] border border-[var(--primary-border)] hover:bg-gray-50"
                    )}
                  >
                    {isSpeaking ? (
                       <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Volume2 className="w-6 h-6 fill-current" />
                    )}
                  </button>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-black text-[var(--primary)] uppercase tracking-wider">Audio Output</span>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">{isSpeaking ? 'Now Playing' : 'Click to Play'}</span>
                  </div>
                </div>
                
                <button 
                  onClick={copyToClipboard}
                  className="text-[var(--primary)] text-xs font-black uppercase tracking-widest hover:underline underline-offset-4"
                >
                  Copy Text
                </button>
              </div>
            </motion.div>
          )}

          {isTranslating && (
             <div className="flex flex-col items-center justify-center py-12 gap-4">
               <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
               <p className="text-sm text-[var(--text-secondary)] font-medium animate-pulse">Translating for you...</p>
             </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
