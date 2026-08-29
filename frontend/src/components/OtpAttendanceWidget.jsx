import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const ATTENDANCE_URL = import.meta.env.VITE_ATTENDANCE_URL || '/api/attendance';

export default function OtpAttendanceWidget({ token }) {
  const [activeSessions, setActiveSessions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  // Get or create device fingerprint
  const getDeviceFingerprint = () => {
    let fp = localStorage.getItem('device_fp');
    if (!fp) {
      fp = uuidv4();
      localStorage.setItem('device_fp', fp);
    }
    return fp;
  };

  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const res = await axios.get(`${ATTENDANCE_URL}/otp-attendance/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveSessions(res.data);
        if (res.data.length === 1 && !selectedSessionId) {
          setSelectedSessionId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch OTP sessions', err);
      }
    };

    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [token, selectedSessionId]);

  if (activeSessions.length === 0) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSessionId || otp.length !== 6) {
      setStatus({ type: 'error', message: 'Please enter a 6-digit code.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Submitting...' });
    
    try {
      const res = await axios.post(`${ATTENDANCE_URL}/otp-attendance/submit`, {
        sessionId: selectedSessionId,
        otp,
        deviceFingerprint: getDeviceFingerprint() + '|' + navigator.userAgent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ type: 'success', message: 'Marked Present!' });
      setTimeout(() => setIsOpen(false), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to submit' });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-80 border border-gray-200 dark:border-gray-700 animate-slideUp">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Attendance Check-in</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeSessions.length > 1 && (
              <select 
                value={selectedSessionId} 
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="">Select Course...</option>
                {activeSessions.map(s => (
                  <option key={s._id} value={s._id}>{s.courseId}</option>
                ))}
              </select>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center text-2xl tracking-[0.5em] bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="------"
              />
            </div>
            
            <button
              type="submit"
              disabled={status.type === 'loading'}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {status.type === 'loading' ? 'Verifying...' : 'Submit Code'}
            </button>
            
            {status.message && (
              <div className={`text-sm text-center font-medium ${status.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                {status.message}
              </div>
            )}
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </button>
      )}
    </div>
  );
}
