export default function Unauthorized() {
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-950 text-white">
      <h1 className="text-4xl font-bold text-red-500">Access Denied</h1>
      <p className="mt-4 text-slate-400">You do not have Admin privileges.</p>
      <a href="/" className="mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors">
        Return to Client Site
      </a>
    </div>
  );
}
