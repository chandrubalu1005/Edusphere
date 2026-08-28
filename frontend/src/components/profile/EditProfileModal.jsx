import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditProfileModal({ isOpen, onClose, profile, accent, updateProfile }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        bio: profile.bio || ''
      });
    }
  }, [profile, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate({ userId: profile.userId, data: formData }, {
      onSuccess: () => {
        toast.success('Profile updated successfully');
        onClose();
      },
      onError: () => {
        toast.error('Unable to update profile. Please try again.');
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-900">Edit Profile</h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">
                  Personal Information
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Bio</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute top-3 left-0 flex pl-3 text-slate-400">
                      <AlignLeft size={16} />
                    </div>
                    <textarea
                      rows="3"
                      className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfile.isLoading}
                    className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 ${accent.bg} ${updateProfile.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {updateProfile.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
