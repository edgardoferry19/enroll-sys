import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { cashierService } from '../services/cashier.service';
import { 
  Loader2, 
  LogOut, 
  DollarSign, 
  LayoutDashboard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import api from '../utils/api';

interface CashierDashboardProps {
  onLogout: () => void;
}

export default function CashierDashboard({ onLogout }: CashierDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ pending: 0, completed: 0, rejected: 0, totalAmount: 0 });
  const [expandedTx, setExpandedTx] = useState<number | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadPending = async () => {
    try {
      setLoading(true);
      setError('');
      const resp = await cashierService.listPending();
      const txList = resp?.data || [];
      setTransactions(txList);
      
      // Calculate stats
      const pending = txList.filter((t: any) => t.status === 'Pending').length;
      const completed = txList.filter((t: any) => t.status === 'Completed').length;
      const rejected = txList.filter((t: any) => t.status === 'Rejected').length;
      const totalAmount = txList.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      setStats({ pending: pending || txList.length, completed, rejected, totalAmount });
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPending(); }, []);

  const handleProcess = async (txId: number, action: 'complete' | 'reject') => {
    try {
      setLoading(true);
      await cashierService.process(txId, action, action === 'reject' ? 'Rejected by cashier' : 'Processed by cashier');
      await loadPending();
    } catch (err: any) {
      setError(err.message || 'Failed to process transaction');
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const handleDownloadReceipt = async (receiptPath: string, filename: string) => {
    try {
      const response = await api.get(`/students/documents/download?path=${encodeURIComponent(receiptPath)}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'receipt');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to download receipt');
    }
  };

  const viewTransactionDetails = (tx: any) => {
    setSelectedTx(tx);
    setDetailsOpen(true);
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Pending Transactions', icon: Clock },
  ];

  const statCards = [
    { label: 'Pending', value: stats.pending.toString(), icon: Clock, color: 'from-orange-500 to-orange-600' },
    { label: 'Completed', value: stats.completed.toString(), icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Rejected', value: stats.rejected.toString(), icon: XCircle, color: 'from-red-500 to-red-600' },
    { label: 'Total Amount', value: `₱${stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'from-purple-500 to-purple-600' },
  ];

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-white font-medium">Recent Pending Transactions</h3>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              {transactions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No pending transactions</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{tx.student_name || 'Unknown Student'}</p>
                          <p className="text-xs text-slate-500">
                            {tx.payment_method || 'N/A'} • Ref: {tx.reference_number || '—'}
                          </p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700 border-0">
                          {tx.status || 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-blue-600">
                          ₱{(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-400">{formatTimeAgo(tx.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </>
    );
  };

  const renderTransactionsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Pending Transactions</h3>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No pending transactions</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="border rounded-lg overflow-hidden">
                  {/* Transaction Header */}
                  <div 
                    className="p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900">{tx.student_name || 'Unknown Student'}</h4>
                            <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                              {tx.status || 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">
                            {tx.course || 'N/A'} • Year {tx.year_level || 'N/A'} • {tx.school_year} {tx.semester} Sem
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-blue-600">
                            ₱{(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-slate-400">{formatTimeAgo(tx.created_at)}</p>
                        </div>
                        {expandedTx === tx.id ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTx === tx.id && (
                    <div className="p-4 border-t bg-white">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Payment Details */}
                        <div>
                          <h5 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Payment Details
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Student ID</span>
                              <span className="font-medium">{tx.student_id || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Payment Method</span>
                              <span className="font-medium">{tx.payment_method || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Reference Number</span>
                              <span className="font-medium">{tx.reference_number || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Transaction Type</span>
                              <span className="font-medium">{tx.transaction_type || 'Enrollment Fee'}</span>
                            </div>
                          </div>
                          
                          {/* Proof of Payment */}
                          <div className="mt-4 pt-4 border-t">
                            <h6 className="text-sm font-medium text-slate-700 mb-2">Proof of Payment</h6>
                            {tx.receipt_path ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDownloadReceipt(tx.receipt_path, tx.receipt_filename || 'receipt')}
                                className="w-full"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Receipt
                              </Button>
                            ) : (
                              <p className="text-sm text-slate-400 italic">No receipt uploaded</p>
                            )}
                          </div>
                        </div>

                        {/* Assessment Breakdown */}
                        <div>
                          <h5 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Assessment Breakdown
                          </h5>
                          <div className="space-y-2 text-sm bg-slate-50 rounded-lg p-3">
                            {tx.tuition > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Tuition Fee</span>
                                <span>₱{tx.tuition?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {tx.registration > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Registration Fee</span>
                                <span>₱{tx.registration?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {tx.library > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Library Fee</span>
                                <span>₱{tx.library?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {tx.lab > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Laboratory Fee</span>
                                <span>₱{tx.lab?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {tx.id_fee > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">ID Fee</span>
                                <span>₱{tx.id_fee?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {tx.others > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Other Fees</span>
                                <span>₱{tx.others?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                              <span>Total Amount</span>
                              <span className="text-blue-600">₱{tx.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                          {tx.enrollment_remarks && (
                            <p className="text-xs text-slate-500 mt-2">
                              <span className="font-medium">Remarks:</span> {tx.enrollment_remarks}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4 pt-4 border-t justify-end">
                        <Button 
                          variant="outline"
                          onClick={() => viewTransactionDetails(tx)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Full Details
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleProcess(tx.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Payment
                        </Button>
                        <Button 
                          onClick={() => handleProcess(tx.id, 'complete')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Payment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Cashier Dashboard
            </h1>
            <p className="text-slate-600">Payment processing and transaction management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Cashier</p>
                <p className="text-xs text-slate-500">Payment Processing</p>
              </div>
            </div>
            <Button 
              onClick={onLogout}
              variant="outline" 
              className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <Card className="border-0 shadow-lg p-4 sticky top-6">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.name}
                        variant={activeSection === item.name ? 'default' : 'ghost'}
                        className={`w-full justify-start gap-3 ${
                          activeSection === item.name
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                            : 'hover:bg-slate-100'
                        }`}
                        onClick={() => setActiveSection(item.name)}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Content Area */}
          <div className="col-span-9">
            {activeSection === 'Dashboard' && renderDashboardContent()}
            {activeSection === 'Pending Transactions' && renderTransactionsContent()}
          </div>
        </div>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Full details for payment verification
            </DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Student Information</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-slate-500">Name:</span> {selectedTx.student_name}</p>
                    <p><span className="text-slate-500">Student ID:</span> {selectedTx.student_id}</p>
                    <p><span className="text-slate-500">Course:</span> {selectedTx.course || 'N/A'}</p>
                    <p><span className="text-slate-500">Year Level:</span> {selectedTx.year_level || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Payment Information</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-slate-500">Method:</span> {selectedTx.payment_method}</p>
                    <p><span className="text-slate-500">Reference:</span> {selectedTx.reference_number || '—'}</p>
                    <p><span className="text-slate-500">Amount:</span> ₱{selectedTx.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p><span className="text-slate-500">Date:</span> {new Date(selectedTx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Assessment Breakdown</h4>
                <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
                  {selectedTx.tuition > 0 && (
                    <div className="flex justify-between">
                      <span>Tuition Fee</span>
                      <span>₱{selectedTx.tuition?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedTx.registration > 0 && (
                    <div className="flex justify-between">
                      <span>Registration Fee</span>
                      <span>₱{selectedTx.registration?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedTx.library > 0 && (
                    <div className="flex justify-between">
                      <span>Library Fee</span>
                      <span>₱{selectedTx.library?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedTx.lab > 0 && (
                    <div className="flex justify-between">
                      <span>Laboratory Fee</span>
                      <span>₱{selectedTx.lab?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedTx.id_fee > 0 && (
                    <div className="flex justify-between">
                      <span>ID Fee</span>
                      <span>₱{selectedTx.id_fee?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedTx.others > 0 && (
                    <div className="flex justify-between">
                      <span>Other Fees</span>
                      <span>₱{selectedTx.others?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span className="text-blue-600">₱{selectedTx.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {selectedTx.receipt_path && (
                <div className="space-y-2">
                  <h4 className="font-medium">Proof of Payment</h4>
                  <Button 
                    variant="outline"
                    onClick={() => handleDownloadReceipt(selectedTx.receipt_path, selectedTx.receipt_filename || 'receipt')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t justify-end">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleProcess(selectedTx.id, 'reject');
                    setDetailsOpen(false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => {
                    handleProcess(selectedTx.id, 'complete');
                    setDetailsOpen(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
