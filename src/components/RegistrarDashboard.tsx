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

interface RegistrarDashboardProps {
  onLogout: () => void;
}

export default function RegistrarDashboard({ onLogout }: RegistrarDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
  const [assessDialogOpen, setAssessDialogOpen] = useState(false);
  const [selectedEnrollmentForAssess, setSelectedEnrollmentForAssess] = useState<any>(null);
  const [assessmentForm, setAssessmentForm] = useState({
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
    setAssessmentForm({ tuition: 0, registration: 0, library: 0, lab: 0, id_fee: 0, others: 0, remarks: '' });
    setAssessDialogOpen(true);
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
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
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
            <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Registrar Dashboard
            </h1>
            <p className="text-slate-600">Student records and academic documentation</p>
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
    </div>
  );
}
