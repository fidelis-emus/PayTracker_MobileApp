/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Receipt, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'motion/react';
import { useCollection } from '../hooks/useFirestore';
import { Invoice, Customer } from '../types';
import { where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: invoices, loading: invoicesLoading } = useCollection<Invoice>('invoices', [
    where('userId', '==', user?.uid || ''),
    orderBy('createdAt', 'desc')
  ]);

  const { data: recentInvoices } = useCollection<Invoice>('invoices', [
    where('userId', '==', user?.uid || ''),
    orderBy('createdAt', 'desc'),
    limit(5)
  ]);

  const { data: customers } = useCollection<Customer>('customers', [
    where('userId', '==', user?.uid || '')
  ]);

  const stats = useMemo(() => {
    const totalRevenue = invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const outstanding = invoices
      .filter(inv => inv.status === 'Pending')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const overdue = invoices
      .filter(inv => inv.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);

    return [
      { 
        label: 'Total Revenue', 
        value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue), 
        icon: TrendingUp, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50' 
      },
      { 
        label: 'Outstanding', 
        value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(outstanding), 
        icon: Clock, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50' 
      },
      { 
        label: 'Overdue', 
        value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(overdue), 
        icon: Receipt, 
        color: 'text-rose-600', 
        bg: 'bg-rose-50' 
      },
      { 
        label: 'Active Customers', 
        value: customers.length.toString(), 
        icon: Users, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50' 
      },
    ];
  }, [invoices, customers]);

  // Mock chart data based on real revenue if possible, otherwise fallback
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueByDay = new Array(7).fill(0).map((_, i) => ({
      name: days[i],
      revenue: 0
    }));

    invoices.forEach(inv => {
      if (inv.status === 'Paid' && inv.createdAt) {
        const date = new Date(inv.createdAt);
        const dayIndex = date.getDay();
        revenueByDay[dayIndex].revenue += inv.amount;
      }
    });

    return revenueByDay;
  }, [invoices]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <button onClick={() => navigate('/invoices')} className="btn-primary">
          <Plus size={20} />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-display font-bold text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold text-slate-900">Revenue Overview</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Paid Invoices by Day</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-display font-bold text-slate-900 mb-6">Recent Invoices</h3>
          <div className="space-y-4">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  onClick={() => navigate('/invoices')}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                      {invoice.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{invoice.customerName}</p>
                      <p className="text-[10px] text-slate-500">INV-{invoice.id.slice(0, 4).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}
                    </p>
                    <p className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block uppercase tracking-wider",
                      invoice.status === 'Paid' ? "bg-emerald-50 text-emerald-600" :
                      invoice.status === 'Overdue' ? "bg-rose-50 text-rose-600" :
                      "bg-amber-50 text-amber-600"
                    )}>
                      {invoice.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-slate-500 text-sm">No recent invoices.</p>
            )}
          </div>
          <button 
            onClick={() => navigate('/invoices')}
            className="w-full mt-6 text-sm font-semibold text-primary hover:underline"
          >
            View all invoices
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
