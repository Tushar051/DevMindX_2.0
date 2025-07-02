import { useState } from 'react';

export default function LoginPage() {
  const [role, setRole] = useState('CUSTOMER');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 rounded-l ${role === 'CUSTOMER' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setRole('CUSTOMER')}
          >
            Customer
          </button>
          <button
            className={`px-4 py-2 rounded-r ${role === 'ELECTRICIAN' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setRole('ELECTRICIAN')}
          >
            Electrician
          </button>
        </div>
        <form className="space-y-4">
          <input type="email" placeholder="Email" className="w-full px-3 py-2 border rounded" />
          <input type="password" placeholder="Password" className="w-full px-3 py-2 border rounded" />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Login</button>
        </form>
        {role === 'CUSTOMER' && (
          <button className="w-full mt-4 bg-red-500 text-white py-2 rounded">Sign in with Google</button>
        )}
        <div className="text-center mt-4">
          <a href="/register" className="text-blue-500 hover:underline">Don't have an account? Register</a>
        </div>
      </div>
    </div>
  );
} 