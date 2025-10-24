'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import '../styles.css'

export default function AddExpensePage() {
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [vendor, setVendor] = useState('')
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(false)
    const [aiCategory, setAiCategory] = useState('')
    const router = useRouter()

    const addExpense = async () => {
        if (!description.trim() || !amount) {
            toast.error('Please fill in required fields')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('http://localhost:8000/api/expense/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    amount: parseFloat(amount),
                    vendor: vendor || null,
                    expense_date: expenseDate,
                    organization_id: '00000000-0000-0000-0000-000000000001'
                })
            })

            const data = await response.json()

            if (data.success) {
                setAiCategory(data.ai_category)

                // Show AI tier and models used
                const tier = data.tier || 1
                let message = `✅ Expense added!\n\n`
                message += `📁 Category: ${data.ai_category}\n`
                message += `🎯 Confidence: ${Math.round(data.confidence * 100)}%\n\n`
                message += `🤖 AI Processing:\n`
                message += `├─ Tier ${tier}: ${data.categorization_model}\n`

                if (data.ai_insights) {
                    message += `└─ Tier 3: ${data.analysis_model} (deep analysis)\n`
                }

                toast.success(message, {
                    duration: 5000,
                    icon: '🤖',
                    style: {
                        whiteSpace: 'pre-line'
                    }
                })

                // Show deep insights separately
                if (data.ai_insights) {
                    setTimeout(() => {
                        toast(data.ai_insights, {
                            duration: 10000,
                            icon: '💡',
                            style: {
                                background: '#fffbeb',
                                borderLeft: '4px solid #f59e0b',
                                maxWidth: '600px'
                            }
                        })
                    }, 2000)
                }

                setTimeout(() => {
                    router.push('/finance/list')
                }, data.ai_insights ? 4000 : 2000)
            } else {
                toast.error('Failed to add expense')
            }
        } catch (error) {
            console.error(error)
            toast.error('Error adding expense')
        } finally {
            setLoading(false)
        }
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
                            <h1>Add Expense</h1>
                            <p>AI Finance Assistant</p>
                        </div>
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="btn-signout">
                        Back to AI Chat
                    </button>
                </div>
            </nav>

            <div className="container">
                <div className="hero">
                    <div className="badge">🤖 AI-Powered Categorization</div>
                    <h2>Add New Expense</h2>
                    <p>AI will automatically categorize your expense</p>
                </div>

                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="info-card">
                        <h3 style={{ marginBottom: '24px' }}>Expense Details</h3>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                Description *
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Adobe Creative Cloud subscription"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '15px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                    Amount (USD) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="99.99"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '15px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={expenseDate}
                                    onChange={(e) => setExpenseDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '15px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                Vendor (Optional)
                            </label>
                            <input
                                type="text"
                                value={vendor}
                                onChange={(e) => setVendor(e.target.value)}
                                placeholder="Adobe Inc."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '15px'
                                }}
                            />
                        </div>

                        <button
                            onClick={addExpense}
                            disabled={loading || !description.trim() || !amount}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: loading || !description.trim() || !amount
                                    ? '#e5e7eb'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: loading || !description.trim() || !amount ? '#9ca3af' : 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: loading || !description.trim() || !amount ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'AI is Categorizing...' : 'Add Expense 🚀'}
                        </button>
                    </div>

                    <div style={{
                        marginTop: '32px',
                        padding: '20px',
                        background: '#f0fdf4',
                        borderRadius: '12px',
                        border: '1px solid #bbf7d0'
                    }}>
                        <h4 style={{ marginBottom: '12px', color: '#166534' }}>AI Categories:</h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px',
                            fontSize: '13px',
                            color: '#166534'
                        }}>
                            <div>• Software & Tools</div>
                            <div>• Marketing</div>
                            <div>• Office Supplies</div>
                            <div>• Travel</div>
                            <div>• Client Meetings</div>
                            <div>• Freelancers</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}