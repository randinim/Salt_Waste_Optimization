import React from 'react';
import { Deal } from '@/dtos/compass/types';
import { Button } from './Button';
import { X, Printer, Download } from 'lucide-react';

interface InvoiceModalProps {
  deal: Deal;
  userRole: 'seller' | 'landowner';
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ deal, userRole, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${deal.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = new Date(deal.completedAt || deal.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header - Hidden in print */}
        <div className="sticky top-0 bg-blue-600 text-white p-5 rounded-t-2xl flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Invoice</h2>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" className="bg-white/20 border-white/30 text-white h-10 px-4">
              <Printer size={18} />
              Print
            </Button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 print:p-12" id="invoice-content">
          {/* Letterhead */}
          <div className="text-center mb-8 border-b-2 border-slate-200 pb-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-1">BrineX</h1>
            <p className="text-slate-600 text-sm">Intelligent Salt Production Platform</p>
          </div>

          {/* Invoice Header */}
          <div className="flex justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">INVOICE</h2>
              <div className="text-sm text-slate-600 space-y-1">
                <p><strong>Invoice #:</strong> {invoiceNumber}</p>
                <p><strong>Date:</strong> {invoiceDate}</p>
                <p><strong>Status:</strong> <span className="text-emerald-600 font-semibold">Paid</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-1">Deal ID</p>
              <p className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{deal.id}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">From (Seller)</p>
              <p className="font-bold text-slate-900 text-lg">{deal.sellerName}</p>
              <p className="text-sm text-slate-600 mt-1">Seller ID: {deal.sellerId}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">To (Buyer)</p>
              <p className="font-bold text-slate-900 text-lg">{deal.landownerName}</p>
              <p className="text-sm text-slate-600 mt-1">Landowner ID: {deal.landownerId}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Description</th>
                  <th className="text-right p-3 text-sm font-semibold text-slate-700">Quantity</th>
                  <th className="text-right p-3 text-sm font-semibold text-slate-700">Unit Price</th>
                  <th className="text-right p-3 text-sm font-semibold text-slate-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-3 text-slate-900">Salt Harvest</td>
                  <td className="p-3 text-right text-slate-900">{deal.quantity} tons</td>
                  <td className="p-3 text-right text-slate-900">LKR {deal.pricePerTon.toLocaleString()}</td>
                  <td className="p-3 text-right font-semibold text-slate-900">
                    LKR {deal.totalPrice.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold text-slate-900">LKR {deal.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Tax (0%)</span>
                <span className="font-semibold text-slate-900">LKR 0</span>
              </div>
              <div className="flex justify-between py-3 bg-emerald-50 px-3 rounded-lg mt-2">
                <span className="font-bold text-slate-900 text-lg">Total</span>
                <span className="font-bold text-emerald-600 text-xl">
                  LKR {deal.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-slate-200 pt-6 mt-8">
            <div className="text-center text-sm text-slate-600">
              <p className="mb-1">Thank you for your business!</p>
              <p className="text-xs text-slate-500">
                This is a system-generated invoice from BrineX platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
