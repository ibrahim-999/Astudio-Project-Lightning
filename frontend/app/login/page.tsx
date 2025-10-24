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
            console.log('🔵 Starting signup for:', email)

            const requestBody: any = {
                email,
                password
            }

            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })

            const data = await response.json()
            console.log('Signup response:', data)

            if (!response.ok || !data.success) {
                let errorMessage = 'Signup failed. Please try again.'

                if (data.detail) {
                    if (Array.isArray(data.detail)) {
                        errorMessage = data.detail.map((err: any) => err.msg).join(', ')
                    }
                    else if (typeof data.detail === 'string') {
                        errorMessage = data.detail
                    }
                    else if (typeof data.detail === 'object') {
                        errorMessage = JSON.stringify(data.detail)
                    }
                } else if (data.message) {
                    errorMessage = data.message
                }

                setMessage({
                    text: errorMessage,
                    type: 'error'
                })
                setLoading(false)
                return
            }

            console.log('✅ Signup successful!')
            console.log('User ID:', data.user.id)
            console.log('Organization ID:', data.organization.id)

            // Show success message
            setMessage({
                text: '✅ Account created successfully! Redirecting...',
                type: 'success'
            })

            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (loginError) {
                console.warn('Auto-login failed, user needs to login manually')
                setMessage({
                    text: '✅ Account created! Please sign in.',
                    type: 'success'
                })
                setLoading(false)
                return
            }

            // Redirect to dashboard
            setTimeout(() => router.push('/dashboard'), 1500)

        } catch (err: any) {
            console.error('❌ Signup error:', err)
            const errorMessage = err?.message || 'Signup failed. Please check your connection and try again.'
            setMessage({
                text: errorMessage,
                type: 'error'
            })
        }

        setLoading(false)
    }

    const handleSignIn = async () => {
        setLoading(true)
        setMessage(null)

        try {
            console.log('🔵 Signing in:', email)

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('❌ Login error:', error.message)
                setMessage({ text: error.message, type: 'error' })
                setLoading(false)
                return
            }

            console.log('✅ Login successful!')

            // ✅ Check if user has organization (for old users who signed up before the fix)
            if (data.user) {
                try {
                    console.log('Checking organization for user:', data.user.id)

                    const orgCheck = await fetch(
                        `${API_URL}/api/user/organization?user_id=${data.user.id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${data.session.access_token}`
                            }
                        }
                    )
                    const orgData = await orgCheck.json()

                    if (!orgData.success || !orgData.organization_id) {
                        // No org found, create one (this fixes old users)
                        console.log('⚠️ No organization found, creating...')

                        const setupResponse = await fetch(
                            `${API_URL}/api/auth/setup-user-org?user_id=${data.user.id}`,
                            {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${data.session.access_token}`
                                }
                            }
                        )

                        const setupData = await setupResponse.json()
                        console.log('Organization setup:', setupData)
                    } else {
                        console.log('✅ User has organization:', orgData.organization_id)
                    }
                } catch (orgError) {
                    console.error('⚠️ Error checking/creating organization:', orgError)
                    // Continue to dashboard anyway - they can fix it later
                }
            }

            console.log('🚀 Redirecting to dashboard...')
            router.push('/dashboard')

        } catch (err: any) {
            console.error('❌ Login error:', err)
            const errorMessage = err?.message || 'Login failed. Please try again.'
            setMessage({ text: errorMessage, type: 'error' })
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

                <div style={{
                    marginTop: '20px',
                    fontSize: '12px',
                    color: '#64748b',
                    textAlign: 'center'
                }}>
                    <p>🔒 Your data is secure and encrypted</p>
                    <p>Each user gets their own organization automatically</p>
                </div>
            </div>
        </div>
    )
}