'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import '../../../styles.css'
import { API_URL, supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'  


interface Message {
    speaker: 'ai' | 'candidate'
    message: string
    timestamp?: string
}

export default function InterviewChatPage() {
    const params = useParams()
    const router = useRouter()
    const interviewId = params?.id as string

    const [messages, setMessages] = useState<Message[]>([])
    const [currentResponse, setCurrentResponse] = useState('')
    const [loading, setLoading] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const [questionNumber, setQuestionNumber] = useState(1)
    const [totalQuestions] = useState(8)
    const [analyzing, setAnalyzing] = useState(false)
    const [session, setSession] = useState<Session | null>(null)  
    const [organizationId, setOrganizationId] = useState('')


    const messagesEndRef = useRef<null | HTMLDivElement>(null)

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


    useEffect(() => {
        scrollToBottom()
    }, [messages, loading])

    useEffect(() => {
        if (session) {
            loadInterview()
        }
    }, [interviewId, session])

    const loadInterview = async () => {
        if (!session) return

        try {
            const response = await fetch(`${API_URL}/api/interview/${interviewId}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })
            const data = await response.json()

            if (data.success && data.transcripts) {
                const formattedMessages = data.transcripts.map((t: any) => ({
                    speaker: t.speaker,
                    message: t.message,
                    timestamp: t.timestamp
                }))
                setMessages(formattedMessages)

                if (data.interview.status === 'completed') {
                    setIsComplete(true)
                }
            }
        } catch (error) {
            console.error('Error loading interview:', error)
        }
    }
    const sendResponse = async () => {
        if (!currentResponse.trim() || loading || !session) return

        setLoading(true)

        const candidateMessage: Message = {
            speaker: 'candidate',
            message: currentResponse
        }
        setMessages(prev => [...prev, candidateMessage])
        setCurrentResponse('')

        try {
            const response = await fetch(`${API_URL}/api/interview/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    interview_id: interviewId,
                    candidate_response: currentResponse,
                    organization_id: organizationId
                })
            })

            const data = await response.json()

            if (data.success) {
                const aiMessage: Message = {
                    speaker: 'ai',
                    message: data.ai_message
                }
                setMessages(prev => [...prev, aiMessage])
                setQuestionNumber(data.question_number)

                if (data.is_complete) {
                    setIsComplete(true)
                }
            }
        } catch (error) {
            console.error('Error sending response:', error)
            alert('Error communicating with AI. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const analyzeInterview = async () => {
        if (!session) return

        setAnalyzing(true)

        try {
            const response = await fetch(`${API_URL}/api/interview/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    interview_id: interviewId,
                    organization_id: organizationId
                })
            })

            const data = await response.json()

            if (data.success) {
                router.push(`/hr/interview/${interviewId}/results`)
            }
        } catch (error) {
            console.error('Error analyzing interview:', error)
            alert('Error analyzing interview. Please try again.')
        } finally {
            setAnalyzing(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendResponse()
        }
    }

    return (
        <div className="dashboard">
            {/* Navigation */}
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <div className="navbar-logo">🤖</div>
                        <div className="navbar-text">
                            <h1>AI Interview in Progress</h1>
                            <p>Question {questionNumber} of {totalQuestions}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                            padding: '8px 16px',
                            background: isComplete ? '#dcfce7' : '#dbeafe',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: isComplete ? '#166534' : '#1e40af'
                        }}>
                            {isComplete ? '✅ Complete' : '🟢 Active'}
                        </div>
                        <button onClick={() => router.push('/dashboard')} className="btn-signout">
                            Exit
                        </button>
                    </div>
                </div>
            </nav>

            {/* Chat Container */}
            <div className="container" style={{ maxWidth: '900px' }}>
                {/* Progress Bar */}
                <div style={{
                    marginBottom: '24px',
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color: '#64748b'
                    }}>
                        <span>Interview Progress</span>
                        <span>{Math.round((questionNumber / totalQuestions) * 100)}%</span>
                    </div>
                    <div style={{
                        height: '8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            width: `${(questionNumber / totalQuestions) * 100}%`,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>

                {/* Chat Messages */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    minHeight: '500px',
                    maxHeight: '600px',
                    overflowY: 'auto',
                    marginBottom: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: msg.speaker === 'ai' ? 'flex-start' : 'flex-end',
                                marginBottom: '20px'
                            }}
                        >
                            <div style={{
                                maxWidth: '75%',
                                padding: '16px 20px',
                                borderRadius: '16px',
                                background: msg.speaker === 'ai'
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : '#f1f5f9',
                                color: msg.speaker === 'ai' ? 'white' : '#1e293b',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{
                                    fontSize: '11px',
                                    marginBottom: '6px',
                                    opacity: 0.8,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {msg.speaker === 'ai' ? '🤖 AI Interviewer' : '👤 You'}
                                </div>
                                <div style={{
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.message}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                padding: '16px 20px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white'
                            }}>
                                <div style={{ fontSize: '11px', marginBottom: '6px', opacity: 0.8 }}>
                                    🤖 AI INTERVIEWER
                                </div>
                                <div style={{ fontSize: '15px' }}>
                                    <span className="typing-indicator">●●●</span> Thinking...
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {!isComplete ? (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <textarea
                            value={currentResponse}
                            onChange={(e) => setCurrentResponse(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your response... (Press Enter to send)"
                            disabled={loading}
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: '16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                marginBottom: '16px'
                            }}
                        />
                        <button
                            onClick={sendResponse}
                            disabled={loading || !currentResponse.trim()}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: loading || !currentResponse.trim()
                                    ? '#e5e7eb'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: loading || !currentResponse.trim() ? '#9ca3af' : 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: loading || !currentResponse.trim() ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {loading ? 'Sending...' : 'Send Response ➤'}
                        </button>
                    </div>
                ) : (
                    <div style={{
                        background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
                        borderRadius: '16px',
                        padding: '32px',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                        <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#166534' }}>
                            Interview Complete!
                        </h3>
                        <p style={{ marginBottom: '24px', color: '#166534' }}>
                            Great job! Click below to see your AI-generated analysis and scores.
                        </p>
                        <button
                            onClick={analyzeInterview}
                            disabled={analyzing}
                            style={{
                                padding: '16px 32px',
                                background: analyzing ? '#ccc' : '#166534',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: analyzing ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {analyzing ? 'Analyzing...' : 'View AI Analysis 📊'}
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .typing-indicator {
                    animation: blink 1.4s infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    )
}