import { useState, useEffect } from 'react'
import { FolderOpen, Save, Settings, Info, FileText, Moon, Sun } from 'lucide-react'

function App() {
  const [version, setVersion] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    loadAppInfo()
    loadTheme()
  }, [])

  const loadAppInfo = async () => {
    const ver = await window.electronAPI.getAppVersion()
    setVersion(ver)
  }

  const loadTheme = async () => {
    const savedTheme = await window.electronAPI.getStoreValue('theme')
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
  }

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    await window.electronAPI.setStoreValue('theme', newTheme)
  }

  const openFile = async () => {
    const filePath = await window.electronAPI.selectFile({
      filters: [
        { name: 'Text Files', extensions: ['txt', 'md', 'json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (filePath) {
      const fileContent = await window.electronAPI.readFile(filePath)
      setCurrentFile(filePath)
      setContent(fileContent)
      setIsDirty(false)
    }
  }

  const saveFile = async () => {
    let filePath = currentFile

    if (!filePath) {
      filePath = await window.electronAPI.showSaveDialog({
        filters: [{ name: 'Text Files', extensions: ['txt', 'md'] }],
      })
    }

    if (filePath) {
      await window.electronAPI.writeFile(filePath, content)
      setCurrentFile(filePath)
      setIsDirty(false)
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setIsDirty(true)
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Titlebar / Drag Region */}
      <div className="h-8 bg-gray-100 dark:bg-gray-800 flex items-center px-4 app-drag">
        <div className="flex-1 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">
            {currentFile ? currentFile.split(/[/\\]/).pop() : 'Untitled'}
            {isDirty && ' •'}
          </span>
        </div>
        <div className="flex items-center gap-1 no-drag">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2">
        <button
          onClick={openFile}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm">Open</span>
        </button>
        <button
          onClick={saveFile}
          disabled={!content}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          <span className="text-sm">Save</span>
        </button>
        <div className="flex-1" />
        <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 p-4">
          {currentFile || content ? (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full resize-none bg-transparent outline-none font-mono text-sm leading-relaxed"
              placeholder="Start typing..."
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">No file open</p>
              <p className="text-sm mt-2">
                Click <strong>Open</strong> to load a file
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            v{version}
          </span>
          <span>{window.electronAPI.platform}</span>
          {content && (
            <>
              <span>{content.length} chars</span>
              <span>{content.split('\n').length} lines</span>
            </>
          )}
        </div>
        <div className="flex-1" />
        <span>{isDirty ? 'Unsaved changes' : 'Saved'}</span>
      </div>
    </div>
  )
}

export default App
