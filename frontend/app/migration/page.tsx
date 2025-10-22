'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MigrationPage() {
    const [file, setFile] = useState<File | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState<any>(null)
    const router = useRouter()

    const analyzeFile = async () => {
        if (!file) return

        setAnalyzing(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('http://localhost:8000/api/migration/analyze-csv', {
                method: 'POST',
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
        if (!file) return

        setImporting(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('http://localhost:8000/api/migration/import-expenses', {
                method: 'POST',
                body: formData
            })
            const data = await response.json()

            if (data.success) {
                alert(`✅ Imported ${data.imported} expenses!`)
                router.push('/finance/list')
            }
        } catch (error) {
            alert('Error importing file')
        } finally {
            setImporting(false)
        }
    }

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🚀 Magic Import</h1>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>
                Upload any CSV file - AI will figure out the rest
            </p>

            {/* File Upload */}
            <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                marginBottom: '24px',
                background: '#f8fafc'
            }}>
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ marginBottom: '16px' }}
                />

                {file && (
                    <div style={{ marginTop: '16px' }}>
                        <p style={{ fontWeight: 600, color: '#059669' }}>
                            ✅ {file.name} selected
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <button
                    onClick={analyzeFile}
                    disabled={!file || analyzing}
                    style={{
                        flex: 1,
                        padding: '16px',
                        background: !file || analyzing ? '#e5e7eb' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: !file || analyzing ? 'not-allowed' : 'pointer'
                    }}
                >
                    {analyzing ? 'AI Analyzing...' : '🔍 Analyze First'}
                </button>

                <button
                    onClick={importFile}
                    disabled={!result?.success || importing}
                    style={{
                        flex: 1,
                        padding: '16px',
                        background: !result?.success || importing ? '#e5e7eb' : '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: !result?.success || importing ? 'not-allowed' : 'pointer'
                    }}
                >
                    {importing ? 'Importing...' : '✅ Import Now'}
                </button>
            </div>

            {/* Results */}
            {result && (
                <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '16px' }}>🤖 AI Analysis Results</h3>

                    {result.success ? (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <strong>Detected Fields:</strong>
                                <pre style={{
                                    background: '#f1f5f9',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    overflow: 'auto'
                                }}>
                                    {JSON.stringify(result.mapping?.mapping, null, 2)}
                                </pre>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <strong>Confidence: </strong>
                                {Math.round((result.mapping?.confidence || 0) * 100)}%
                            </div>

                            <div>
                                <strong>Preview (first 3 rows):</strong>
                                <pre style={{
                                    background: '#f1f5f9',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    overflow: 'auto',
                                    maxHeight: '200px'
                                }}>
                                    {JSON.stringify(result.preview, null, 2)}
                                </pre>
                            </div>

                            {result.mapping?.warnings?.length > 0 && (
                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    background: '#fef3c7',
                                    borderRadius: '8px'
                                }}>
                                    <strong>⚠️ Warnings:</strong>
                                    <ul>
                                        {result.mapping.warnings.map((w: string, i: number) => (
                                            <li key={i}>{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ color: '#dc2626' }}>
                            Error: {result.error}
                        </div>
                    )}
                </div>
            )}

            {/* Instructions */}
            <div style={{
                marginTop: '32px',
                padding: '20px',
                background: '#f0f9ff',
                borderRadius: '12px',
                fontSize: '14px'
            }}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>
                    💡 How it works:
                </strong>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                    <li>Upload any CSV file with expense data</li>
                    <li>AI analyzes the structure and maps fields</li>
                    <li>Preview shows how data will be imported</li>
                    <li>Click "Import" to add expenses to your system</li>
                </ol>
            </div>
        </div>
    )
}