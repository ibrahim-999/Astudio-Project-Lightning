'use client'
import { useState } from 'react'

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
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
            disabled={loading}
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
