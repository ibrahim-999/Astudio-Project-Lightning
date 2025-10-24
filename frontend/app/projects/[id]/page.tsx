'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import '../../styles.css'
import { API_URL, supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'  

export default function ProjectDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params?.id as string

    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<Session | null>(null)  
    const [organizationId, setOrganizationId] = useState('')
    const [projectName, setProjectName] = useState('Project Tasks')

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
        if (session) {
            loadTasks()
        }
    }, [projectId, session])

    const loadTasks = async () => {
        if (!session) return

        try {
            const response = await fetch(`${API_URL}/api/project/${projectId}/tasks`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token || ''}`
                }
            })
            const data = await response.json()

            if (data.success) {
                setTasks(data.tasks)
            }
        } catch (error) {
            console.error('Error loading tasks:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        if (!session) return

        try {
            await fetch(`${API_URL}/api/task/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || ''}`
                },
                body: JSON.stringify({
                    task_id: taskId,
                    status: newStatus
                })
            })
            loadTasks()
        } catch (error) {
            console.error('Error updating task:', error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return '#10b981'
            case 'in_progress': return '#3b82f6'
            case 'review': return '#f59e0b'
            case 'blocked': return '#ef4444'
            case 'todo': return '#6b7280'
            default: return '#6b7280'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done': return '✅'
            case 'in_progress': return '🔄'
            case 'review': return '👀'
            case 'blocked': return '🚫'
            case 'todo': return '📋'
            default: return '📋'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'done': return 'Done'
            case 'in_progress': return 'In Progress'
            case 'review': return 'Review'
            case 'blocked': return 'Blocked'
            case 'todo': return 'To Do'
            default: return status
        }
    }

    const statusOptions = ['todo', 'in_progress', 'review', 'done', 'blocked']

    // Calculate progress
    const completedTasks = tasks.filter(t => t.status === 'done').length
    const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

    if (loading) {
        return (
            <div className="dashboard">
                <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        border: '4px solid #e5e7eb',
                        borderTopColor: '#667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p style={{ color: '#64748b' }}>Loading tasks...</p>
                </div>
                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        )
    }

    return (
        <div className="dashboard">
            {/* Navigation */}
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <div className="navbar-logo">📊</div>
                        <div className="navbar-text">
                            <h1>{projectName}</h1>
                            <p>{tasks.length} Tasks • {completedTasks} Completed</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/projects/list')}
                        className="btn-signout"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        ← Back to Projects
                    </button>
                </div>
            </nav>

            <div className="container" style={{ maxWidth: '1100px' }}>
                {/* Progress Overview */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '20px',
                    padding: '32px',
                    marginBottom: '32px',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Project Progress</h2>
                            <p style={{ opacity: 0.9, fontSize: '16px' }}>
                                {completedTasks} of {tasks.length} tasks completed
                            </p>
                        </div>
                        <div style={{
                            fontSize: '48px',
                            fontWeight: 'bold',
                            background: 'rgba(255,255,255,0.2)',
                            padding: '16px 24px',
                            borderRadius: '16px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            {Math.round(progressPercentage)}%
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                        height: '12px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                            width: `${progressPercentage}%`,
                            transition: 'width 0.5s ease',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                        }} />
                    </div>

                    {/* Status Summary */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '12px',
                        marginTop: '24px'
                    }}>
                        {statusOptions.map(status => {
                            const count = tasks.filter(t => t.status === status).length
                            return (
                                <div key={status} style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                                        {getStatusIcon(status)}
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                        {count}
                                    </div>
                                    <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'capitalize' }}>
                                        {getStatusLabel(status)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Tasks List */}
                {tasks.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
                        <h2 style={{ marginBottom: '12px' }}>No Tasks Yet</h2>
                        <p style={{ color: '#64748b' }}>Tasks will appear here once created</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {tasks.map((task, index) => (
                            <div
                                key={task.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                    overflow: 'hidden',
                                    borderLeft: `6px solid ${getStatusColor(task.status)}`,
                                    animation: `slideIn 0.3s ease ${index * 0.1}s both`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                                }}
                            >
                                <div style={{ padding: '28px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
                                        <div style={{ flex: 1 }}>
                                            {/* Task Number & Status Icon */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                <div style={{
                                                    fontSize: '28px',
                                                    filter: task.status === 'done' ? 'grayscale(0)' : 'grayscale(50%)'
                                                }}>
                                                    {getStatusIcon(task.status)}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: '#94a3b8',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    TASK #{index + 1}
                                                </div>
                                            </div>

                                            {/* Task Title */}
                                            <h3 style={{
                                                fontSize: '20px',
                                                fontWeight: 700,
                                                marginBottom: '12px',
                                                color: '#1e293b',
                                                textDecoration: task.status === 'done' ? 'line-through' : 'none',
                                                opacity: task.status === 'done' ? 0.6 : 1
                                            }}>
                                                {task.task_title}
                                            </h3>

                                            {/* Task Description */}
                                            <p style={{
                                                color: '#64748b',
                                                fontSize: '15px',
                                                lineHeight: '1.7',
                                                marginBottom: '16px'
                                            }}>
                                                {task.task_description}
                                            </p>

                                            {/* Estimated Hours Badge */}
                                            {task.estimated_hours && (
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 14px',
                                                    background: '#f8fafc',
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '10px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    color: '#475569'
                                                }}>
                                                    ⏱️ {task.estimated_hours} hours
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Dropdown */}
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                color: '#94a3b8',
                                                marginBottom: '8px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Status
                                            </label>
                                            <select
                                                value={task.status}
                                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                                style={{
                                                    padding: '12px 16px',
                                                    paddingRight: '40px',
                                                    borderRadius: '12px',
                                                    border: `2px solid ${getStatusColor(task.status)}`,
                                                    backgroundColor: `${getStatusColor(task.status)}15`,  // ✅ Changed from 'background'
                                                    color: getStatusColor(task.status),
                                                    fontWeight: 700,
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    textTransform: 'capitalize',
                                                    appearance: 'none',
                                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(getStatusColor(task.status))}' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 12px center',
                                                    backgroundSize: '16px',
                                                    transition: 'all 0.2s ease',
                                                    minWidth: '160px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)'
                                                    e.currentTarget.style.boxShadow = `0 4px 12px ${getStatusColor(task.status)}40`
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)'
                                                    e.currentTarget.style.boxShadow = 'none'
                                                }}
                                            >
                                                {statusOptions.map(status => (
                                                    <option key={status} value={status}>
                                                        {getStatusLabel(status)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}