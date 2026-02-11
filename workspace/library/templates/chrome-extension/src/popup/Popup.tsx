import { useState, useEffect } from 'react'
import { storage } from '../lib/storage'
import { sendMessage } from '../lib/messaging'

export function Popup() {
  const [count, setCount] = useState(0)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    // Load saved count from storage
    storage.get<number>('clickCount').then((saved) => {
      if (saved) setCount(saved)
    })

    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        setCurrentUrl(tabs[0].url)
      }
    })
  }, [])

  const handleClick = async () => {
    const newCount = count + 1
    setCount(newCount)
    await storage.set('clickCount', newCount)

    // Send message to background script
    const response = await sendMessage({ type: 'INCREMENT', payload: newCount })
    console.log('Background response:', response)
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="w-80 p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          Chrome Extension
        </h1>
        <p className="text-sm text-gray-500">Built with React + TypeScript</p>
      </header>

      <div className="space-y-4">
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Current URL:</p>
          <p className="text-xs font-mono text-blue-600 truncate">
            {currentUrl || 'Loading...'}
          </p>
        </div>

        <div className="p-3 bg-white rounded-lg shadow-sm text-center">
          <p className="text-3xl font-bold text-indigo-600 mb-2">{count}</p>
          <p className="text-sm text-gray-500">Click count</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClick}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Increment
          </button>
          <button
            onClick={openOptions}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>

      <footer className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          v1.0.0 • Manifest V3
        </p>
      </footer>
    </div>
  )
}
