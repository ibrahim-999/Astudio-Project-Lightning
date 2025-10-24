'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_URL, supabase } from '@/lib/supabase'  // ✅ ADD supabase
import type { Session } from '@supabase/supabase-js'  

export default function MigrationPage() {
    const [file, setFile] = useState<File | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [session, setSession] = useState<Session | null>(null)    // 
    const [organizationId, setOrganizationId] = useState('')  // 
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
                    }
                } catch (error) {
                    console.error('Error fetching org:', error)
                }
            }
        }
        initData()
    }, [])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            setFile(droppedFile)
        }
    }

    const analyzeFile = async () => {
        if (!file || !session || !organizationId) return  // ✅ ADD CHECKS

        setAnalyzing(true)
        setResult(null)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('organization_id', organizationId)  // 

        try {
            const response = await fetch(`${API_URL}/api/migration/analyze-csv`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.access_token || ''}`  //
                },
                body: formData
            })
            const data = await response.json()
            setResult(data)
        } catch (error) {
            alert('Error analyzing file')
        } finally {
            setAnalyzing(false)
        }
    }

    const importFile = async () => {
        if (!file || !session || !organizationId) return  // ✅ ADD CHECKS

        setImporting(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('organization_id', organizationId)  // 

        try {
            const response = await fetch(`${API_URL}/api/migration/import-expenses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.access_token || ''}`  //
                },
                body: formData
            })
            const data = await response.json()

            if (data.success) {
                setShowSuccess(true)
                setTimeout(() => {
                    router.push('/finance/list')
                }, 2000)
            }
        } catch (error) {
            alert('Error importing file')
        } finally {
            setImporting(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto 20px',
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
                <button
                    onClick={() => router.push('/dashboard')}
                    style={{
                        padding: '10px 20px',
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                    }}
                >
                    ← Back to AI Chat
                </button>
            </div>
            {/* Header */}
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto 40px',
                textAlign: 'center'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                }}>
                    <span style={{ fontSize: '48px' }}>🚀</span>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: 'white',
                        margin: 0
                    }}>
                        Magic Import
                    </h1>
                </div>
                <p style={{
                    fontSize: '20px',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '8px'
                }}>
                    Upload any CSV file - AI figures out the rest
                </p>
                <p style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.7)'
                }}>
                    Client operational in under 2 minutes ⚡
                </p>
            </div>

            <div style={{
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                {/* Upload Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '48px',
                        marginBottom: '24px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        border: isDragging ? '3px dashed #667eea' : '3px dashed transparent',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '32px'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '40px'
                        }}>
                            📄
                        </div>

                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            color: '#1e293b'
                        }}>
                            {file ? '✅ File Selected!' : 'Drop your CSV file here'}
                        </h3>
                        <p style={{
                            color: '#64748b',
                            marginBottom: '24px'
                        }}>
                            {file ? file.name : 'or click to browse'}
                        </p>

                        <label style={{
                            display: 'inline-block',
                            padding: '14px 32px',
                            background: file ? '#10b981' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}
                               onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                               onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {file ? '📄 Change File' : '📁 Choose File'}
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => {
                                    setFile(e.target.files?.[0] || null)
                                    setResult(null)
                                }}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    {/* Action Buttons */}
                    {file && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px'
                        }}>
                            <button
                                onClick={analyzeFile}
                                disabled={analyzing}
                                style={{
                                    padding: '20px',
                                    background: analyzing ? '#e5e7eb' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    cursor: analyzing ? 'not-allowed' : 'pointer',
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => !analyzing && (e.currentTarget.style.transform = 'scale(1.02)')}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {analyzing ? (
                                    <>
                                        <div className="spinner"></div>
                                        AI Analyzing...
                                    </>
                                ) : (
                                    <>🔍 Analyze First</>
                                )}
                            </button>

                            <button
                                onClick={importFile}
                                disabled={!result?.success || importing}
                                style={{
                                    padding: '20px',
                                    background: (!result?.success || importing) ? '#e5e7eb' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    cursor: (!result?.success || importing) ? 'not-allowed' : 'pointer',
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => result?.success && !importing && (e.currentTarget.style.transform = 'scale(1.02)')}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {importing ? (
                                    <>
                                        <div className="spinner"></div>
                                        Importing...
                                    </>
                                ) : (
                                    <>✨ Import Now</>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* AI Analysis Results */}
                {result && (
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '32px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        animation: 'slideIn 0.4s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px'
                        }}>
                            <span style={{ fontSize: '32px' }}>🤖</span>
                            <h3 style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#1e293b',
                                margin: 0
                            }}>
                                AI Analysis Complete
                            </h3>
                        </div>

                        {result.success ? (
                            <>
                                {/* Confidence Score */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    border: '2px solid #86efac'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontWeight: 600, color: '#166534' }}>
                                            Confidence Score
                                        </span>
                                        <span style={{
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            color: '#16a34a'
                                        }}>
                                            {Math.round((result.mapping?.confidence || 0) * 100)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Field Mapping */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        marginBottom: '16px',
                                        color: '#1e293b'
                                    }}>
                                        📊 Detected Fields
                                    </h4>
                                    <div style={{
                                        background: '#f8fafc',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        {Object.entries(result.mapping?.mapping || {}).map(([key, value], i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '12px',
                                                background: 'white',
                                                borderRadius: '8px',
                                                marginBottom: i < Object.keys(result.mapping?.mapping || {}).length - 1 ? '8px' : 0,
                                                fontSize: '14px'
                                            }}>
                                                <span style={{ color: '#64748b', flex: 1 }}>{key}</span>
                                                <span style={{ margin: '0 12px', color: '#667eea' }}>→</span>
                                                <span style={{ fontWeight: 600, color: '#667eea' }}>{value as string}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Preview Table */}
                                <div>
                                    <h4 style={{
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        marginBottom: '16px',
                                        color: '#1e293b'
                                    }}>
                                        👀 Preview (First 3 Rows)
                                    </h4>
                                    <div style={{
                                        overflowX: 'auto',
                                        background: '#f8fafc',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <table style={{
                                            width: '100%',
                                            borderCollapse: 'collapse',
                                            fontSize: '14px'
                                        }}>
                                            <thead>
                                            <tr style={{ background: 'white' }}>
                                                {result.original_columns?.map((col: string, i: number) => (
                                                    <th key={i} style={{
                                                        padding: '12px',
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        color: '#1e293b',
                                                        borderBottom: '2px solid #e2e8f0'
                                                    }}>
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {result.preview?.map((row: any, i: number) => (
                                                <tr key={i} style={{
                                                    background: i % 2 === 0 ? 'white' : '#f8fafc'
                                                }}>
                                                    {Object.values(row).map((val: any, j: number) => (
                                                        <td key={j} style={{
                                                            padding: '12px',
                                                            color: '#475569',
                                                            borderBottom: '1px solid #e2e8f0'
                                                        }}>
                                                            {String(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Warnings */}
                                {result.mapping?.warnings?.length > 0 && (
                                    <div style={{
                                        marginTop: '24px',
                                        padding: '20px',
                                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                        borderRadius: '12px',
                                        border: '2px solid #fbbf24'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '12px'
                                        }}>
                                            <span style={{ fontSize: '20px' }}>⚠️</span>
                                            <strong style={{ color: '#92400e' }}>Warnings</strong>
                                        </div>
                                        <ul style={{
                                            margin: 0,
                                            paddingLeft: '20px',
                                            color: '#92400e'
                                        }}>
                                            {result.mapping.warnings.map((w: string, i: number) => (
                                                <li key={i} style={{ marginBottom: '4px' }}>{w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{
                                padding: '32px',
                                textAlign: 'center',
                                color: '#dc2626',
                                background: '#fef2f2',
                                borderRadius: '12px',
                                border: '2px solid #fca5a5'
                            }}>
                                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>❌</span>
                                <strong style={{ fontSize: '18px' }}>Error: {result.error}</strong>
                            </div>
                        )}
                    </div>
                )}

                {/* How It Works */}
                <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '32px',
                    marginTop: '24px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white'
                }}>
                    <h4 style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>💡</span> How it works
                    </h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px'
                    }}>
                        {[
                            { icon: '📤', text: 'Upload any CSV file' },
                            { icon: '🤖', text: 'AI analyzes structure' },
                            { icon: '🔄', text: 'Smart field mapping' },
                            { icon: '✨', text: 'Import in seconds' }
                        ].map((step, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '20px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{step.icon}</div>
                                <div style={{ fontSize: '14px', fontWeight: 500 }}>{step.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    animation: 'fadeIn 0.3s'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '48px',
                        borderRadius: '24px',
                        textAlign: 'center',
                        maxWidth: '400px',
                        animation: 'scaleIn 0.3s'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '40px'
                        }}>
                            ✅
                        </div>
                        <h3 style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            marginBottom: '12px',
                            color: '#1e293b'
                        }}>
                            Import Successful!
                        </h3>
                        <p style={{ color: '#64748b', marginBottom: '16px' }}>
                            Redirecting to expenses...
                        </p>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                </div>
            )}

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
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}