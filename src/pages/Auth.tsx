/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { signInWithGoogle } from '../services/firebase';

export default function Auth() {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl shadow-primary/20 mb-6"
          >
            P
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">PayTrackr</h1>
          <p className="text-slate-500">Smart collections for smart businesses.</p>
        </div>

        <div className="glass-card p-8 rounded-3xl space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Automated Reminders</p>
                <p className="text-xs text-slate-500">Send scheduled SMS and WhatsApp alerts to debtors.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Secure Payments</p>
                <p className="text-xs text-slate-500">Integrated Paystack and Flutterwave gateways.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Credit Insights</p>
                <p className="text-xs text-slate-500">Track customer behavior and scoring.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogin}
            className="btn-primary w-full py-4 text-lg"
          >
            <LogIn size={22} />
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-[10px] text-slate-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-500">
            Trusted by 5,000+ freelancers and businesses.
          </p>
        </div>
      </div>
    </div>
  );
}
