'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../styles.css'
import { API_URL } from '@/lib/supabase'


export default function CreateProjectPage() {
    const [brief, setBrief] = useState('')
    const [clientName, setClientName] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const createProject = async () => {
        if (!brief.trim()) {
            alert('Please enter a project brief')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/project/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brief,
                    client_name: clientName || null,
                    organization_id: '00000000-0000-0000-0000-000000000001'
                })
            })

            const data = await response.json()

            if (data.success) {
                router.push('/projects/list')
            } else {
                alert('Failed to create project')
            }
        } catch (error) {
            console.error(error)
            alert('Error creating project')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <div className="navbar-logo">📊</div>
                        <div className="navbar-text">
                            <h1>Create Project</h1>
                            <p>AI Project Coordinator</p>
                        </div>
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="btn-signout">
                        Back to AI Chat
                    </button>
                </div>
            </nav>

            <div className="container">
                <div className="hero">
                    <div className="badge">🤖 AI-Powered Planning</div>
                    <h2>Describe Your Project</h2>
                    <p>AI will create a complete project plan with tasks and timeline</p>
                </div>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="info-card">
                        <h3 style={{ marginBottom: '24px' }}>Project Details</h3>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                Client Name (Optional)
                            </label>
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Acme Corp"
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
                                Project Brief
                            </label>
                            <textarea
                                value={brief}
                                onChange={(e) => setBrief(e.target.value)}
                                placeholder="Example: Build a mobile app for tracking fitness goals. Need user authentication, workout logging, progress charts, and social features. Target launch in 2 months."
                                style={{
                                    width: '100%',
                                    minHeight: '200px',
                                    padding: '16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                                Describe what you want to build. AI will break it down into tasks.
                            </div>
                        </div>

                        <button
                            onClick={createProject}
                            disabled={loading || !brief.trim()}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: loading || !brief.trim()
                                    ? '#e5e7eb'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: loading || !brief.trim() ? '#9ca3af' : 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: loading || !brief.trim() ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'AI is Planning...' : 'Create Project with AI 🚀'}
                        </button>
                    </div>

                    <div style={{
                        marginTop: '32px',
                        padding: '20px',
                        background: '#f0f9ff',
                        borderRadius: '12px',
                        border: '1px solid #bfdbfe'
                    }}>
                        <h4 style={{ marginBottom: '12px', color: '#1e40af' }}>What AI will do:</h4>
                        <ul style={{ lineHeight: '1.8', color: '#1e40af', paddingLeft: '20px' }}>
                            <li>Analyze your project requirements</li>
                            <li>Generate project name and description</li>
                            <li>Break down into 5-8 actionable tasks</li>
                            <li>Estimate timeline and priorities</li>
                            <li>Create ready-to-use project plan</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}