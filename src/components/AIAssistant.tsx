// src/components/AIAssistant.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Mic, Send, X, User, Volume2, VolumeX } from 'lucide-react';

interface Message {
    type: 'user' | 'bot';
    content: string;
}

interface AIAssistantProps {
  currentUser: any;
  weatherData: any;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ currentUser, weatherData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isVoiceOn, setIsVoiceOn] = useState(true);

    const [messages, setMessages] = useState<Message[]>([
        { type: 'bot', content: "Hello! I'm your smart farming assistant. How can I help you today?" },
    ]);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // This effect ensures that toggling the sound off stops any current speech.
    useEffect(() => {
        if (!isVoiceOn) {
            window.speechSynthesis.cancel();
        }
    }, [isVoiceOn]);

    const speakText = (text: string) => {
        if (!isVoiceOn || !('speechSynthesis' in window)) return;
        
        window.speechSynthesis.cancel();

        const plainText = text.replace(/<[^>]*>?/gm, '');
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.lang = 'en-IN';
        window.speechSynthesis.speak(utterance);
    };
    
    const handleSendMessage = async () => {
        if (!message.trim() || !currentUser) return;

        const userMessageContent = message;
        setMessages(prev => [...prev, { type: 'user', content: userMessageContent }, { type: 'bot', content: '' }]);
        setMessage('');

        const weatherContext = weatherData 
            ? `- Current Weather: ${weatherData.weather[0].description}, Temp: ${weatherData.main.temp}°C, Humidity: ${weatherData.main.humidity}%`
            : '- Current weather data is not available.';

        const userContext = `
            - Location: ${currentUser?.location || 'Not specified'}
            - Primary Crop: ${currentUser?.farmerProfile?.cropGrown?.[0] || 'Not specified'}
            - Soil Type: ${currentUser?.farmerProfile?.soilType || 'Not specified'}
            ${weatherContext}
        `;

        try {
            const res = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3',
                    prompt: `You are an expert Indian farming assistant. A farmer has a question. Provide a **short and concise** answer (ideally under 50 words). Use simple HTML for formatting if needed (<b>, <ul>, <li>). ALWAYS consider the farmer's specific context (location, crop, weather) before answering.
                    
                    **Farmer's Context:**
                    ${userContext}
                    
                    **Farmer's Question:** "${userMessageContent}"`,
                    stream: true,
                }),
            });

            if (!res.body) throw new Error("The response body is empty.");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            
            let accumulatedResponse = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    const parsed = JSON.parse(line);
                    accumulatedResponse += parsed.response || "";
                    
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { type: 'bot', content: accumulatedResponse };
                        return newMessages;
                    });
                }
            }
            speakText(accumulatedResponse);

        } catch (error) {
            console.error("Streaming error:", error);
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content = '⚠️ I could not connect to the AI model.';
                return updated;
            });
        }
    };

    const initRecognition = (): SpeechRecognition | null => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return null;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        return recognition;
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if (!recognitionRef.current) recognitionRef.current = initRecognition();
            if (!recognitionRef.current) return;
            const recognition = recognitionRef.current;
            recognition.start();
            setIsListening(true);
            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let transcript = Array.from(event.results).map(result => result[0].transcript).join('');
                setMessage(transcript);
                if (event.results[0].isFinal) handleSendMessage();
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
        }
    };

    return (
        <>
            <div className={`fixed bottom-24 right-4 w-[calc(100vw-2rem)] sm:w-96 h-[60vh] max-h-[500px] rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-between shadow-sm flex-shrink-0 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white"><Bot className="w-6 h-6" /></div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">Farm Assistant</h3>
                            <p className="text-xs text-green-600 dark:text-green-400 font-semibold">Online</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setIsVoiceOn(!isVoiceOn)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            {isVoiceOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 dark:bg-gray-900/50">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2.5 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.type === 'bot' && <div className="w-8 h-8 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center text-white"><Bot size={18}/></div>}
                            <div className={`max-w-[80%] rounded-2xl text-sm leading-relaxed p-3 ${msg.type === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                            </div>
                            {msg.type === 'user' && <div className="w-8 h-8 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white"><User size={18}/></div>}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2 rounded-b-2xl">
                    <button onClick={toggleVoiceInput} className={`p-2.5 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        <Mic className="w-5 h-5" />
                    </button>
                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask me anything..." className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                    <button onClick={handleSendMessage} className="p-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:bg-gray-300" disabled={!message.trim()}>
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center justify-center z-50 transition-all duration-300 ease-in-out hover:scale-110 ${isOpen && 'scale-0 opacity-0'}`}>
                <Bot className="w-8 h-8 text-white" />
            </button>
        </>
    );
};

export default AIAssistant;