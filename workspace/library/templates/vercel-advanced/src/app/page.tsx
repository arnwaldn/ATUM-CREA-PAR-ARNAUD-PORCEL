export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Vercel Advanced Template
        </h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Blob Storage */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Blob Storage</h2>
            <p className="text-gray-600 mb-4">
              Upload et gestion de fichiers avec @vercel/blob
            </p>
            <code className="text-sm bg-gray-100 p-2 rounded block">
              POST /api/upload
            </code>
          </div>

          {/* KV Cache */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">KV Cache</h2>
            <p className="text-gray-600 mb-4">
              Rate limiting, sessions, caching avec @vercel/kv
            </p>
            <code className="text-sm bg-gray-100 p-2 rounded block">
              lib/kv.ts
            </code>
          </div>

          {/* Cron Jobs */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Cron Jobs</h2>
            <p className="text-gray-600 mb-4">
              Jobs planifiés: cleanup, sync, health check
            </p>
            <code className="text-sm bg-gray-100 p-2 rounded block">
              /api/cron/*
            </code>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Cron Schedule</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Job</th>
                <th className="border p-2 text-left">Schedule</th>
                <th className="border p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">cleanup</td>
                <td className="border p-2">0 2 * * *</td>
                <td className="border p-2">Daily at 2:00 AM UTC</td>
              </tr>
              <tr>
                <td className="border p-2">sync</td>
                <td className="border p-2">0 * * * *</td>
                <td className="border p-2">Every hour</td>
              </tr>
              <tr>
                <td className="border p-2">health</td>
                <td className="border p-2">*/15 * * * *</td>
                <td className="border p-2">Every 15 minutes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer className="mt-12 text-center text-gray-500">
          <p>
            Built with ULTRA-CREATE v27.0 | Vercel Advanced Template
          </p>
        </footer>
      </div>
    </main>
  );
}
