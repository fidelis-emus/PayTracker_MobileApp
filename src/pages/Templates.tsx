/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Copy,
  FileText,
  X,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollection, useFirestore } from '../hooks/useFirestore';
import { InvoiceTemplate } from '../types';
import { where, orderBy } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function Templates() {
  const { user } = useAuth();
  const { data: templates, loading } = useCollection<InvoiceTemplate>('invoice_templates', [
    where('userId', '==', user?.uid || ''),
    orderBy('createdAt', 'desc')
  ]);
  const { add, update, remove } = useFirestore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: 0,
  });

  const handleOpenModal = (template?: InvoiceTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description,
        amount: template.amount,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        amount: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await update('invoice_templates', editingTemplate.id, formData);
        toast.success('Template updated successfully');
      } else {
        await add('invoice_templates', formData);
        toast.success('Template created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await remove('invoice_templates', id);
        toast.success('Template deleted');
      } catch (error) {
        toast.error('Failed to delete template');
      }
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Invoice Templates</h2>
          <p className="text-slate-500">Create reusable templates for faster invoicing.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          <Plus size={20} />
          <span>New Template</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search templates..." 
          className="input-field pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div 
              key={template.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 rounded-2xl space-y-4 group relative"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <FileText size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleOpenModal(template)}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-900">{template.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{template.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Default Amount</p>
                  <p className="text-xl font-display font-bold text-slate-900">
                    ${template.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Last Used</p>
                  <p className="text-xs text-slate-600">Recently</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Copy size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No templates yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            Create your first template to speed up your invoice generation process.
          </p>
          <button 
            onClick={() => handleOpenModal()}
            className="btn-primary mt-6 mx-auto"
          >
            <Plus size={20} />
            <span>Create Template</span>
          </button>
        </div>
      )}

      {/* Modal */}
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
                <h3 className="text-xl font-display font-bold text-slate-900">
                  {editingTemplate ? 'Edit Template' : 'New Template'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Template Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Monthly Retainer, Web Design"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Description</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="What are you billing for?"
                    className="input-field resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Amount ($)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="input-field"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
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
                    <span>{editingTemplate ? 'Update Template' : 'Save Template'}</span>
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
