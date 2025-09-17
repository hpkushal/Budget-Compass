'use client'

export default function DebugEnvPage() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NODE_ENV: process.env.NODE_ENV,
  }

  console.log('Environment variables:', envVars)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🔍 Environment Variables Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Client-side Environment Variables:</h2>
        <pre className="text-sm">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-medium mb-2">Expected Values:</h3>
        <ul className="text-sm space-y-1">
          <li><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> Should be https://fiswiqyybmoycrsykrxw.supabase.co</li>
          <li><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> Should be a long JWT token</li>
          <li><strong>NODE_ENV:</strong> Should be "development"</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-red-50 rounded-lg">
        <h3 className="font-medium mb-2">⚠️ If values are undefined:</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Make sure .env.local file exists in the project root</li>
          <li>Restart the development server: <code className="bg-gray-200 px-1 rounded">npm run dev</code></li>
          <li>Check that variable names start with <code className="bg-gray-200 px-1 rounded">NEXT_PUBLIC_</code></li>
          <li>Ensure no extra spaces or quotes around values</li>
        </ol>
      </div>
    </div>
  )
}
