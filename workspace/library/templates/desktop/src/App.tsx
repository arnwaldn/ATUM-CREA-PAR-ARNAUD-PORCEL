import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

function App() {
  const [greeting, setGreeting] = useState('')
  const [name, setName] = useState('')

  async function greet() {
    setGreeting(await invoke('greet', { name }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {{APP_NAME}}
      </h1>
      
      <p className="text-gray-600 mb-8">{{APP_TAGLINE}}</p>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Entrez votre nom"
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={greet}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Saluer
        </button>
      </div>

      {greeting && (
        <p className="text-xl text-green-600 font-medium">{greeting}</p>
      )}
    </div>
  )
}

export default App
