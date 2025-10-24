'use client'
import { useState, useEffect } from 'react'
import { supabase, API_URL } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'  


export default function ChatPage() {
    const [message, setMessage] = useState('')
    const [response, setResponse] = useState('')
    const [loading, setLoading] = useState(false)
    const [session, setSession] = useState<Session | null>(null)  
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
                    }
                } catch (error) {
                    console.error('Error fetching org:', error)
                }
            }
        }
        initData()
    }, [])

    const sendMessage = async () => {
        if (!organizationId) return

        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    message,
                    organization_id: organizationId
                })
            })
            const data = await res.json()
            setResponse(data.response)
        } catch (error) {
            setResponse('Error: ' + error)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Project Lightning AI</h1>

                <div className="bg-white rounded-lg shadow-md p-6">
          <textarea
              className="w-full border rounded-lg p-3 mb-4 min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask AI anything..."
          />

                    <button
                        onClick={sendMessage}
                        disabled={loading || !organizationId}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Thinking...' : 'Send Message'}
                    </button>
                </div>

                {response && (
                    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold mb-2">AI Response:</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
                    </div>
                )}
            </div>
        </div>
    )
}