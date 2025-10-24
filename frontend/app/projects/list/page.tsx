'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import '../../styles.css'
import { supabase, API_URL } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'  


export default function ProjectListPage() {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const [session, setSession] = useState<Session | null>(null)  
    const [organizationId, setOrganizationId] = useState('') // 

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
        if (session && organizationId) {
            loadProjects(session.access_token)
        }
    }, [organizationId, session])

    const loadProjects = async (token: string) => {
        if (!organizationId) return  // ✅ Don't load if no org ID yet

        try {
            const response = await fetch(`${API_URL}/api/projects?organization_id=${organizationId}`, {  // ✅ ADD QUERY PARAM
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()

            if (data.success) {
                setProjects(data.projects)
            }
        } catch (error) {
            console.error('Error loading projects:', error)
        } finally {
            setLoading(false)
        }
    }
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#10b981'
            case 'planning': return '#3b82f6'
            case 'completed': return '#8b5cf6'
            case 'on_hold': return '#f59e0b'
            case 'cancelled': return '#ef4444'
            default: return '#6b7280'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return '#ef4444'
            case 'high': return '#f59e0b'
            case 'medium': return '#3b82f6'
            case 'low': return '#6b7280'
            default: return '#6b7280'
        }
    }

    if (loading) {
        return (
            <div className="dashboard">
                <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <h2>Loading projects...</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <div className="navbar-logo">📊</div>
                        <div className="navbar-text">
                            <h1>Projects</h1>
                            <p>{projects.length} Active Projects</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => router.push('/projects')}
                            style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            + New Project
                        </button>
                        <button onClick={() => router.push('/dashboard')} className="btn-signout">
                            Back To AI Chat
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container">
                {projects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📂</div>
                        <h2>No Projects Yet</h2>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>
                            Create your first project using AI
                        </p>
                        <button
                            onClick={() => router.push('/projects')}
                            style={{
                                padding: '14px 28px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Create First Project
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '24px'
                    }}>
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => router.push(`/projects/${project.id}`)}
                                style={{
                                    background: 'white',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                      padding: '4px 12px',
                      background: getStatusColor(project.status) + '20',
                      color: getStatusColor(project.status),
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                  }}>
                    {project.status}
                  </span>
                                    <span style={{
                                        padding: '4px 12px',
                                        background: getPriorityColor(project.priority) + '20',
                                        color: getPriorityColor(project.priority),
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        textTransform: 'capitalize'
                                    }}>
                    {project.priority}
                  </span>
                                </div>

                                <h3 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 700 }}>
                                    {project.project_name}
                                </h3>

                                {project.client_name && (
                                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                                        👤 {project.client_name}
                                    </div>
                                )}

                                <p style={{
                                    color: '#64748b',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    marginBottom: '16px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {project.description}
                                </p>

                                {project.ai_generated && (
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 10px',
                                        background: '#f0f9ff',
                                        color: '#0369a1',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: 600
                                    }}>
                                        🤖 AI Generated
                                    </div>
                                )}

                                <div style={{
                                    marginTop: '16px',
                                    paddingTop: '16px',
                                    borderTop: '1px solid #e5e7eb',
                                    fontSize: '13px',
                                    color: '#64748b'
                                }}>
                                    Created {new Date(project.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}