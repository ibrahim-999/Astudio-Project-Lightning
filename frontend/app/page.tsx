'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/login')
    }, [router])

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div style={{ color: 'white', fontSize: '24px' }}>
                ⚡ Redirecting to login...
            </div>
        </div>
    )
}