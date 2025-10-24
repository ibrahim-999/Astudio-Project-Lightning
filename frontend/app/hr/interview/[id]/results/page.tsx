'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import '../../../../styles.css'
import { API_URL, supabase } from '@/lib/supabase'


interface Analysis {
    overall_score: number
    technical_score: number
    communication_score: number
    cultural_fit_score: number
    strengths: string[]
    weaknesses: string[]
    key_insights: string
    recommendation: string
    detailed_analysis: string
}

export default function InterviewResultsPage() {
    const params = useParams()
    const router = useRouter()
    const interviewId = params?.id as string

    const [interview, setInterview] = useState<any>(null)
    const [analysis, setAnalysis] = useState<Analysis | null>(null)
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)
    const [organizationId, setOrganizationId] = useState('')


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

                loadResults(session.access_token)
            }
        }
        initData()
    }, [interviewId])

    const loadResults = async (token: string) => {
        try {
            const response = await fetch(`${API_URL}/api/interview/${interviewId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()

            if (data.success) {
                setInterview(data.interview)
                setAnalysis(data.analysis)
            }
        } catch (error) {
            console.error('Error loading results:', error)
        } finally {
            setLoading(false)
        }
    }

    const getRecommendationColor = (rec: string) => {
        switch (rec) {
            case 'strong_hire': return '#059669'
            case 'hire': return '#10b981'
            case 'maybe': return '#f59e0b'
            case 'no_hire': return '#ef4444'
            default: return '#6b7280'
        }
    }

    const getRecommendationText = (rec: string) => {
        switch (rec) {
            case 'strong_hire': return '🌟 Strong Hire'
            case 'hire': return '✅ Hire'
            case 'maybe': return '🤔 Maybe'
            case 'no_hire': return '❌ No Hire'
            default: return 'Pending'
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#059669'
        if (score >= 60) return '#10b981'
        if (score >= 40) return '#f59e0b'
        return '#ef4444'
    }

    if (loading) {
        return (
            <div className="dashboard">
                <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
                    <h2>Analyzing Interview...</h2>
                    <p style={{ color: '#64748b' }}>AI is generating detailed insights</p>
                </div>
            </div>
        )
    }

    if (!analysis) {
        return (
            <div className="dashboard">
                <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <h2>Analysis not found</h2>
                    <button onClick={() => router.push('/dashboard')} className="btn-signout">
                        Back to AI Chat
                    </button>
                </div>
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
                            <h1>Interview Analysis</h1>
                            <p>{interview?.candidate_name} - {interview?.position}</p>
                        </div>
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="btn-signout">
                        Back to AI Chat
                    </button>
                </div>
            </nav>

            <div className="container" style={{ maxWidth: '1000px' }}>
                {/* Recommendation Banner */}
                <div style={{
                    background: getRecommendationColor(analysis.recommendation),
                    color: 'white',
                    padding: '32px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    marginBottom: '32px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        {getRecommendationText(analysis.recommendation).split(' ')[0]}
                    </div>
                    <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>
                        {getRecommendationText(analysis.recommendation)}
                    </h2>
                    <p style={{ fontSize: '18px', opacity: 0.9 }}>
                        Overall Score: {analysis.overall_score}/100
                    </p>
                </div>

                {/* Score Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    {[
                        { label: 'Technical Skills', score: analysis.technical_score },
                        { label: 'Communication', score: analysis.communication_score },
                        { label: 'Cultural Fit', score: analysis.cultural_fit_score }
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: 'bold',
                                color: getScoreColor(item.score),
                                marginBottom: '8px'
                            }}>
                                {item.score}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                                {item.label}
                            </div>
                            <div style={{
                                marginTop: '12px',
                                height: '8px',
                                background: '#e5e7eb',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${item.score}%`,
                                    background: getScoreColor(item.score),
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Key Insights */}
                <div style={{
                    background: 'white',
                    padding: '32px',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>💡 Key Insights</h3>
                    <p style={{ lineHeight: '1.8', color: '#475569' }}>
                        {analysis.key_insights}
                    </p>
                </div>

                {/* Strengths & Weaknesses */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                    marginBottom: '24px'
                }}>
                    {/* Strengths */}
                    <div style={{
                        background: 'white',
                        padding: '28px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#059669', fontSize: '18px' }}>
                            ✅ Strengths
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {analysis.strengths.map((strength, i) => (
                                <li key={i} style={{
                                    padding: '12px',
                                    marginBottom: '8px',
                                    background: '#f0fdf4',
                                    borderRadius: '8px',
                                    borderLeft: '4px solid #059669',
                                    color: '#065f46'
                                }}>
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Weaknesses */}
                    <div style={{
                        background: 'white',
                        padding: '28px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#dc2626', fontSize: '18px' }}>
                            📌 Areas for Improvement
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {analysis.weaknesses.map((weakness, i) => (
                                <li key={i} style={{
                                    padding: '12px',
                                    marginBottom: '8px',
                                    background: '#fef2f2',
                                    borderRadius: '8px',
                                    borderLeft: '4px solid #dc2626',
                                    color: '#991b1b'
                                }}>
                                    {weakness}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Detailed Analysis */}
                <div style={{
                    background: 'white',
                    padding: '32px',
                    borderRadius: '16px',
                    marginBottom: '32px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>📝 Detailed Analysis</h3>
                    <p style={{ lineHeight: '1.8', color: '#475569', whiteSpace: 'pre-wrap' }}>
                        {analysis.detailed_analysis}
                    </p>
                </div>

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={() => router.push('/hr/interview')}
                        style={{
                            padding: '16px 32px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Start New Interview
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        style={{
                            padding: '16px 32px',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Back to AI Chat
                    </button>
                </div>
            </div>
        </div>
    )
}