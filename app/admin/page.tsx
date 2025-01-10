import { APIUsageDashboard } from '@/components/APIUsageDashboard';

export default function APIUsagePage() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Usage</h1>
        <APIUsageDashboard />
      </div>
    </main>
  );
}
