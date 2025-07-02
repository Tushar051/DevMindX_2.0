import { useState } from 'react';

export default function RegisterPage() {
  const [role, setRole] = useState('CUSTOMER');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
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
          <input type="text" placeholder="Name" className="w-full px-3 py-2 border rounded" />
          {role === 'ELECTRICIAN' && (
            <input type="number" placeholder="Age" className="w-full px-3 py-2 border rounded" />
          )}
          <input type="email" placeholder="Email" className="w-full px-3 py-2 border rounded" />
          <input type="password" placeholder="Password" className="w-full px-3 py-2 border rounded" />
          <input type="text" placeholder="Mobile Number" className="w-full px-3 py-2 border rounded" />
          {role === 'ELECTRICIAN' && (
            <input type="text" placeholder="Aadhaar Number" className="w-full px-3 py-2 border rounded" />
          )}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Register</button>
        </form>
        {role === 'CUSTOMER' && (
          <button className="w-full mt-4 bg-red-500 text-white py-2 rounded">Sign up with Google</button>
        )}
        <div className="text-center mt-4">
          <a href="/login" className="text-blue-500 hover:underline">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
} 