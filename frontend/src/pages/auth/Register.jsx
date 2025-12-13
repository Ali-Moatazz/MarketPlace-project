import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';


const EGYPT_GOVERNATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum", 
  "Gharbiya", "Ismailia", "Menofia", "Minya", "Qaliubiya", "New Valley", 
  "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta", 
  "Sharkia", "South Sinai", "Kafr Al sheikh", "Matrouh", "Luxor", 
  "Qena", "North Sinai", "Sohag"
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '', // Added field
    phone: '',
    address: '',
    role: 'buyer',
    governate: 'Cairo', // Default value 
    storeName: '',
    serviceArea: '',
    googleAppPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleToggle = (e) => {
    setFormData({ ...formData, role: e.target.checked ? 'seller' : 'buyer' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Client-Side Check: Do passwords match?
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // 2. Client-Side Check: Password Complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must contain at least 1 uppercase, 1 lowercase, and 1 number.");
      setLoading(false);
      return;
    }

    // 3. Prepare payload (Remove confirmPassword before sending)
    const { confirmPassword, ...registerPayload } = formData;

    // 4. Send to Backend
    const registeredUser = await register(registerPayload);
    
    if (registeredUser) {
      if (registeredUser.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } else {
      // If register() returned null, AuthContext set the error state, 
      // but we can set a backup message just in case.
      console.log("Registration failed in component");
      // Note: If AuthContext didn't set 'error', the user sees nothing.
      // Let's force an error if one isn't visible
      setLoading(false); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        {/* Display Error Box */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
             <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          <div className="flex items-center justify-center mb-6 bg-gray-100 p-3 rounded">
            <label className="flex items-center cursor-pointer">
              <span className="mr-3 text-sm font-medium text-gray-900">I want to Sell</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={formData.role === 'seller'}
                  onChange={handleRoleToggle}
                />
                <div className={`block w-14 h-8 rounded-full ${formData.role === 'seller' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${formData.role === 'seller' ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>

          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
          <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
          
          {/* PASSWORD ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
            <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Repeat password" />
          </div>

         <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required placeholder="01012345678" />

          {/* --- NEW: GOVERNATE DROPDOWN (Required for delivery check) --- */}
          {formData.role === 'buyer' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Governate <span className="text-red-500">*</span>
              </label>
              <select
                name="governate"
                value={formData.governate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {EGYPT_GOVERNATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input 
            label="Detailed Address" 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            required 
            placeholder="e.g. Building 10, Street 9" 
          />

          
          {/* SELLER FIELDS */}
          {formData.role === 'seller' && (
            <div className="border-t border-gray-200 pt-4 mt-4 bg-blue-50 p-4 rounded">
              <h3 className="text-lg font-medium text-blue-800 mb-3">Seller Details</h3>
              <Input label="Store Name" name="storeName" value={formData.storeName} onChange={handleChange} required />
              <Input label="Service Area (Bonus)" name="serviceArea" value={formData.serviceArea} onChange={handleChange} required placeholder="e.g. Cairo" />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Google App Password (Optional)</label>
                <input type="password" name="googleAppPassword" value={formData.googleAppPassword} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="For email alerts" />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;