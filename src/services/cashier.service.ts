import api, { handleApiError } from '../utils/api';

class CashierService {
  async listPending() {
    try {
      const res = await api.get('/cashier/transactions/pending');
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async listTransactions(filters?: { search?: string; status?: string; school_year?: string; semester?: string; }) {
    try {
      const res = await api.get('/cashier/transactions', { params: filters });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async process(transactionId: number | string, action: 'complete' | 'reject', remarks?: string) {
    try {
      const res = await api.put(`/cashier/transactions/${transactionId}/process`, { action, remarks });
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getSummary() {
    try {
      const res = await api.get('/cashier/reports/summary');
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAnalyticsSnapshot() {
    try {
      const res = await api.get('/analytics/cashier-summary');
      return res.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const cashierService = new CashierService();
