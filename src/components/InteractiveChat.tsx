import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  PlusCircle,
  Clock,
  Scissors,
  CheckCircle2,
  Trash2,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage, GeneratedCRMSystem, BusinessFormData } from '../types';
import { refineCRMChatClientSide } from '../services/geminiClient';

interface InteractiveChatProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentCRM: GeneratedCRMSystem | null;
  businessData: BusinessFormData;
  onCRMUpdated: (updatedCRM: GeneratedCRMSystem) => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

const QUICK_PROMPTS = [
  '➕ Agrega un campo de "Alergias y Sensibilidad" a la ficha',
  '📧 Agrega un campo de "Correo Electrónico" a la ficha',
  '🇭🇳 Agrega un campo de "RTN / No. Identidad" para Honduras',
  '✂️ Cambia el recordatorio de WhatsApp a 48h con confirmación',
  '🧹 Simplifica la tabla quitando campos no esenciales',
];

export const InteractiveChat: React.FC<InteractiveChatProps> = ({
  chatHistory,
  setChatHistory,
  currentCRM,
  businessData,
  onCRMUpdated,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (externalPrompt && externalPrompt.trim().length > 0) {
      setInputMessage(externalPrompt);
      if (isMinimized) {
        setIsMinimized(false);
      }
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt, isMinimized, onClearExternalPrompt]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Execute 100% client-side AI refinement without server dependency
      const resData = await refineCRMChatClientSide(textToSend, currentCRM, businessData);

      const assistantMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content:
          resData.replyText ||
          'He procesado tu solicitud. Los cambios han sido reflejados en tu Sistema CRM.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedCRM: resData.updatedCRM || undefined,
      };

      setChatHistory((prev) => [...prev, assistantMsg]);

      if (resData.updatedCRM) {
        onCRMUpdated(resData.updatedCRM);
      }
    } catch (error: any) {
      console.error('Error in client chat:', error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Hubo un inconveniente al procesar la indicación: ${error.message || 'Intenta de nuevo'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800 flex flex-col">
      {/* Chat Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Asistente CRM Master Pro
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.2 rounded-full border border-emerald-800">
                En Vivo
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Pide modificaciones en tiempo real: agregar/quitar campos, plantillas o fórmulas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMinimized ? 'Expandir chat' : 'Minimizar chat'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="p-4 sm:p-5 overflow-y-auto max-h-[380px] min-h-[220px] space-y-4 bg-slate-50/60">
            {chatHistory.length === 0 ? (
              <div className="text-center py-6 px-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  ¿Deseas personalizar tu CRM?
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Escríbeme para agregar campos específicos de tu especialidad, ajustar mensajes de WhatsApp o crear fórmulas personalizadas para Google Sheets.
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {QUICK_PROMPTS.slice(0, 3).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 transition-all text-left shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="markdown-body">
                      <Markdown>{msg.content}</Markdown>
                    </div>

                    {msg.updatedCRM && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>¡Tu Sistema CRM ha sido actualizado con estos cambios!</span>
                      </div>
                    )}

                    <span
                      className={`text-[9px] block mt-1.5 text-right font-mono ${
                        msg.role === 'user' ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 shadow-xs flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>CRM Master Pro está pensando y actualizando tu estructura...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 bg-slate-100/80 border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
              Sugerencias:
            </span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 px-2.5 py-1 rounded-md border border-slate-200 hover:border-emerald-300 font-medium whitespace-nowrap transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              id="input-chat-message"
              ref={inputRef}
              placeholder="Ej. 'Agrega un campo de tipo de piel grasa/seca' o 'Cambia el mensaje de WhatsApp'..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 transition-all"
            />
            <button
              type="submit"
              id="btn-send-chat"
              disabled={!inputMessage.trim() || isLoading}
              className={`p-2.5 rounded-xl font-semibold text-xs flex items-center justify-center transition-all ${
                !inputMessage.trim() || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-700/20 active:scale-95 cursor-pointer'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
