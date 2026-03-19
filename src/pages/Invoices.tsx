/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  X,
  Save,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollection, useFirestore } from '../hooks/useFirestore';
import { Invoice, Customer, InvoiceTemplate, InvoiceStatus } from '../types';
import { where, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function Invoices() {
  const { user } = useAuth();
  const { data: invoices, loading: invoicesLoading } = useCollection<Invoice>('invoices', [
    where('userId', '==', user?.uid || ''),
    orderBy('createdAt', 'desc')
  ]);
  const { data: customers } = useCollection<Customer>('customers', [
    where('userId', '==', user?.uid || '')
  ]);
  const { data: templates } = useCollection<InvoiceTemplate>('invoice_templates', [
    where('userId', '==', user?.uid || '')
  ]);
  const { add, update, remove } = useFirestore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    amount: 0,
    dueDate: '',
    description: '',
    status: 'Pending' as InvoiceStatus,
  });

  const handleOpenModal = () => {
    setFormData({
      customerId: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      description: '',
      status: 'Pending',
    });
    setIsModalOpen(true);
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        amount: template.amount,
        description: template.description,
      }));
      toast.success(`Applied template: ${template.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return;
    }

    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) return;

    try {
      await add('invoices', {
        ...formData,
        customerName: customer.name,
        dueDate: Timestamp.fromDate(new Date(formData.dueDate)),
      });
      toast.success('Invoice created successfully');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await remove('invoices', id);
        toast.success('Invoice deleted');
      } catch (error) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: InvoiceStatus) => {
    try {
      await update('invoices', id, { status: newStatus });
      toast.success(`Invoice marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    paid: invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0),
    pending: invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Invoices</h2>
          <p className="text-slate-500">Track your payments and manage your revenue flow.</p>
        </div>
        <button onClick={handleOpenModal} className="btn-primary">
          <Plus size={20} />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Paid</p>
            <p className="text-xl font-display font-bold text-slate-900">{formatCurrency(stats.paid)}</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-xl font-display font-bold text-slate-900">{formatCurrency(stats.pending)}</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overdue</p>
            <p className="text-xl font-display font-bold text-slate-900">{formatCurrency(stats.overdue)}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search invoices..." 
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Invoice List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoicesLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice, i) => (
                  <motion.tr 
                    key={invoice.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/50 transition-all group"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">{invoice.id.slice(0, 8).toUpperCase()}</span>
                      <p className="text-[10px] text-slate-500">Created: {formatDate(invoice.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{invoice.customerName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(invoice.amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Calendar size={12} className="text-slate-400" />
                        {formatDate(invoice.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                        invoice.status === 'Paid' ? "bg-emerald-50 text-emerald-600" :
                        invoice.status === 'Pending' ? "bg-amber-50 text-amber-600" :
                        "bg-rose-50 text-rose-600"
                      )}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {invoice.status !== 'Paid' && (
                          <button 
                            onClick={() => handleUpdateStatus(invoice.id, 'Paid')}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" 
                            title="Mark as Paid"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(invoice.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                          title="Delete"
                        >
                          <AlertCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-slate-900">Create New Invoice</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {templates.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Apply Template</label>
                    <select 
                      className="input-field"
                      onChange={(e) => handleApplyTemplate(e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Select a template...</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</label>
                  <select 
                    required
                    className="input-field"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  >
                    <option value="" disabled>Select a customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount ($)</label>
                    <input 
                      type="number" 
                      required
                      step="0.01"
                      className="input-field"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</label>
                    <input 
                      type="date" 
                      required
                      className="input-field"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea 
                    required
                    rows={3}
                    className="input-field resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    <Save size={18} />
                    <span>Create Invoice</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
