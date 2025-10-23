'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import '../styles.css'

export default function Dashboard() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [interviews, setInterviews] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [expenses, setExpenses] = useState<any[]>([])
    const [expenseSummary, setExpenseSummary] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
            } else {
                setUser(user)
                loadDashboardData()
            }
            setLoading(false)
        }
        checkUser()
    }, [router])

    const loadDashboardData = async () => {
        const orgId = '00000000-0000-0000-0000-000000000001'

        try {
            const res = await fetch(`http://localhost:8000/api/interviews?organization_id=${orgId}`)
            const data = await res.json()
            if (data.success) {
                const completedInterviews = data.interviews.filter(
                    (interview: any) => interview.status === 'completed'
                )
                setInterviews(completedInterviews.slice(0, 5))
            }
        } catch (error) {
            console.error('Error loading interviews:', error)
        }

        try {
            const res = await fetch(`http://localhost:8000/api/projects?organization_id=${orgId}`)
            const data = await res.json()
            if (data.success) {
                setProjects(data.projects.slice(0, 5)) // Show last 5
            }
        } catch (error) {
            console.error('Error loading projects:', error)
        }

        // Load expense summary
        try {
            const res = await fetch(`http://localhost:8000/api/expenses/summary?organization_id=${orgId}`)
            const data = await res.json()
            if (data.success) {
                setExpenseSummary(data.summary)
            }
        } catch (error) {
            console.error('Error loading expenses:', error)
        }
    }

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

            <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
                {/* SIDEBAR */}
                <div style={{
                    width: '320px',
                    background: 'white',
                    borderRight: '1px solid #e5e7eb',
                    padding: '24px',
                    overflowY: 'auto'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>
                        📊 Quick View
                    </h3>

                    {/* Interviews Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                                🧑‍💼 Recent Interviews
                            </h4>
                            <button
                                onClick={() => router.push('/hr/interview')}
                                style={{
                                    fontSize: '20px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                +
                            </button>
                        </div>
                        {interviews.length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#94a3b8' }}>No interviews yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {interviews.map((interview) => (
                                    <div
                                        key={interview.id}
                                        style={{
                                            padding: '10px',
                                            background: '#f8fafc',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => router.push(`/hr/interview/${interview.id}/results`)}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                            {interview.candidate_name}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '12px' }}>
                                            {interview.position} • {interview.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Projects Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                                📊 Active Projects
                            </h4>
                            <button
                                onClick={() => router.push('/projects')}
                                style={{
                                    fontSize: '20px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                +
                            </button>
                        </div>
                        {projects.length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#94a3b8' }}>No projects yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        style={{
                                            padding: '10px',
                                            background: '#f8fafc',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => router.push(`/projects/${project.id}`)}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                            {project.project_name}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '12px' }}>
                                            {project.status} • {project.priority}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => router.push('/projects/list')}
                                    style={{
                                        padding: '8px',
                                        background: 'none',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        color: '#667eea',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    View All Projects →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Finance Summary */}
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                                💰 Finance Summary
                            </h4>
                            <button
                                onClick={() => router.push('/finance')}
                                style={{
                                    fontSize: '20px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                +
                            </button>
                        </div>
                        {!expenseSummary || expenseSummary.total === 0 ? (
                            <p style={{ fontSize: '13px', color: '#94a3b8' }}>No expenses yet</p>
                        ) : (
                            <div>
                                <div style={{
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Total Spending</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                        ${expenseSummary.total.toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px' }}>
                                    {Object.entries(expenseSummary.by_category).slice(0, 3).map(([cat, amt]: any) => (
                                        <div
                                            key={cat}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '6px 0',
                                                borderBottom: '1px solid #f1f5f9'
                                            }}
                                        >
                                            <span style={{ color: '#64748b' }}>{cat}</span>
                                            <span style={{ fontWeight: 600 }}>${amt.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => router.push('/finance/list')}
                                    style={{
                                        width: '100%',
                                        marginTop: '12px',
                                        padding: '8px',
                                        background: 'none',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        color: '#667eea',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    View All Expenses →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="container">
                        <div className="hero">
                            <div className="badge">✅ Day 3 Complete - All Modules Active</div>
                            <h2>Welcome to Your AI-Native ERP</h2>
                            <p>Built in 4 days. Powered by AI. Ready to transform creative agencies.</p>
                        </div>

                        <div className="modules-grid">
                            <div className="module-card active">
                                <div className="module-icon">🧑‍💼</div>
                                <div className="module-badge next">Active</div>
                                <h3>HR Module</h3>
                                <p>AI Interviewer conducts conversations, analyzes responses, and generates hiring insights automatically.</p>
                                <ul className="module-features">
                                    <li>AI-powered interview conductor</li>
                                    <li>Smart onboarding workflows</li>
                                    <li>Intelligent task assignment</li>
                                </ul>
                                <button
                                    onClick={() => router.push('/hr/interview')}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Start Interview 🚀
                                </button>
                            </div>

                            <div className="module-card active">
                                <div className="module-icon">📊</div>
                                <div className="module-badge next">Active</div>
                                <h3>Projects</h3>
                                <p>AI Project Coordinator creates plans, assigns teams, predicts timelines, and prevents delays.</p>
                                <ul className="module-features">
                                    <li>Natural language project creation</li>
                                    <li>AI-powered team matching</li>
                                    <li>Timeline prediction & risk alerts</li>
                                </ul>
                                <button
                                    onClick={() => router.push('/projects')}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Create Project 🚀
                                </button>
                            </div>

                            <div className="module-card active">
                                <div className="module-icon">💰</div>
                                <div className="module-badge next">Active</div>
                                <h3>Finance</h3>
                                <p>AI Accountant categorizes expenses, predicts cash flow, and alerts about budget risks.</p>
                                <ul className="module-features">
                                    <li>Automatic expense categorization</li>
                                    <li>Cash flow predictions</li>
                                    <li>Smart financial alerts</li>
                                </ul>
                                <button
                                    onClick={() => router.push('/finance')}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Add Expense 💰
                                </button>
                            </div>
                            <div className="module-card active">
                                <div className="module-icon">🤖</div>
                                <div className="module-badge next">Active</div>
                                <h3>AI Assistant</h3>
                                <p>Unified AI chat interface. Talk naturally to manage expenses, projects, and HR - all in one conversation.</p>
                                <ul className="module-features">
                                    <li>Natural language commands</li>
                                    <li>Cross-module intelligence</li>
                                    <li>Proactive AI suggestions</li>
                                </ul>
                                <button
                                    onClick={() => router.push('/ai')}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Open AI Chat 💬
                                </button>
                            </div>
                        </div>

                        <div className="info-grid">
                            <div className="info-card">
                                <h3>✅ Day 3 Complete!</h3>
                                <ul className="checklist">
                                    <li>HR Module with AI Interviewer</li>
                                    <li>Projects with AI task generation</li>
                                    <li>Finance with AI categorization</li>
                                    <li>All modules interconnected</li>
                                    <li>User logged in: {user?.email}</li>
                                </ul>
                            </div>

                            <div className="info-card next-steps-card">
                                <h3>🎉 All 3 Modules Complete!</h3>
                                <p style={{ marginBottom: '20px', opacity: 0.9 }}>
                                    HR, Projects, and Finance modules are fully functional with AI!
                                </p>
                                <ul className="next-steps-list">
                                    <li>AI Interview Conductor with analysis</li>
                                    <li>Natural language project creation</li>
                                    <li>AI expense categorization</li>
                                    <li>Real-time data across all modules</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="footer">
                        <p>Project Lightning Assessment</p>
                        <p>⚡ Speed × 🤖 Intelligence × 🎯 Precision</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}