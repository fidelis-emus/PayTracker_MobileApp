/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  dueDate: number;
  description: string;
  status: InvoiceStatus;
  createdAt: number;
  updatedAt: number;
  userId: string;
  paymentLink?: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  amount: number;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isPremium: boolean;
  createdAt: number;
}

export interface CreditInsight {
  customerId: string;
  score: 'Good' | 'Average' | 'Risky';
  paymentBehavior: string;
  totalPaid: number;
  totalOutstanding: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  outstandingPayments: number;
  overdueDebts: number;
  dailyPerformance: { date: string; amount: number }[];
}
