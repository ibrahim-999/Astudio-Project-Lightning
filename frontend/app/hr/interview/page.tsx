'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../../styles.css'
import { API_URL } from '@/lib/supabase'


export default function InterviewStartPage() {
    const [candidateName, setCandidateName] = useState('')
    const [candidateEmail, setCandidateEmail] = useState('')
    const [position, setPosition] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const startInterview = async () => {
        if (!candidateName || !candidateEmail || !position) {
            setError('Please fill in all fields')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_URL}/api/interview/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidate_name: candidateName,
                    candidate_email: candidateEmail,
                    position: position,
                    organization_id: '00000000-0000-0000-0000-000000000001'
                })
            })

            const data = await response.json()

            if (data.success) {
                router.push(`/hr/interview/${data.interview_id}`)
            } else {
                setError('Failed to start interview')
            }
        } catch (err) {
            setError('Error connecting to AI service')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <div className="navbar-logo">⚡</div>
                        <div className="navbar-text">
                            <h1>Project Lightning</h1>
                            <p>AI Interview Conductor</p>
                        </div>
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="btn-signout">
                        Back to AI Chat
                    </button>
                </div>
            </nav>

            <div className="container">
                <div className="hero">
                    <div className="badge">🤖 AI-Powered Interview</div>
                    <h2>Start New Interview</h2>
                    <p>Our AI will conduct a professional interview and analyze the candidate</p>
                </div>

                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="info-card">
                        <h3 style={{ marginBottom: '24px' }}>Candidate Information</h3>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                Candidate Name
                            </label>
                            <input
                                type="text"
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                                placeholder="John Doe"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '15px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={candidateEmail}
                                onChange={(e) => setCandidateEmail(e.target.value)}
                                placeholder="john@example.com"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '15px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                Position
                            </label>
                            <input
                                type="text"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                placeholder="Senior Frontend Developer"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '15px'
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                padding: '12px',
                                background: '#fee',
                                color: '#c33',
                                borderRadius: '8px',
                                marginBottom: '20px'
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={startInterview}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Starting Interview...' : 'Start AI Interview 🚀'}
                        </button>
                    </div>

                    <div style={{
                        marginTop: '32px',
                        padding: '20px',
                        background: '#f0f9ff',
                        borderRadius: '12px',
                        border: '1px solid #bfdbfe'
                    }}>
                        <h4 style={{ marginBottom: '12px', color: '#1e40af' }}>How it works:</h4>
                        <ul style={{ lineHeight: '1.8', color: '#1e40af', paddingLeft: '20px' }}>
                            <li>AI conducts 8 professional interview questions</li>
                            <li>Candidate responds via text chat</li>
                            <li>AI analyzes responses in real-time</li>
                            <li>Generates detailed hiring recommendation</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}