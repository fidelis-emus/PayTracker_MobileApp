/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  MessageSquare,
  LogOut,
  ChevronRight,
  Smartphone,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

const sections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile Information', description: 'Update your name, email, and photo', path: '/profile' },
      { icon: Zap, label: 'Subscription', description: 'Manage your premium plan', badge: 'Premium', path: '/subscription' },
      { icon: CreditCard, label: 'Payment Methods', description: 'Manage your connected accounts', path: '/payments' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', description: 'Configure push and email alerts', path: '/notifications' },
      { icon: MessageSquare, label: 'Reminder Templates', description: 'Customize SMS and WhatsApp messages', path: '/templates' },
      { icon: Globe, label: 'Language & Region', description: 'Set your local preferences', path: '/language' },
    ]
  },
  {
    title: 'Security',
    items: [
      { icon: Shield, label: 'Password & Security', description: 'Change password and 2FA', path: '/security' },
      { icon: Smartphone, label: 'Connected Devices', description: 'Manage your active sessions', path: '/devices' },
    ]
  }
];

export default function Settings() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500">Manage your account and app preferences.</p>
      </div>

      <div className="space-y-8">
        {sections.map((section, i) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">{section.title}</h3>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-slate-100">
              {section.items.map((item) => (
                <button 
                  key={item.label}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <item.icon size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-wider">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 transition-all" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-4">
        <button className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-all">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
        <p className="text-center text-xs text-slate-400 mt-6">PayTrackr v1.0.0 • Made with ❤️ for Businesses</p>
      </div>
    </div>
  );
}
