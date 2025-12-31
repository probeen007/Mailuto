import { auth } from "@/auth";

export default async function DebugPage() {
  const session = await auth();

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Session Debug</h1>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Current Session</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Session User ID</h2>
        <p className="text-lg">
          {session?.user?.id ? (
            <span className="text-green-600">✓ User ID present: {session.user.id}</span>
          ) : (
            <span className="text-red-600">✗ User ID missing - Please sign out and sign in again</span>
          )}
        </p>
      </div>
    </div>
  );
}
