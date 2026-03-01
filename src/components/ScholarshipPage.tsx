import React, { useEffect, useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { scholarshipService } from '../services/scholarship.service';
import { authService } from '../services/auth.service';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { DocumentUpload } from './ui/document-upload';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';

const SCHOLAR_TYPES = [
  'Merit Scholarship',
  'Academic Scholarship',
  'Financial Assistance Scholarship',
  'Working Student Scholarship',
  'Partnership Scholarships',
  'Promotional Scholarship Grants'
];

const SCHOLARSHIP_DEFINITIONS: any = {
  'Merit Scholarship': {
    eligibility: `Senior High School graduates with High Honors or Highest Honors. No college credits. Subject to per-term grade revalidation.`,
    coverage: ['Highest Honors — 100%','High Honors — 50%'],
    docs: [
      { key: 'scholarship_application', label: 'Scholarship Application Form' },
      { key: 'form138', label: 'SHS Report Card (Form 138)' },
      { key: 'certificate_honors', label: 'Certificate of Honors / Graduation Ranking' },
      { key: 'good_moral', label: 'Certificate of Good Moral Character' },
      { key: 'birth_certificate', label: 'Birth Certificate' },
      { key: 'id_photos', label: '2 pcs. 2x2 ID Photos', multiple: true }
    ],
    duties: `Complete 50 hours of Student Assistance Work per term and maintain grade requirements based on scholarship level.`
  },
  'Academic Scholarship': {
    eligibility: `Existing students with strong academic performance; renewable every term and subject to revalidation.`,
    coverage: ['GWA 1.25 (no grade < 1.50) — 100%','GWA 1.50 (no grade < 1.75) — 50%','GWA 1.75 (no grade < 2.00) — 20%'],
    docs: [
      { key: 'scholarship_application', label: 'Scholarship Application Form' },
      { key: 'grades', label: 'Copy of Grades / Official TOR' }
    ],
    duties: `Complete 50 hours of Student Assistance Work per term and maintain required academic standing.`
  },
  'Financial Assistance Scholarship': {
    eligibility: `Indigent Senior High School graduates.`,
    coverage: ['50% scholarship'],
    docs: [
      { key: 'scholarship_application', label: 'Scholarship Application Form' },
      { key: 'certificate_indigency', label: 'Certificate of Indigency' },
      { key: 'form138', label: 'SHS Report Card (Form 138)' },
      { key: 'birth_certificate', label: 'Birth Certificate' },
      { key: 'good_moral', label: 'Certificate of Good Moral Character' },
      { key: 'id_photos', label: '2 pcs. 2x2 ID Photos', multiple: true },
      { key: 'income_docs', label: 'Parent/Guardian Income Documents (ITR / Affidavit)' }
    ],
    duties: `No failing grades. Complete 50 hours of Student Assistance Work per term.`
  },
  'Working Student Scholarship': {
    eligibility: `Working students with specified monthly income limits; subject to grade and financial revalidation.`,
    coverage: ['MI ≤ ₱17,500 — 50%','MI ₱20,000–22,499 — 40%','MI ₱22,500–25,000 — 30%'],
    docs: [
      { key: 'scholarship_application', label: 'Scholarship Application Form' },
      { key: 'form138_or_tor', label: 'SHS Report Card or TOR / Latest Grades' },
      { key: 'employment_certificate', label: 'Certificate of Employment (per term)' },
      { key: 'id_photos', label: '2 pcs. 2x2 ID Photos', multiple: true }
    ],
    duties: `Complete 50 hours of Student Assistance Work per term. Maximum residency: 7 years and 1 term.`,
    extraFields: [
      { key: 'monthly_income', label: 'Monthly Income (PHP)', type: 'number' },
      { key: 'employer', label: 'Employer / Company' },
      { key: 'employment_period', label: 'Employment Period' }
    ]
  },
  'Partnership Scholarships': {
    eligibility: `Personnel or dependents of AFP/NBI/PNP or endorsed LGU constituents under MOUs/MOAs.`,
    coverage: ['AFP/NBI/PNP — per MOU','LGU — 50%'],
    docs: [
      { key: 'scholarship_application', label: 'Scholarship Application Form' },
      { key: 'form138_or_tor', label: 'SHS Report Card or TOR' },
      { key: 'id_photos', label: '2 pcs. 2x2 ID Photos', multiple: true }
    ],
    duties: `No failing grades. Complete program within allotted time.`
  },
  'Promotional Scholarship Grants': {
    eligibility: `Incoming or existing students meeting campaign criteria within promotional period.`,
    coverage: ['Depends on approved grant/campaign'],
    docs: [
      { key: 'scholarship_application', label: 'Scholarship Application Form' },
      { key: 'form138_or_tor', label: 'SHS Report Card or TOR' },
      { key: 'good_moral', label: 'Certificate of Good Moral Character' },
      { key: 'id_photos', label: '2 pcs. 2x2 ID Photos', multiple: true }
    ],
    duties: `Duties depend on terms of the approved campaign or grant.`
  }
};
export default function ScholarshipPage() {
  const [studentId, setStudentId] = useState<string>('');
  const [type, setType] = useState<string>(SCHOLAR_TYPES[0]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | FileList | null>>({});
  const [extraData, setExtraData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    // try to read student id from stored profile
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const u = JSON.parse(userData);
        // prefer student_id from profile (requires profile fetch), fallback to username
        (async () => {
          try {
            const prof = await authService.getProfile();
            const stud = prof.data && prof.data.student;
            const idToUse = (stud && stud.student_id) || u.username || u.id;
            setStudentId(idToUse);
            loadApplications(idToUse);
          } catch (e) {
            const maybeStudentId = (u && (u as any).student_id) || u.username || '';
            setStudentId(maybeStudentId);
            loadApplications(maybeStudentId);
          }
        })();
      }
    } catch (e) {}
  }, []);

  const loadApplications = async (sid?: string) => {
    try {
      const id = sid || studentId;
      if (!id) return;
      const resp = await scholarshipService.listStudentApplications(id);
      setApplications(resp.data || resp || []);
    } catch (err) {
      console.error('Failed to load scholarship applications', err);
    }
  };

  const handleSubmit = async () => {
    if (!studentId) return alert('Student id not found');
    const requiredDocs = SCHOLARSHIP_DEFINITIONS[type]?.docs || [];
    for (const d of requiredDocs) {
      const f = uploadedFiles[d.key];
      if (!f) return alert(`Please attach required document: ${d.label}`);
    }
    try {
      setLoading(true);
      const form = new FormData();
      form.append('scholarship_type', type);
      // append uploaded files (normalize File | FileList | File[])
      for (const key of Object.keys(uploadedFiles)) {
        const f = uploadedFiles[key];
        if (!f) continue;
        const filesArr: File[] = [];
        if (typeof FileList !== 'undefined' && f instanceof FileList) {
          for (let i = 0; i < f.length; i++) {
            const fi = f.item(i);
            if (fi) filesArr.push(fi);
          }
        } else if (Array.isArray(f)) {
          filesArr.push(...(f as File[]));
        } else if ((f as File).name) {
          filesArr.push(f as File);
        }

        for (const file of filesArr) {
          form.append(key, file as Blob);
        }
      }

      // attach extra metadata
      if (Object.keys(extraData).length > 0) {
        form.append('meta', JSON.stringify(extraData));
      }
      const resp = await scholarshipService.submitApplication(studentId, form);
      alert('Application submitted');
      loadApplications(studentId);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Scholarship Application</h2>
          <p className="text-sm text-slate-500">Apply for available scholarships and track your application status.</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Scholarship Type</Label>
            <Select value={type} onValueChange={(v) => setType(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue>{type}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SCHOLAR_TYPES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Student ID</Label>
            <Input value={studentId} readOnly className="mt-2 bg-slate-100" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium">Eligibility</h4>
            <p className="text-xs text-slate-600 mt-1">{SCHOLARSHIP_DEFINITIONS[type]?.eligibility}</p>

            <h4 className="text-sm font-medium mt-3">Coverage</h4>
            <ul className="text-xs text-slate-600 mt-1 list-disc ml-5">
              {(SCHOLARSHIP_DEFINITIONS[type]?.coverage || []).map((c: string) => <li key={c}>{c}</li>)}
            </ul>

            <h4 className="text-sm font-medium mt-3">Duties</h4>
            <p className="text-xs text-slate-600 mt-1">{SCHOLARSHIP_DEFINITIONS[type]?.duties}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium">Required Documents</h4>
            <div className="mt-2 space-y-2">
              {(SCHOLARSHIP_DEFINITIONS[type]?.docs || []).map((d: any) => (
                <DocumentUpload
                  key={d.key}
                  label={d.label}
                  description={d.multiple ? 'You may upload multiple files' : ''}
                  docType={d.key}
                  onFileSelect={(docType: string, file: File | null) => setUploadedFiles(prev => ({ ...prev, [docType]: file }))}
                  selectedFile={uploadedFiles[d.key] as any}
                  acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              ))}

              {/* Render extra fields if any */}
              {(SCHOLARSHIP_DEFINITIONS[type]?.extraFields || []).map((ef: any) => (
                <div key={ef.key} className="mt-2">
                  <Label>{ef.label}</Label>
                  <Input
                    type={ef.type || 'text'}
                    value={extraData[ef.key] || ''}
                    onChange={(e) => setExtraData(prev => ({ ...prev, [ef.key]: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => { setType(SCHOLAR_TYPES[0]); setUploadedFiles({}); setExtraData({}); }}>Reset</Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-indigo-600" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-3">My Applications</h3>
        <div className="space-y-3">
          {applications.length === 0 && <p className="text-sm text-slate-500">No applications yet.</p>}
          {applications.map((a: any) => (
            <div key={a.id} className="p-4 border rounded-md flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">{a.scholarship_type}</div>
                  <Badge variant="outline">{a.status}</Badge>
                </div>
                <div className="text-xs text-slate-500 mt-1">Submitted: {a.created_at}</div>
                <div className="text-xs text-slate-600 mt-1">Duties: {SCHOLARSHIP_DEFINITIONS[a.scholarship_type]?.duties}</div>
                <div className="mt-2 text-sm">
                  {a.files && Object.keys(a.files || {}).map((k) => (
                    <div key={k} className="mb-1">
                      <div className="text-xs text-slate-600">{k}</div>
                      {(a.files[k] || []).map((url: string) => {
                        // ensure absolute backend URL so dev frontend doesn't intercept
                        // API_BASE_URL exported from utils/api
                        // build origin by stripping trailing /api
                        const apiOrigin = ((): string => {
                          try { const m = require('../utils/api'); return (m.API_BASE_URL || '').replace(/\/api\/?$/, ''); } catch { return '' }
                        })();
                        const href = url && url.startsWith('/') ? `${apiOrigin}${url}` : url;
                        return <div key={url}><a href={href} target="_blank" rel="noreferrer" className="text-blue-600">Download</a></div>
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 md:mt-0">
                {a.status === 'Approved' && <div className="text-sm">Coverage: <strong>{a.coverage || '—'}</strong></div>}
                {a.remarks && <div className="text-sm text-slate-600 mt-1">Remarks: {a.remarks}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
