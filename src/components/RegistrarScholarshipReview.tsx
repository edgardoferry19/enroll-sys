import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { scholarshipService } from '../services/scholarship.service';
import { API_BASE_URL } from '../utils/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

export default function RegistrarScholarshipReview() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'approve'|'edit'|null>(null);
  const [modalApp, setModalApp] = useState<any>(null);
  const [selectedCoverage, setSelectedCoverage] = useState<string | undefined>(undefined);
  const [modalRemarks, setModalRemarks] = useState<string>('');

  const SCHOLARSHIP_DEFINITIONS: any = {
    'Merit Scholarship': {
      coverage: ['Highest Honors — 100%','High Honors — 50%'],
      duties: 'Complete 50 hours of Student Assistance Work per term and maintain grade requirements based on scholarship level.'
    },
    'Academic Scholarship': {
      coverage: ['GWA 1.25 — 100%','GWA 1.50 — 50%','GWA 1.75 — 20%'],
      duties: 'Complete 50 hours of Student Assistance Work per term and maintain required academic standing.'
    },
    'Financial Assistance Scholarship': {
      coverage: ['50% scholarship'],
      duties: 'No failing grades. Complete 50 hours of Student Assistance Work per term.'
    },
    'Working Student Scholarship': {
      coverage: ['MI ≤ ₱17,500 — 50%','MI ₱20,000–22,499 — 40%','MI ₱22,500–25,000 — 30%'],
      duties: 'Complete 50 hours of Student Assistance Work per term. Maximum residency: 7 years and 1 term.'
    },
    'Partnership Scholarships': {
      coverage: ['AFP/NBI/PNP — per MOU','LGU — 50%'],
      duties: 'No failing grades. Complete program within allotted time.'
    },
    'Promotional Scholarship Grants': {
      coverage: ['Depends on approved grant/campaign'],
      duties: 'Duties depend on terms of the approved campaign or grant.'
    }
  };

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await scholarshipService.listAllApplications();
      setApps(resp.data || resp || []);
    } catch (err) {
      console.error('Failed to load scholarship applications', err);
    } finally { setLoading(false); }
  };

  const openDecisionModal = (app: any, action: 'approve'|'edit') => {
    setModalApp(app);
    setModalAction(action);
    const defs = SCHOLARSHIP_DEFINITIONS[app.scholarship_type];
    setSelectedCoverage(defs && defs.coverage && defs.coverage[0]);
    setModalRemarks(app.remarks || '');
    setModalOpen(true);
  };

  const decide = async (id: number, action: 'approve' | 'deny' | 'suspend' | 'edit') => {
    try {
      if (action === 'approve' || action === 'edit') {
        await scholarshipService.decideApplication(id, { action, coverage: selectedCoverage, remarks: modalRemarks || undefined });
      } else if (action === 'deny' || action === 'suspend') {
        const remarks = prompt(`Enter ${action === 'deny' ? 'denial' : 'suspension'} remarks (optional):`, '') || undefined;
        await scholarshipService.decideApplication(id, { action, remarks });
      }

      alert('Decision recorded');
      setModalOpen(false);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Scholarship Applications (Registrar)</h2>
      <Card>
        {loading && <div>Loading...</div>}
        {!loading && apps.length === 0 && <div>No applications</div>}
        <div className="space-y-2">
          {apps.map((a) => (
            <div key={a.id} className="p-3 border rounded-md">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{a.scholarship_type}</div>
                  <div className="text-xs">Student: {a.student_number} — {a.first_name} {a.last_name}</div>
                </div>
                <div>Status: <strong>{a.status}</strong></div>
              </div>
              <div className="mt-2">
                {a.files && Object.keys(a.files || {}).map((k) => (
                  <div key={k} className="mb-1">
                    <div className="text-xs text-slate-600">{k}</div>
                    {(a.files[k] || []).map((url: string) => {
                      const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
                      const href = url && url.startsWith('/') ? `${apiOrigin}${url}` : url;
                      return (<div key={url}><a href={href} target="_blank" rel="noreferrer" className="text-blue-600">Download</a></div>);
                    })}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {a.status === 'Denied' ? null : a.status === 'Approved' ? (
                  <>
                    <Button onClick={() => decide(a.id, 'suspend')} className="">Suspend</Button>
                    <Button onClick={() => openDecisionModal(a, 'edit')} className="">Edit Details</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => openDecisionModal(a, 'approve')} className="">Approve</Button>
                    <Button variant="outline" onClick={() => decide(a.id, 'deny')}>Deny</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalAction === 'approve' ? 'Approve Application' : 'Edit Application'}</DialogTitle>
            <DialogDescription>Set coverage and remarks. Duties are shown for reference.</DialogDescription>
          </DialogHeader>
          {modalApp && (
            <div className="space-y-3">
              <div>
                <div className="font-medium">{modalApp.scholarship_type}</div>
                <div className="text-xs text-slate-600 mt-1">Student: {modalApp.student_number} — {modalApp.first_name} {modalApp.last_name}</div>
              </div>
              <div>
                <Label>Duties</Label>
                <div className="text-xs text-slate-600 mt-1">{SCHOLARSHIP_DEFINITIONS[modalApp.scholarship_type]?.duties}</div>
              </div>
              <div>
                <Label>Coverage</Label>
                <div className="mt-2 space-y-1">
                  {(SCHOLARSHIP_DEFINITIONS[modalApp.scholarship_type]?.coverage || []).map((c: string) => (
                    <label key={c} className="flex items-center gap-2">
                      <input type="radio" name="coverage" value={c} checked={selectedCoverage === c} onChange={() => setSelectedCoverage(c)} />
                      <span className="text-sm">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>Remarks</Label>
                <textarea className="w-full border rounded-md p-2 mt-1" value={modalRemarks} onChange={(e) => setModalRemarks(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button onClick={() => decide(modalApp.id, modalAction || 'approve')}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
