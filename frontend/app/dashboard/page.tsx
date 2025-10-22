'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import '../styles.css'

export default function Dashboard() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
            } else {
                setUser(user)
            }
            setLoading(false)
        }
        checkUser()
    }, [router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #e5e7eb',
                        borderTopColor: '#667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p style={{ color: '#64748b' }}>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <div className="navbar-logo">⚡</div>
                        <div className="navbar-text">
                            <h1>Project Lightning</h1>
                            <p>AI-Native ERP System</p>
                        </div>
                    </div>

                    <div className="navbar-user">
                        <div className="user-email">
                            <div className="status-dot"></div>
                            <span>{user?.email}</span>
                        </div>
                        <button onClick={handleSignOut} className="btn-signout">
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container">
                <div className="hero">
                    <div className="badge">✅ Day 1 Complete</div>
                    <h2>Welcome to Your AI-Native ERP</h2>
                    <p>Built in 4 days. Powered by AI. Ready to transform creative agencies.</p>
                </div>

                <div className="modules-grid">
                    <div className="module-card active">
                        <div className="module-icon">🧑‍💼</div>
                        <div className="module-badge next">Day 2 - Next</div>
                        <h3>HR Module</h3>
                        <p>AI Interviewer conducts conversations, analyzes responses, and generates hiring insights automatically.</p>
                        <ul className="module-features">
                            <li>AI-powered interview conductor</li>
                            <li>Smart onboarding workflows</li>
                            <li>Intelligent task assignment</li>
                        </ul>
                        <button
                            onClick={() => router.push('/hr/interview')}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            Start Interview 🚀
                        </button>
                    </div>

                    <div className="module-card inactive">
                        <div className="module-icon">📊</div>
                        <div className="module-badge planned">Day 3 - Planned</div>
                        <h3>Projects</h3>
                        <p>AI Project Coordinator creates plans, assigns teams, predicts timelines, and prevents delays.</p>
                        <ul className="module-features">
                            <li>Natural language project creation</li>
                            <li>AI-powered team matching</li>
                            <li>Timeline prediction & risk alerts</li>
                        </ul>
                        <button disabled>Coming Soon</button>
                    </div>

                    <div className="module-card inactive">
                        <div className="module-icon">💰</div>
                        <div className="module-badge planned">Day 3 - Planned</div>
                        <h3>Finance</h3>
                        <p>AI Accountant categorizes expenses, predicts cash flow, and alerts about budget risks.</p>
                        <ul className="module-features">
                            <li>Automatic expense categorization</li>
                            <li>Cash flow predictions</li>
                            <li>Smart financial alerts</li>
                        </ul>
                        <button disabled>Coming Soon</button>
                    </div>
                </div>

                <div className="info-grid">
                    <div className="info-card">
                        <h3>✅ Day 1 Complete!</h3>
                        <ul className="checklist">
                            <li>Authentication system with Supabase</li>
                            <li>PostgreSQL database with 5 tables</li>
                            <li>FastAPI backend with Claude AI</li>
                            <li>Next.js frontend with custom CSS</li>
                            <li>User logged in: {user?.email}</li>
                        </ul>
                    </div>

                    <div className="info-card next-steps-card">
                        <h3>🚀 Day 2: HR Module</h3>
                        <p style={{ marginBottom: '20px', opacity: 0.9 }}>
                            Tomorrow we build the AI Interviewer - a conversational AI that conducts real job interviews!
                        </p>
                        <ul className="next-steps-list">
                            <li>Real-time AI conversation interface</li>
                            <li>Interview transcript storage</li>
                            <li>AI candidate scoring & analysis</li>
                            <li>Interview results dashboard</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer">
                <p>Project Lightning Assessment</p>
                <p>⚡ Speed × 🤖 Intelligence × 🎯 Precision</p>
            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}