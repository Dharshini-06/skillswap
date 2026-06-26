import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, MessageCircle } from 'lucide-react';
import './AIChatWidget.css';

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi  I’m SkillSwap AI. How can I help you today?", sender: 'ai' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message) return; // Removed isLoading check to allow retry if needed, but best to keep basic validation

        const currentMessage = message;
        setMessage('');
        setIsLoading(true);

        // Optimistically add user message
        setMessages(prev => [...prev, { id: Date.now(), text: currentMessage, sender: 'user' }]);

        try {
            const userId = localStorage.getItem("userId") || "guest_123";

            const res = await fetch('https://skillswap-ekvn.onrender.com/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentMessage, userId })
            });

            const data = await res.json();

            if (data.reply) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: data.reply,
                    sender: 'ai'
                }]);
            } else {
                // Professional fallback for unexpected empty replies
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: "Let’s continue from where we left off",
                    sender: 'ai'
                }]);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Let me explain that step in another way.",
                sender: 'ai'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="ai-chat-widget">
            {/* Chat Window */}
            <div className={`ai-chat-window ${isOpen ? 'open' : ''}`}>
                <div className="ai-chat-header">
                    <div className="ai-header-title">
                        <Bot size={20} style={{ marginRight: '8px' }} /> SkillSwap AI
                    </div>
                    <button className="ai-close-btn" onClick={toggleChat}><X size={20} /></button>
                </div>

                <div className="ai-chat-body">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`ai-message ${msg.sender}`}>
                            <div className="ai-message-content">
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="ai-message ai">
                            <div className="ai-message-content typing-indicator">
                                SkillSwap AI is typing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="ai-chat-footer" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Type your question..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className="ai-send-btn" disabled={isLoading}>
                        {isLoading ? '...' : <Send size={18} />}
                    </button>
                </form>
            </div>

            {/* Floating Toggle Button */}
            <button className={`ai-chat-toggle ${isOpen ? 'hidden' : ''}`} onClick={toggleChat}>
                <Sparkles size={20} className="ai-toggle-icon" />
                <span className="ai-toggle-text">Ask SkillSwap AI</span>
            </button>
        </div>
    );
};

export default AIChatWidget;
