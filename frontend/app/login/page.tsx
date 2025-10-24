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

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) {
                setMessage({ text: error.message, type: 'error' })
                setLoading(false)
                return
            }

            // ✅ NEW: Create organization for the new user
            if (data.user) {
                try {
                    console.log('Creating organization for user:', data.user.id)

                    const response = await fetch(
                        `${API_URL}/api/auth/setup-user-org?user_id=${data.user.id}`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        }
                    )

                    const orgData = await response.json()
                    console.log('Organization setup response:', orgData)

                    if (orgData.success) {
                        setMessage({ text: '✅ Account created! Redirecting...', type: 'success' })
                        setTimeout(() => router.push('/dashboard'), 1000)
                    } else {
                        setMessage({
                            text: '⚠️ Account created but setup incomplete. Please contact support.',
                            type: 'error'
                        })
                    }
                } catch (orgError) {
                    console.error('Error creating organization:', orgError)
                    setMessage({
                        text: '⚠️ Account created but setup incomplete. You can still login.',
                        type: 'error'
                    })
                }
            } else {
                setMessage({ text: '✅ Account created! Redirecting...', type: 'success' })
                setTimeout(() => router.push('/dashboard'), 1000)
            }
        } catch (err) {
            console.error('Signup error:', err)
            setMessage({ text: 'Signup failed. Please try again.', type: 'error' })
        }

        setLoading(false)
    }

    const handleSignIn = async () => {
        setLoading(true)
        setMessage(null)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setMessage({ text: error.message, type: 'error' })
                setLoading(false)
                return
            }

            // ✅ NEW: Check if user has organization, create if missing
            if (data.user) {
                try {
                    console.log('Checking organization for user:', data.user.id)

                    const orgCheck = await fetch(
                        `${API_URL}/api/user/organization?user_id=${data.user.id}`
                    )
                    const orgData = await orgCheck.json()

                    if (!orgData.success) {
                        // No org found, create one
                        console.log('No organization found, creating...')
                        await fetch(
                            `${API_URL}/api/auth/setup-user-org?user_id=${data.user.id}`,
                            { method: 'POST' }
                        )
                    }
                } catch (orgError) {
                    console.error('Error checking/creating organization:', orgError)
                    // Continue to dashboard anyway
                }
            }

            router.push('/dashboard')
        } catch (err) {
            console.error('Login error:', err)
            setMessage({ text: 'Login failed. Please try again.', type: 'error' })
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    )
}