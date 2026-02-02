import api from '../utils/api';

export const listLogs = async () => {
  const res = await api.get('/logs');
  return res.data;
};

export const addLog = async (payload: any) => {
  const res = await api.post('/logs', payload);
  return res.data;
};

export default { listLogs, addLog };
