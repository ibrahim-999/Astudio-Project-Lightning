'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import '../../styles.css'
import { API_URL } from '@/lib/supabase'


export default function ProjectDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params?.id as string

    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTasks()
    }, [projectId])

    const loadTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/api/project/${projectId}/tasks`)
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
        try {
            await fetch(`${API_URL}/api/task/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    const statusOptions = ['todo', 'in_progress', 'review', 'done', 'blocked']

    if (loading) {
        return <div className="dashboard"><div className="container">Loading...</div></div>
    }

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <div className="navbar-logo">✅</div>
                        <div className="navbar-text">
                            <h1>Project Tasks</h1>
                            <p>{tasks.length} Tasks</p>
                        </div>
                    </div>
                    <button onClick={() => router.push('/projects/list')} className="btn-signout">
                        Back to Projects
                    </button>
                </div>
            </nav>

            <div className="container" style={{ maxWidth: '900px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                borderLeft: `4px solid ${getStatusColor(task.status)}`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>
                                        {task.task_title}
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
                                        {task.task_description}
                                    </p>
                                    {task.estimated_hours && (
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#64748b',
                                            padding: '4px 8px',
                                            background: '#f1f5f9',
                                            borderRadius: '6px'
                                        }}>
                      ⏱️ {task.estimated_hours}h
                    </span>
                                    )}
                                </div>
                                <select
                                    value={task.status}
                                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '2px solid ' + getStatusColor(task.status),
                                        background: getStatusColor(task.status) + '20',
                                        color: getStatusColor(task.status),
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>
                                            {status.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}