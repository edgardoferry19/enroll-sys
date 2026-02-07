import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  LogOut, 
  LayoutDashboard, 
  FileText,
  Users,
  ClipboardCheck,
  Award,
  Printer,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { registrarService } from '../services/registrar.service';
import { adminService } from '../services/admin.service';
import { gradesService } from '../services/grades.service';
import { maintenanceService } from '../services/maintenance.service';

interface RegistrarDashboardProps {
  onLogout: () => void;
}

export default function RegistrarDashboard({ onLogout }: RegistrarDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
  const [pendingSubjectAssessments, setPendingSubjectAssessments] = useState<any[]>([]);
  const [assessDialogOpen, setAssessDialogOpen] = useState(false);
  const [subjectAssessDialogOpen, setSubjectAssessDialogOpen] = useState(false);
  const [selectedEnrollmentForAssess, setSelectedEnrollmentForAssess] = useState<any>(null);
  const [selectedSubjectAssessment, setSelectedSubjectAssessment] = useState<any>(null);
  const [subjectAssessmentDetails, setSubjectAssessmentDetails] = useState<any>(null);
  const [assessmentForm, setAssessmentForm] = useState({
    tuition: 0,
    registration: 0,
    library: 0,
    lab: 0,
    id_fee: 0,
    others: 0,
    remarks: ''
  });
  const [subjectAssessmentForm, setSubjectAssessmentForm] = useState({
    tuition: 0,
    registration: 0,
    library: 0,
    lab: 0,
    id_fee: 0,
    others: 0,
    remarks: ''
  });
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [corRequests, setCorRequests] = useState<any[]>([]);
  const [clearanceRequests, setClearanceRequests] = useState<any[]>([]);
  const [gradeSubmissions, setGradeSubmissions] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollmentReport, setEnrollmentReport] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignForm, setAssignForm] = useState<{ enrollmentId: number | null; sectionId: string }>({ enrollmentId: null, sectionId: '' });
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [viewStudentOpen, setViewStudentOpen] = useState(false);
  const [editStudentForm, setEditStudentForm] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeSection === 'Dashboard') {
        const statsResponse = await registrarService.getDashboardStats();
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        }
        const reportResp = await registrarService.getEnrollmentReport();
        if (reportResp.success) {
          setEnrollmentReport(reportResp.data);
        }
        // Fetch recent CORs and clearances for dashboard
        const corsResponse = await registrarService.getAllCORs({ status: 'Pending' });
        if (corsResponse.success) {
          setCorRequests(corsResponse.data?.slice(0, 5) || []);
        }
        const clearancesResponse = await registrarService.getAllClearances({ status: 'Pending' });
        if (clearancesResponse.success) {
          setClearanceRequests(clearancesResponse.data?.slice(0, 5) || []);
        }
      } else if (activeSection === 'Student Records') {
        const studentsResponse = await adminService.getAllStudents();
        if (studentsResponse.success) {
          setStudentRecords(studentsResponse.data || []);
        }
      } else if (activeSection === 'COR Management') {
        const corsResponse = await registrarService.getAllCORs();
        if (corsResponse.success) {
          setCorRequests(corsResponse.data || []);
        }
      } else if (activeSection === 'Clearances') {
        const clearancesResponse = await registrarService.getAllClearances();
        if (clearancesResponse.success) {
          setClearanceRequests(clearancesResponse.data || []);
        }
      } else if (activeSection === 'Grades Management') {
        // For now, we'll show placeholder. In a real system, this would fetch from enrollment_subjects
        setGradeSubmissions([]);
        } else if (activeSection === 'Pending Enrollments') {
          // Fetch enrollments in 'Pending Assessment' status
          const pendingResp = await adminService.getAllEnrollments({ status: 'Pending Assessment' });
          if (pendingResp) {
            const list = pendingResp.data || pendingResp || [];
            setPendingEnrollments(list);
          }
          const sectionsResp = await maintenanceService.getAllSections();
          if (sectionsResp.success) {
            setSections(sectionsResp.data || []);
          }
      } else if (activeSection === 'Subject Assessments') {
        // Fetch enrollments pending registrar subject assessment
        const resp = await registrarService.getPendingSubjectAssessments();
        if (resp.success) {
          setPendingSubjectAssessments(resp.data || []);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCOR = async (enrollmentId: number) => {
    try {
      setError('');
      await registrarService.generateCOR(enrollmentId);
      fetchData();
      alert('COR generated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate COR');
    }
  };

  const openAssessDialog = (enrollment: any) => {
    setSelectedEnrollmentForAssess(enrollment);
    setAssessmentForm({ tuition: 14000, registration: 1500, library: 500, lab: 2000, id_fee: 200, others: 300, remarks: '' });
    setAssessDialogOpen(true);
  };

  const openSubjectAssessDialog = async (enrollment: any) => {
    setSelectedSubjectAssessment(enrollment);
    try {
      const resp = await registrarService.getEnrollmentAssessmentDetails(enrollment.id);
      if (resp.success) {
        setSubjectAssessmentDetails(resp.data);
        // Pre-calculate tuition based on units (700 per unit)
        const totalUnits = resp.data.subjects?.reduce((sum: number, s: any) => sum + (s.units || 0), 0) || 0;
        setSubjectAssessmentForm({
          tuition: 14000,
          registration: 1500,
          library: 500,
          lab: 2000,
          id_fee: 200,
          others: 300,
          remarks: ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch assessment details:', err);
    }
    setSubjectAssessDialogOpen(true);
  };

  const handleAssignSection = async () => {
    if (!assignForm.enrollmentId || !assignForm.sectionId) return;
    try {
      setLoading(true);
      await registrarService.assignSection(assignForm.enrollmentId, Number(assignForm.sectionId));
      setAssignDialogOpen(false);
      setAssignForm({ enrollmentId: null, sectionId: '' });
      await fetchData();
      alert('Section assigned successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to assign section');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubjectAssessment = async () => {
    if (!selectedSubjectAssessment) return;
    try {
      setLoading(true);
      await registrarService.approveSubjectAssessment(selectedSubjectAssessment.id, subjectAssessmentForm);
      setSubjectAssessDialogOpen(false);
      alert('Subject assessment approved. Forwarded to Dean for approval.');
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to approve subject assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessEnrollment = async () => {
    if (!selectedEnrollmentForAssess) return;
    try {
      setLoading(true);
      await registrarService.assessEnrollment(selectedEnrollmentForAssess.id, assessmentForm);
      setAssessDialogOpen(false);
      alert('Enrollment assessed successfully');
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to assess enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCOR = async (corId: number) => {
    try {
      setError('');
      await registrarService.approveCOR(corId);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve COR');
    }
  };

  const handleResolveClearance = async (clearanceId: number) => {
    try {
      setError('');
      await registrarService.resolveClearance(clearanceId);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve clearance');
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

  const openRecord = (student: any) => {
    setSelectedRecord(student);
    setEditStudentForm({
      first_name: student.first_name,
      middle_name: student.middle_name,
      last_name: student.last_name,
      course: student.course,
      year_level: student.year_level,
      status: student.status,
      clearance_status: student.clearance_status,
      contact_number: student.contact_number,
      address: student.address
    });
    setViewStudentOpen(true);
  };

  const handleUpdateStudentRecord = async () => {
    if (!selectedRecord) return;
    try {
      setLoading(true);
      await adminService.updateStudent(selectedRecord.id, editStudentForm);
      setViewStudentOpen(false);
      await fetchData();
      alert('Student record updated');
    } catch (err: any) {
      setError(err.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardStats ? [
    { 
      label: 'Total Records', 
      value: dashboardStats.totalRecords?.toString() || '0', 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      change: ''
    },
    { 
      label: 'Pending Grades', 
      value: dashboardStats.pendingGrades?.toString() || '0', 
      icon: ClipboardCheck, 
      color: 'from-orange-500 to-orange-600',
      change: ''
    },
    { 
      label: 'COR Requests', 
      value: dashboardStats.corRequests?.toString() || '0', 
      icon: Award, 
      color: 'from-green-500 to-green-600',
      change: ''
    },
    { 
      label: 'Clearances', 
      value: dashboardStats.clearances?.toString() || '0', 
      icon: CheckCircle, 
      color: 'from-purple-500 to-purple-600',
      change: ''
    },
  ] : [];

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {stat.change && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <h3 className="text-3xl mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Enrollment Analytics */}
        {enrollmentReport && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-slate-900">Enrollment Totals</h3>
                <p className="text-sm text-slate-500">Per semester and pending pipeline</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                  <span className="text-sm text-slate-600">Pending Enrollments</span>
                  <span className="font-semibold text-orange-600">{enrollmentReport.pending}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 mb-2">Per Semester</p>
                  <div className="space-y-1">
                    {enrollmentReport.perSemester?.map((row: any) => (
                      <div key={row.period} className="flex justify-between text-sm">
                        <span className="text-slate-600">{row.period}</span>
                        <span className="font-semibold">{row.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-lg">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-slate-900">Students per Section</h3>
                <p className="text-sm text-slate-500">Helps balance assignments</p>
              </div>
              <div className="p-4 space-y-2 max-h-[320px] overflow-y-auto">
                {enrollmentReport.perSection?.map((row: any) => (
                  <div key={`${row.section_code}-${row.section_name}`} className="flex justify-between text-sm border-b py-1">
                    <span className="text-slate-600">{row.section_code} • {row.section_name}</span>
                    <span className="font-semibold">{row.total}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent COR Requests */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h3 className="text-white">Recent COR Requests</h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {corRequests.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No COR requests</p>
                ) : (
                  <div className="space-y-3">
                    {corRequests.map((request) => (
                      <div key={request.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm text-slate-900">{request.student_name}</p>
                            <p className="text-xs text-slate-500">{request.student_id} • {request.course}</p>
                          </div>
                          <Badge className={request.status === 'Approved' || request.status === 'Generated' ? 'bg-green-100 text-green-700 border-0 text-xs' : 'bg-orange-100 text-orange-700 border-0 text-xs'}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{request.semester}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(request.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Clearance Requests */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-white">Pending Clearances</h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {clearanceRequests.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No pending clearances</p>
                ) : (
                  <div className="space-y-3">
                    {clearanceRequests.map((clearance) => (
                      <div key={clearance.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm text-slate-900">{clearance.student_name}</p>
                            <p className="text-xs text-slate-500">{clearance.student_id}</p>
                            <p className="text-xs text-slate-600 mt-1">{clearance.clearance_type}</p>
                            {clearance.issue_description && (
                              <p className="text-xs text-orange-600 mt-1">{clearance.issue_description}</p>
                            )}
                          </div>
                          <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                            {clearance.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(clearance.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </>
    );
  };

  const renderStudentRecordsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    const filteredRecords = studentRecords.filter((student) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        student.student_id?.toLowerCase().includes(search) ||
        student.first_name?.toLowerCase().includes(search) ||
        student.last_name?.toLowerCase().includes(search) ||
        student.course?.toLowerCase().includes(search)
      );
    });

    return (
      <div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search student records..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            {filteredRecords.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No student records found</p>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{student.first_name} {student.last_name}</h4>
                        <p className="text-sm text-slate-500">{student.student_id} • {student.course} • Year {student.year_level}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={student.clearance_status === 'Clear' ? 'bg-green-100 text-green-700 border-0' : 'bg-orange-100 text-orange-700 border-0'}>
                            {student.clearance_status || 'Clear'}
                          </Badge>
                          <Badge variant="secondary">{student.status || 'Active'}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openRecord(student)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View / Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderGradesManagementContent = () => (
    <div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending Submissions</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="finalized">Finalized</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {gradeSubmissions.filter(g => g.status === 'Pending').map((submission) => (
                  <div key={submission.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{submission.subject}</h4>
                        <p className="text-sm text-slate-600">{submission.faculty}</p>
                        <p className="text-sm text-slate-500 mt-1">{submission.section} • {submission.students} students</p>
                        <p className="text-xs text-red-600 mt-2">{submission.date}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-700 border-0">
                        {submission.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                      Send Reminder
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="submitted" className="mt-6">
              <div className="space-y-4">
                {gradeSubmissions.filter(g => g.status === 'Submitted').map((submission) => (
                  <div key={submission.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{submission.subject}</h4>
                        <p className="text-sm text-slate-600">{submission.faculty}</p>
                        <p className="text-sm text-slate-500 mt-1">{submission.section} • {submission.students} students</p>
                        <p className="text-xs text-slate-400 mt-2">{submission.date}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0">
                        {submission.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        Approve & Finalize
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="finalized" className="mt-6">
              <p className="text-center text-slate-500 py-8">No finalized grades for this period</p>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );

  const renderCORManagementContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            {corRequests.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No COR requests found</p>
            ) : (
              <div className="space-y-4">
                {corRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{request.student_name}</h4>
                        <p className="text-sm text-slate-500">{request.cor_number || `COR-${request.id}`} • {request.student_id}</p>
                        <p className="text-sm text-slate-600 mt-2">{request.course} • {request.semester}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(request.created_at)}</p>
                      </div>
                      <Badge className={request.status === 'Approved' || request.status === 'Generated' ? 'bg-green-100 text-green-700 border-0' : 'bg-orange-100 text-orange-700 border-0'}>
                        {request.status}
                      </Badge>
                    </div>
                    {request.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-green-600 to-green-700"
                          onClick={() => handleGenerateCOR(request.enrollment_id)}
                        >
                          Generate COR
                        </Button>
                      </div>
                    )}
                    {(request.status === 'Generated' || request.status === 'Approved') && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproveCOR(request.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderClearanceContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <p className="text-slate-600 mb-6">Manage student clearances and requirements.</p>
            {clearanceRequests.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No clearance requests found</p>
            ) : (
              <div className="space-y-4">
                {clearanceRequests.map((clearance) => (
                  <div key={clearance.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{clearance.student_name}</h4>
                        <p className="text-sm text-slate-500">ID: {clearance.id} • {clearance.student_id}</p>
                        <div className="mt-2">
                          <Badge variant="secondary">{clearance.clearance_type}</Badge>
                        </div>
                        {clearance.issue_description && (
                          <p className="text-sm text-orange-700 mt-2">Issue: {clearance.issue_description}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(clearance.created_at)}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 border-0">
                        {clearance.status}
                      </Badge>
                    </div>
                    {clearance.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-green-600 to-green-700"
                          onClick={() => handleResolveClearance(clearance.id)}
                        >
                          Mark Resolved
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderSubjectAssessmentsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div>
        <Card className="border-0 shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-lg">
            <h3 className="text-white font-medium">Pending Subject Assessments</h3>
            <p className="text-blue-100 text-sm">Review subject selection and set fees before forwarding to Dean</p>
          </div>
          <div className="p-6">
            {pendingSubjectAssessments.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No enrollments pending subject assessment</p>
            ) : (
              <div className="space-y-4">
                {pendingSubjectAssessments.map((e) => (
                  <div key={e.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{e.student_name}</h4>
                        <p className="text-sm text-slate-500">
                          {e.student_id} • {e.course} • Year {e.year_level}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {e.school_year} • {e.semester} Semester
                        </p>
                        <p className="text-sm text-slate-600">
                          Subjects: {e.subject_count} • Units: {e.total_units} • Amount: ₱{e.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Submitted {formatTimeAgo(e.updated_at)}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">For Registrar Assessment</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => openSubjectAssessDialog(e)}>
                        Review & Assess
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderPendingEnrollmentsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div>
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            {pendingEnrollments.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No pending enrollments</p>
            ) : (
              <div className="space-y-4">
                {pendingEnrollments.map((e) => (
                  <div key={e.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{e.student?.first_name} {e.student?.last_name}</h4>
                        <p className="text-sm text-slate-500">Enrollment #{e.id} • {e.school_year} • {e.semester}</p>
                        <p className="text-sm text-slate-600 mt-2">Status: {e.status}</p>
                        <p className="text-xs text-slate-400 mt-1">Submitted {formatTimeAgo(e.created_at)}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">{e.status}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-700" onClick={() => openAssessDialog(e)}>
                        Assess
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleGenerateCOR(e.id)}>
                        Generate COR
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setAssignForm({ enrollmentId: e.id, sectionId: '' });
                          setAssignDialogOpen(true);
                        }}
                      >
                        Assign Section
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Subject Assessments', icon: ClipboardCheck },
    { name: 'Student Records', icon: Users },
    { name: 'Grades Management', icon: ClipboardCheck },
    { name: 'COR Management', icon: Award },
    { name: 'Pending Enrollments', icon: FileText },
    { name: 'Clearances', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl mb-1">Registrar Dashboard</h1>
            <p className="text-sm text-slate-600">Student records and academic documentation</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-900">Registrar Ana Garcia</p>
                <p className="text-xs text-slate-500">Records Management</p>
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
            {activeSection === 'Subject Assessments' && renderSubjectAssessmentsContent()}
            {activeSection === 'Student Records' && renderStudentRecordsContent()}
            {activeSection === 'Grades Management' && renderGradesManagementContent()}
            {activeSection === 'COR Management' && renderCORManagementContent()}
            {activeSection === 'Clearances' && renderClearanceContent()}
            {activeSection === 'Pending Enrollments' && renderPendingEnrollmentsContent()}
          </div>
        </div>
      </div>
      
      {/* Assessment Dialog */}
      <Dialog open={assessDialogOpen} onOpenChange={setAssessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assess Enrollment</DialogTitle>
            <DialogDescription>Enter assessment fees for the selected enrollment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tuition</Label>
                <Input type="number" value={assessmentForm.tuition} onChange={(e) => setAssessmentForm({...assessmentForm, tuition: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Registration</Label>
                <Input type="number" value={assessmentForm.registration} onChange={(e) => setAssessmentForm({...assessmentForm, registration: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Library</Label>
                <Input type="number" value={assessmentForm.library} onChange={(e) => setAssessmentForm({...assessmentForm, library: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Lab</Label>
                <Input type="number" value={assessmentForm.lab} onChange={(e) => setAssessmentForm({...assessmentForm, lab: Number(e.target.value)})} />
              </div>
              <div>
                <Label>ID Fee</Label>
                <Input type="number" value={assessmentForm.id_fee} onChange={(e) => setAssessmentForm({...assessmentForm, id_fee: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Others</Label>
                <Input type="number" value={assessmentForm.others} onChange={(e) => setAssessmentForm({...assessmentForm, others: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <Label>Remarks</Label>
              <Input value={assessmentForm.remarks} onChange={(e) => setAssessmentForm({...assessmentForm, remarks: e.target.value})} />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setAssessDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAssessEnrollment}>Assess</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subject Assessment Dialog */}
      <Dialog open={subjectAssessDialogOpen} onOpenChange={setSubjectAssessDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subject Assessment Review</DialogTitle>
            <DialogDescription>Review subjects and set assessment fees before forwarding to Dean</DialogDescription>
          </DialogHeader>
          {selectedSubjectAssessment && (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium">{selectedSubjectAssessment.student_name}</p>
                <p className="text-sm text-slate-500">
                  {selectedSubjectAssessment.student_id} • {selectedSubjectAssessment.course} • Year {selectedSubjectAssessment.year_level}
                </p>
                <p className="text-sm text-slate-600">
                  {selectedSubjectAssessment.school_year} • {selectedSubjectAssessment.semester} Semester
                </p>
              </div>

              {/* Subjects List */}
              {subjectAssessmentDetails?.subjects && (
                <div>
                  <h4 className="font-medium mb-2">Selected Subjects</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Code</th>
                          <th className="px-3 py-2 text-left">Subject</th>
                          <th className="px-3 py-2 text-center">Units</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectAssessmentDetails.subjects.map((s: any) => (
                          <tr key={s.id} className="border-t">
                            <td className="px-3 py-2">{s.subject_code}</td>
                            <td className="px-3 py-2">{s.subject_name}</td>
                            <td className="px-3 py-2 text-center">{s.units}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 font-medium">
                        <tr className="border-t">
                          <td className="px-3 py-2" colSpan={2}>Total Units</td>
                          <td className="px-3 py-2 text-center">
                            {subjectAssessmentDetails.subjects.reduce((sum: number, s: any) => sum + (s.units || 0), 0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Fee Breakdown */}
              <div>
                <h4 className="font-medium mb-2">Assessment Fees</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tuition (₱700/unit)</Label>
                    <Input type="number" value={subjectAssessmentForm.tuition} onChange={(e) => setSubjectAssessmentForm({...subjectAssessmentForm, tuition: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Registration</Label>
                    <Input type="number" value={subjectAssessmentForm.registration} onChange={(e) => setSubjectAssessmentForm({...subjectAssessmentForm, registration: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Library</Label>
                    <Input type="number" value={subjectAssessmentForm.library} onChange={(e) => setSubjectAssessmentForm({...subjectAssessmentForm, library: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Lab</Label>
                    <Input type="number" value={subjectAssessmentForm.lab} onChange={(e) => setSubjectAssessmentForm({...subjectAssessmentForm, lab: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>ID Fee</Label>
                    <Input type="number" value={subjectAssessmentForm.id_fee} onChange={(e) => setSubjectAssessmentForm({...subjectAssessmentForm, id_fee: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Others</Label>
                    <Input type="number" value={subjectAssessmentForm.others} onChange={(e) => setSubjectAssessmentForm({...subjectAssessmentForm, others: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">
                    Total Amount: ₱{(
                      subjectAssessmentForm.tuition +
                      subjectAssessmentForm.registration +
                      subjectAssessmentForm.library +
                      subjectAssessmentForm.lab +
                      subjectAssessmentForm.id_fee +
                      subjectAssessmentForm.others
                    ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div>
                <Label>Remarks</Label>
                <Input value={subjectAssessmentForm.remarks} onChange={(e) => setSubjectAssessmentForm({...subjectAssessmentForm, remarks: e.target.value})} placeholder="Optional remarks..." />
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => setSubjectAssessDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleApproveSubjectAssessment} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Approve & Forward to Dean
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Section Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Section</DialogTitle>
            <DialogDescription>Select a section for this enrollment</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Section</Label>
              <Select
                value={assignForm.sectionId}
                onValueChange={(v) => setAssignForm((prev) => ({ ...prev, sectionId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.section_code} • {s.section_name} • {s.course} {s.year_level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignSection} disabled={!assignForm.sectionId}>
                Assign Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Record Dialog */}
      <Dialog open={viewStudentOpen} onOpenChange={setViewStudentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Record</DialogTitle>
            <DialogDescription>View and update basic details.</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input value={editStudentForm.first_name || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={editStudentForm.last_name || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, last_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Course</Label>
                  <Input value={editStudentForm.course || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, course: e.target.value }))} />
                </div>
                <div>
                  <Label>Year Level</Label>
                  <Input type="number" value={editStudentForm.year_level || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, year_level: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editStudentForm.status || 'Active'}
                    onValueChange={(v) => setEditStudentForm((p: any) => ({ ...p, status: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Clearance Status</Label>
                  <Select
                    value={editStudentForm.clearance_status || 'Clear'}
                    onValueChange={(v) => setEditStudentForm((p: any) => ({ ...p, clearance_status: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Clear">Clear</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input value={editStudentForm.contact_number || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, contact_number: e.target.value }))} />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={editStudentForm.address || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setViewStudentOpen(false)}>Close</Button>
                <Button onClick={handleUpdateStudentRecord}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
