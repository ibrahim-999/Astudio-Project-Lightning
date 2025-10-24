'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import '../../styles.css'
import { API_URL, supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'  // At the top



export default function ExpenseListPage() {
    const [expenses, setExpenses] = useState<any[]>([])
    const [summary, setSummary] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<Session | null>(null)  // In the component
    const [organizationId, setOrganizationId] = useState('')

    const router = useRouter()

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
                        loadExpenses(session.access_token, orgData.organization_id)
                        loadSummary(session.access_token, orgData.organization_id)
                    }
                } catch (error) {
                    console.error('Error fetching org:', error)
                    setLoading(false)
                }
            }
        }
        initData()
    }, [router])
    const loadExpenses = async (token: string, orgId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/expenses?organization_id=${orgId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()

            if (data.success) {
                setExpenses(data.expenses)
            } else {
                toast.error('Failed to load expenses')
            }
        } catch (error) {
            console.error('Error loading expenses:', error)
            toast.error('Error loading expenses')
        } finally {
            setLoading(false)
        }
    }

    const loadSummary = async (token: string, orgId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/expenses/summary?organization_id=${orgId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()

            if (data.success) {
                setSummary(data.summary)
            }
        } catch (error) {
            console.error('Error loading summary:', error)
        }
    }

    const getCategoryColor = (category: string | null) => {
        if (!category) return '#6b7280'

        const colors: any = {
            'Software & Tools': '#3b82f6',
            'Marketing': '#ec4899',
            'Office Supplies': '#8b5cf6',
            'Travel': '#10b981',
            'Client Meetings': '#f59e0b',
            'Freelancers': '#06b6d4',
            'Other': '#6b7280'
        }
        return colors[category] || '#6b7280'
    }

    if (loading) {
        return (
            <div className="dashboard">
                <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <h2>Loading expenses...</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard">
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#fff',
                        color: '#333',
                        padding: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <div className="navbar-logo">💰</div>
                        <div className="navbar-text">
                            <h1>Expenses</h1>
                            <p>{expenses.length} Total Expenses</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => router.push('/finance')}
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
                            + Add Expense
                        </button>
                        <button onClick={() => router.push('/dashboard')} className="btn-signout">
                            Back to AI Chat
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container">
                {/* Summary Cards */}
                {summary && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginBottom: '32px'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '24px',
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                                Total Expenses
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                                ${summary.total.toFixed(2)}
                            </div>
                        </div>

                        {Object.entries(summary.by_category).slice(0, 3).map(([category, amount]: any) => (
                            <div key={category} style={{
                                background: 'white',
                                padding: '24px',
                                borderRadius: '16px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                borderLeft: `4px solid ${getCategoryColor(category)}`
                            }}>
                                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                                    {category}
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: getCategoryColor(category) }}>
                                    ${amount.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Expense List */}
                {expenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>💸</div>
                        <h2>No Expenses Yet</h2>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>
                            Add your first expense and let AI categorize it
                        </p>
                        <button
                            onClick={() => router.push('/finance')}
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
                            Add First Expense
                        </button>
                    </div>
                ) : (
                    <div className="info-card">
                        <h3 style={{ marginBottom: '24px' }}>Recent Expenses</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {expenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    style={{
                                        padding: '16px',
                                        background: '#f8fafc',
                                        borderRadius: '12px',
                                        borderLeft: `4px solid ${getCategoryColor(expense.category)}`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                            {expense.description}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                                            {new Date(expense.expense_date).toLocaleDateString()}
                                            {expense.vendor && ` • ${expense.vendor}`}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: getCategoryColor(expense.category)
                                        }}>
                                            ${expense.amount}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            padding: '4px 8px',
                                            background: getCategoryColor(expense.category) + '20',
                                            color: getCategoryColor(expense.category),
                                            borderRadius: '6px',
                                            marginTop: '4px',
                                            fontWeight: 600
                                        }}>
                                            {expense.ai_categorized && '🤖 '}
                                            {expense.category || 'Uncategorized'}  {/* Show "Uncategorized" if NULL */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}