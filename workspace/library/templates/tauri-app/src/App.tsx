import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { FileText, FolderOpen, Save, Settings } from 'lucide-react';

function App() {
  const [content, setContent] = useState('');
  const [filePath, setFilePath] = useState<string | null>(null);

  const handleOpen = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Text', extensions: ['txt', 'md', 'json'] }]
    });

    if (selected) {
      const text = await readTextFile(selected as string);
      setContent(text);
      setFilePath(selected as string);
    }
  };

  const handleSave = async () => {
    if (filePath) {
      await writeTextFile(filePath, content);
    } else {
      const path = await save({
        filters: [{ name: 'Text', extensions: ['txt'] }]
      });
      if (path) {
        await writeTextFile(path, content);
        setFilePath(path);
      }
    }
  };

  const handleGreet = async () => {
    const greeting = await invoke<string>('greet', { name: 'Tauri' });
    alert(greeting);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <header className="bg-white border-b px-4 py-2 flex items-center gap-2">
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100"
        >
          <FolderOpen size={18} />
          Open
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100"
        >
          <Save size={18} />
          Save
        </button>
        <div className="flex-1" />
        <button
          onClick={handleGreet}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100"
        >
          <Settings size={18} />
          Test
        </button>
      </header>

      {/* Editor */}
      <main className="flex-1 p-4">
        <div className="h-full bg-white rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 px-4 py-2 border-b text-sm text-gray-600">
            <FileText size={16} />
            {filePath || 'Untitled'}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[calc(100%-40px)] p-4 resize-none focus:outline-none font-mono"
            placeholder="Start typing or open a file..."
          />
        </div>
      </main>

      {/* Status Bar */}
      <footer className="bg-white border-t px-4 py-1 text-xs text-gray-500">
        Built with Tauri 2.0 + React + ULTRA-CREATE v15.0
      </footer>
    </div>
  );
}

export default App;
