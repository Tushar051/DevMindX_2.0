export default function DashboardPage() {
  // In a real app, you'd get the user/role from context or JWT
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <p className="mb-4">Welcome to Kaamwala!</p>
        <p className="text-gray-500">(Role-based dashboard coming soon)</p>
      </div>
    </div>
  );
} 