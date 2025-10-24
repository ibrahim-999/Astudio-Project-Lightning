'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, API_URL } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'  // At the top


interface Message {
    role: 'user' | 'ai'
    content: string
    intent?: any
    action?: string
}

export default function UnifiedAIPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            content: "👋 Hi! I'm your AI assistant. I can help you with:\n\n• 💰 **Finance** - Add expenses, view budgets\n• 📊 **Projects** - Create projects, manage tasks\n• 👥 **HR** - Conduct interviews, review candidates\n\nJust tell me what you need - type or speak!"
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [voiceEnabled, setVoiceEnabled] = useState(false)
    const [session, setSession] = useState<Session | null>(null)  // In the component // Add session state
    const messagesEndRef = useRef<null | HTMLDivElement>(null)
    const recognitionRef = useRef<any>(null)
    const [organizationId, setOrganizationId] = useState('')
    const router = useRouter()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        const initData = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)

            if (!session) {
                router.push('/login')
            } else {
                // Fetch organization ID
                try {
                    const orgRes = await fetch(`${API_URL}/api/user/organization?user_id=${session.user.id}`)
                    const orgData = await orgRes.json()
                    if (orgData.success && orgData.organization_id) {
                        setOrganizationId(orgData.organization_id)
                    }
                } catch (error) {
                    console.error('Error fetching org:', error)
                }
            }
        }
        initData()
    }, [])

    // Text-to-Speech function
    const speak = (text: string) => {
        if (!voiceEnabled) return

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0

        window.speechSynthesis.speak(utterance)
    }

    // Toggle voice listening
    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition not supported in this browser. Try Chrome or Edge.')
            return
        }

        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            recognitionRef.current.start()
            setIsListening(true)
        }
    }

    const sendMessage = async () => {
        if (!input.trim() || loading) return

        if (!session) { // Check session
            const errorMessage = {
                role: 'ai' as const,
                content: '❌ Please login first'
            }
            setMessages([...messages, errorMessage])
            router.push('/login')
            return
        }

        const userMessage = input.trim()
        setInput('')
        setLoading(true)

        // Add user message
        const newMessages: Message[] = [
            ...messages,
            { role: 'user', content: userMessage }
        ]
        setMessages(newMessages)

        try {
            const response = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}` // Add JWT
                },
                body: JSON.stringify({
                    message: userMessage,
                    organization_id: organizationId,  //  LINE
                    conversation_history: messages.slice(-5).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            })

            const data = await response.json()

            if (data.success) {
                const aiMessage = {
                    role: 'ai' as const,
                    content: data.message,
                    intent: data.intent,
                    action: data.action_taken
                }

                setMessages([...newMessages, aiMessage])

                // Speak the response
                speak(data.message)
            } else {
                const errorMessage = {
                    role: 'ai' as const,
                    content: '❌ Sorry, I had trouble with that. Can you try rephrasing?'
                }
                setMessages([...newMessages, errorMessage])
            }
        } catch (error) {
            console.error('Error:', error)
            const errorMessage = {
                role: 'ai' as const,
                content: '❌ Connection error. Please try again.'
            }
            setMessages([...newMessages, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px 32px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>
                            🤖 Project Lightning AI
                        </h1>
                        <p style={{ opacity: 0.9, fontSize: '14px' }}>
                            Your AI-Native Assistant {voiceEnabled && '🎤 Voice Active'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* Voice Toggle */}
                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            style={{
                                padding: '10px 20px',
                                background: voiceEnabled
                                    ? 'rgba(34, 197, 94, 0.3)'
                                    : 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: voiceEnabled ? '2px solid #22c55e' : '2px solid transparent',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🔊 Voice {voiceEnabled ? 'ON' : 'OFF'}
                        </button>
                        <button
                            onClick={() => router.push('/modules')}
                            style={{
                                padding: '10px 20px',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            📊 Modules
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '32px',
                maxWidth: '900px',
                width: '100%',
                margin: '0 auto'
            }}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                            marginBottom: '20px'
                        }}
                    >
                        <div style={{
                            maxWidth: '70%',
                            padding: '16px 20px',
                            borderRadius: '16px',
                            background: msg.role === 'ai'
                                ? 'white'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: msg.role === 'ai' ? '#1e293b' : 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            <div style={{
                                fontSize: '11px',
                                marginBottom: '8px',
                                opacity: 0.7,
                                fontWeight: 600,
                                textTransform: 'uppercase'
                            }}>
                                {msg.role === 'ai' ? '🤖 AI Assistant' : '👤 You'}
                            </div>
                            <div style={{ fontSize: '15px', lineHeight: '1.6' }}>
                                {msg.content}
                            </div>
                            {msg.intent && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px',
                                    background: 'rgba(0,0,0,0.05)',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}>
                                    <strong>Detected:</strong> {msg.intent.module} → {msg.intent.action}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
                        <div style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            background: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ fontSize: '15px' }}>
                                <span className="typing-indicator">●●●</span> AI is thinking...
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                background: 'white',
                borderTop: '1px solid #e5e7eb',
                padding: '24px 32px',
                boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {/* Listening Indicator */}
                    {isListening && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                            borderRadius: '12px',
                            border: '2px solid #22c55e',
                            textAlign: 'center',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎤</div>
                            <div style={{ fontWeight: 600, color: '#15803d' }}>
                                Listening... Speak now!
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                        {/* Voice Button */}
                        <button
                            onClick={toggleListening}
                            disabled={loading}
                            style={{
                                padding: '16px',
                                background: isListening
                                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                    : '#f1f5f9',
                                color: isListening ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '24px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                minWidth: '56px'
                            }}
                            title={isListening ? 'Stop listening' : 'Start voice input'}
                        >
                            {isListening ? '🔴' : '🎤'}
                        </button>

                        {/* Text Input */}
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type or click 🎤 to speak..."
                            disabled={loading || isListening}
                            style={{
                                flex: 1,
                                padding: '16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontFamily: 'inherit'
                            }}
                        />

                        {/* Send Button */}
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim() || isListening}
                            style={{
                                padding: '16px 32px',
                                background: loading || !input.trim() || isListening
                                    ? '#e5e7eb'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: loading || !input.trim() || isListening ? '#9ca3af' : 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: loading || !input.trim() || isListening ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Sending...' : 'Send ➤'}
                        </button>
                    </div>

                    {/* Quick Examples */}
                    <div style={{
                        marginTop: '16px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ fontSize: '13px', color: '#64748b', marginRight: '8px' }}>
                            Try saying:
                        </div>
                        {[
                            'Add expense lunch 25 dollars',
                            'Create project for mobile app',
                            'Show my expenses'
                        ].map((example, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(example)}
                                style={{
                                    padding: '6px 12px',
                                    background: '#f1f5f9',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                }}
                            >
                                "{example}"
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .typing-indicator {
                    animation: blink 1.4s infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.02); opacity: 0.9; }
                }
            `}</style>
        </div>
    )
}