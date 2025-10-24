'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import '../styles.css'
import { API_URL } from '@/lib/supabase'



export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null)
    const router = useRouter()

    const handleSignUp = async () => {
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setMessage({ text: error.message, type: 'error' })
        } else {
            setMessage({ text: '✅ Account created! Redirecting...', type: 'success' })
            setTimeout(() => router.push('/dashboard'), 1000)
        }
        setLoading(false)
    }

    const handleSignIn = async () => {
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setMessage({ text: error.message, type: 'error' })
        } else {
            router.push('/dashboard')
        }
        setLoading(false)
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-logo">
                    <h1>⚡ Project Lightning</h1>
                    <p>AI-Native ERP System</p>
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                    />
                </div>

                {message && (
                    <div className={`message-box ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="button-group">
                    <button
                        onClick={handleSignIn}
                        disabled={loading || !email || !password}
                        className="btn btn-primary"
                    >
                        {loading ? 'Loading...' : 'Sign In'}
                    </button>

                    <button
                        onClick={handleSignUp}
                        disabled={loading || !email || !password}
                        className="btn btn-success"
                    >
                        {loading ? 'Loading...' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    )
}