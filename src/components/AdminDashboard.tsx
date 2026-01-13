import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  User, 
  LogOut, 
  LayoutDashboard, 
  ClipboardList, 
  CreditCard, 
  Users, 
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  ChevronDown,
  Eye,
  FileText,
  Plus,
  Trash2,
  Printer,
  UserPlus,
  UserMinus,
  Edit,
  X,
  Check as CheckIcon,
  Loader2
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { transactionService } from '../services/transaction.service';
import { studentService } from '../services/student.service';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [manageOpen, setManageOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'student' | 'transaction'>('student');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [removeStudentOpen, setRemoveStudentOpen] = useState(false);
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [removeTeacherOpen, setRemoveTeacherOpen] = useState(false);
  const [viewGradesOpen, setViewGradesOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [removeSectionOpen, setRemoveSectionOpen] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [removeSubjectOpen, setRemoveSubjectOpen] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('2024-2025');
  const [editGradesOpen, setEditGradesOpen] = useState(false);
  const [updateStudentOpen, setUpdateStudentOpen] = useState(false);
  const [editEnrollmentOpen, setEditEnrollmentOpen] = useState(false);
  const [editTransactionOpen, setEditTransactionOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    type: 'approve-enrollment' | 'reject-enrollment' | 'approve-transaction' | 'deny-transaction' | null;
    item: any;
  }>({ open: false, type: null, item: null });

  // Data state
  const [stats, setStats] = useState<any[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  // Form state for dialogs
  const [newStudentForm, setNewStudentForm] = useState({
    student_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    student_type: 'New',
    course: '',
    year_level: 1,
    email: '',
    contact_number: '',
    address: '',
    birth_date: '',
    gender: ''
  });
  const [selectedStudentToDelete, setSelectedStudentToDelete] = useState<string>('');

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [activeSection]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      if (activeSection === 'Dashboard') {
        const response = await adminService.getDashboardStats();
        const statsData = response.data || response;
        
        // Calculate enrollment counts from stats
        let enrolledCount = 0;
        let pendingCount = 0;
        if (statsData.enrollmentStats && Array.isArray(statsData.enrollmentStats)) {
          const approved = statsData.enrollmentStats.find((s: any) => s.status === 'Approved');
          const pending = statsData.enrollmentStats.find((s: any) => s.status === 'Pending');
          enrolledCount = approved?.count || 0;
          pendingCount = pending?.count || 0;
        }
        
        setStats([
          { 
            label: 'Total Students', 
            value: (statsData.totalStudents || 0).toString(), 
            icon: Users, 
            color: 'from-blue-500 to-blue-600',
            change: '+0%'
          },
          { 
            label: 'Enrolled', 
            value: enrolledCount.toString(), 
            icon: CheckCircle, 
            color: 'from-green-500 to-green-600',
            change: '+0%'
          },
          { 
            label: 'Pending', 
            value: pendingCount.toString(), 
            icon: Clock, 
            color: 'from-orange-500 to-orange-600',
            change: '+0'
          },
          { 
            label: 'Active Courses', 
            value: '0', 
            icon: BookOpen, 
            color: 'from-purple-500 to-purple-600',
            change: '+0'
          },
        ]);

        // Fetch recent enrollments (approved)
        const enrollmentsData = await adminService.getAllEnrollments({ status: 'Approved' });
        const recent = enrollmentsData.data?.slice(0, 10).map((e: any) => ({
          name: `${e.student?.first_name || ''} ${e.student?.last_name || ''}`.trim(),
          course: e.student?.course || 'N/A',
          status: e.status,
          time: formatTimeAgo(e.created_at)
        })) || [];
        setRecentEnrollments(recent);
      }

      // Fetch pending enrollments
      if (activeSection === 'Dashboard' || activeSection === 'Enrollment Request') {
        const pendingData = await adminService.getAllEnrollments({ status: 'Pending' });
        const pending = pendingData.data?.map((e: any) => ({
          id: `#E-${e.id}`,
          enrollmentId: e.id,
          student: `${e.student?.first_name || ''} ${e.student?.last_name || ''}`.trim(),
          course: e.student?.course || 'N/A',
          date: formatDate(e.created_at),
          priority: 'medium',
          type: e.student?.student_type || 'New Student',
          hasDocuments: (e.documents?.length || 0) > 0,
          status: e.status,
          ...e
        })) || [];
        setPendingEnrollments(pending);
      }

      // Fetch transactions
      if (activeSection === 'Dashboard' || activeSection === 'Transactions') {
        const transactionsData = await transactionService.getAllTransactions();
        const txnList = transactionsData.data?.map((t: any) => ({
          id: `TXN-${String(t.id).padStart(4, '0')}`,
          transactionId: t.id,
          student: `${t.enrollment?.student?.first_name || ''} ${t.enrollment?.student?.last_name || ''}`.trim(),
          type: t.transaction_type,
          amount: `₱${parseFloat(t.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          date: formatDate(t.created_at),
          status: t.status,
          hasReceipt: !!t.receipt_path,
          ...t
        })) || [];
        setTransactions(txnList);
      }

      // Fetch students
      if (activeSection === 'Manage Students' || activeSection === 'SHS Grades' || activeSection === 'College Grades') {
        const studentsData = await adminService.getAllStudents();
        const studentList = studentsData.data?.map((s: any) => ({
          id: s.student_id,
          studentId: s.id,
          name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          course: s.course || 'N/A',
          year: s.year_level ? `${s.year_level}${getOrdinalSuffix(s.year_level)} Year` : 'N/A',
          section: s.section || 'N/A',
          corStatus: 'Updated', // These would come from enrollment data
          gradesComplete: true,
          clearanceStatus: 'Clear',
          ...s
        })) || [];
        setStudents(studentList);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      alert(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    if (!date) return 'N/A';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const teachers = [
    { 
      id: 'T-001', 
      name: 'Dr. Roberto Santos', 
      department: 'Computer Science',
      subjects: ['CS101 - Introduction to Programming', 'CS201 - Advanced Programming', 'CS301 - Software Engineering']
    },
    { 
      id: 'T-002', 
      name: 'Prof. Maria Reyes', 
      department: 'Mathematics',
      subjects: ['MATH201 - Calculus I', 'MATH301 - Calculus II']
    },
    { 
      id: 'T-003', 
      name: 'Ms. Jennifer Garcia', 
      department: 'English',
      subjects: ['ENG101 - Technical Writing', 'ENG201 - Professional Communication']
    },
  ];

  const shsStudents = [
    { id: 'SHS-001', name: 'Alice Villanueva', strand: 'STEM', grade: '11', section: 'STEM-11A', gpa: 1.5, grades: [
      { subject: 'General Mathematics', grade: 1.5 },
      { subject: 'Earth Science', grade: 1.75 },
      { subject: 'Physical Science', grade: 1.25 }
    ]},
    { id: 'SHS-002', name: 'Bob Martinez', strand: 'STEM', grade: '12', section: 'STEM-12B', gpa: 1.8, grades: [
      { subject: 'Pre-Calculus', grade: 1.5 },
      { subject: 'Chemistry', grade: 2.0 },
      { subject: 'Physics', grade: 1.75 }
    ]},
    { id: 'SHS-003', name: 'Carol Garcia', strand: 'ABM', grade: '11', section: 'ABM-11A', gpa: 1.7, grades: [
      { subject: 'Business Math', grade: 1.5 },
      { subject: 'Economics', grade: 1.75 },
      { subject: 'Accounting', grade: 1.75 }
    ]},
  ];

  const collegeStudents = [
    { id: '2024-001', name: 'Juan Dela Cruz', course: 'BSIT', year: '2nd Year', gpa: 1.6, grades: [
      { subject: 'CS101 - Introduction to Programming', grade: 1.5 },
      { subject: 'MATH201 - Calculus I', grade: 1.75 },
      { subject: 'ENG101 - Technical Writing', grade: 1.5 }
    ]},
    { id: '2024-002', name: 'Maria Santos', course: 'BSCS', year: '3rd Year', gpa: 1.4, grades: [
      { subject: 'CS201 - Data Structures', grade: 1.25 },
      { subject: 'CS301 - Algorithms', grade: 1.5 },
      { subject: 'MATH301 - Discrete Math', grade: 1.5 }
    ]},
    { id: '2024-003', name: 'Jose Reyes', course: 'BSIT', year: '1st Year', gpa: 1.9, grades: [
      { subject: 'CS100 - Computer Fundamentals', grade: 2.0 },
      { subject: 'MATH101 - College Algebra', grade: 1.75 },
      { subject: 'ENG100 - Communication Skills', grade: 2.0 }
    ]},
  ];

  const sections = [
    { id: 'S-001', name: 'IT-1A', course: 'BSIT', yearLevel: '1st Year', adviser: 'Dr. Roberto Santos' },
    { id: 'S-002', name: 'CS-2B', course: 'BSCS', yearLevel: '2nd Year', adviser: 'Prof. Maria Reyes' },
    { id: 'S-003', name: 'STEM-11A', course: 'STEM', yearLevel: 'Grade 11', adviser: 'Ms. Jennifer Garcia' },
  ];

  const handlePreviewStudent = (pending: any) => {
    setSelectedItem(pending);
    setPreviewType('student');
    setPreviewOpen(true);
  };

  const handlePreviewTransaction = (transaction: any) => {
    setSelectedItem(transaction);
    setPreviewType('transaction');
    setPreviewOpen(true);
  };

  const handleViewGrades = (student: any) => {
    setSelectedStudent(student);
    setViewGradesOpen(true);
  };

  const handleEditGrades = (student: any) => {
    setSelectedStudent(student);
    setEditGradesOpen(true);
  };

  const handleUpdateStudent = (student: any) => {
    setSelectedStudent(student);
    setUpdateStudentOpen(true);
  };

  const handlePrintGrades = () => {
    window.print();
  };

  const handleApproveEnrollment = (enrollment: any) => {
    setConfirmAction({ open: true, type: 'approve-enrollment', item: enrollment });
  };

  const handleRejectEnrollment = (enrollment: any) => {
    setConfirmAction({ open: true, type: 'reject-enrollment', item: enrollment });
  };

  const handleEditEnrollment = (enrollment: any) => {
    setEditingItem(enrollment);
    setEditEnrollmentOpen(true);
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingItem(transaction);
    setEditTransactionOpen(true);
  };

  const handleSaveEnrollmentEdit = async () => {
    if (!editingItem?.enrollmentId) return;
    
    try {
      setLoadingSection('edit-enrollment');
      await adminService.updateEnrollmentStatus(
        editingItem.enrollmentId,
        editingItem.status || 'Pending'
      );
      alert(`Enrollment request updated for ${editingItem.student}`);
      setEditEnrollmentOpen(false);
      setEditingItem(null);
      await fetchDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to update enrollment');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleSaveTransactionEdit = async () => {
    if (!editingItem?.transactionId) return;
    
    try {
      setLoadingSection('edit-transaction');
      await transactionService.updateTransactionStatus(
        editingItem.transactionId,
        editingItem.status || 'Pending'
      );
      alert(`Transaction updated for ${editingItem.student}`);
      setEditTransactionOpen(false);
      setEditingItem(null);
      await fetchDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to update transaction');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleApproveTransaction = (transaction: any) => {
    setConfirmAction({ open: true, type: 'approve-transaction', item: transaction });
  };

  const handleDenyTransaction = (transaction: any) => {
    setConfirmAction({ open: true, type: 'deny-transaction', item: transaction });
  };

  const confirmActionHandler = async () => {
    const { type, item } = confirmAction;
    
    try {
      setLoadingSection(type || '');
      
      switch (type) {
        case 'approve-enrollment':
          await adminService.approveEnrollment(item.enrollmentId);
          alert(`Pre-enrollment approved for ${item.student}. Student can now add subjects.`);
          break;
        case 'reject-enrollment':
          await adminService.rejectEnrollment(item.enrollmentId);
          alert(`Pre-enrollment rejected for ${item.student}.`);
          break;
        case 'approve-transaction':
          await transactionService.updateTransactionStatus(item.transactionId, 'Approved');
          alert(`Transaction ${item.id} approved.`);
          break;
        case 'deny-transaction':
          await transactionService.updateTransactionStatus(item.transactionId, 'Denied');
          alert(`Transaction ${item.id} denied.`);
          break;
      }
      
      setConfirmAction({ open: false, type: null, item: null });
      await fetchDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to process action');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleAddStudent = async () => {
    try {
      setLoadingSection('add-student');
      await adminService.createStudent(newStudentForm);
      alert('Student added successfully');
      setAddStudentOpen(false);
      setNewStudentForm({
        student_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        student_type: 'New',
        course: '',
        year_level: 1,
        email: '',
        contact_number: '',
        address: '',
        birth_date: '',
        gender: ''
      });
      await fetchDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to add student');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudentToDelete) return;
    
    try {
      setLoadingSection('delete-student');
      const student = students.find(s => s.id === selectedStudentToDelete);
      if (student?.studentId) {
        await adminService.deleteStudent(student.studentId);
        alert('Student removed successfully');
        setRemoveStudentOpen(false);
        setSelectedStudentToDelete('');
        await fetchDashboardData();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to remove student');
    } finally {
      setLoadingSection(null);
    }
  };

  const renderDashboardContent = () => (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-6 border-0 shadow-lg bg-white">
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            </Card>
          ))
        ) : (
          stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-3xl mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </Card>
            );
          })
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-white">Recent Enrollments</h3>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : recentEnrollments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No recent enrollments</p>
              ) : (
                <div className="space-y-2">
                  {recentEnrollments.map((enrollment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm shrink-0">
                        {enrollment.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-900 truncate">{enrollment.name}</p>
                        <p className="text-xs text-slate-500">{enrollment.course}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs px-2 py-0">
                        {enrollment.status}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-0.5">{enrollment.time}</p>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Pending Enrollments */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <h3 className="text-white">Pending Enrollments</h3>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : pendingEnrollments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No pending enrollments</p>
              ) : (
                <div className="space-y-2">
                  {pendingEnrollments.map((pending, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm text-slate-900 truncate">{pending.student}</p>
                        {pending.priority === 'high' && (
                          <AlertCircle className="h-3 w-3 text-red-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{pending.id} • {pending.course}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <Button 
                        size="sm" 
                        onClick={() => handlePreviewStudent(pending)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-7 text-xs px-3"
                      >
                        Review
                      </Button>
                      <p className="text-xs text-slate-500 mt-0.5">{pending.date}</p>
                    </div>
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

  const renderEnrollmentRequestsContent = () => (
    <div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <p className="text-slate-600 mb-6">Manage and review all enrollment requests from students.</p>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : pendingEnrollments.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-12">No pending enrollment requests</p>
          ) : (
            <div className="space-y-3">
              {pendingEnrollments.map((pending, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-slate-900">{pending.student}</h4>
                    {!pending.hasDocuments && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Incomplete Docs
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{pending.id} • {pending.course} • {pending.type} • {pending.date}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePreviewStudent(pending)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditEnrollment(pending)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => handleRejectEnrollment(pending)}
                  >
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    onClick={() => handleApproveEnrollment(pending)}
                  >
                    Approve
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

  const renderTransactionsContent = () => (
    <div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <p className="text-slate-600 mb-6">View all enrollment and payment transactions.</p>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-12">No transactions found</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-slate-900">{transaction.student}</h4>
                    {!transaction.hasReceipt && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        No Receipt
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {transaction.id} • {transaction.type} • {transaction.amount} • {transaction.date}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePreviewTransaction(transaction)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditTransaction(transaction)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  {transaction.status === 'Pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 border-red-200 gap-1"
                        onClick={() => handleDenyTransaction(transaction)}
                      >
                        <X className="h-4 w-4" />
                        Deny
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-green-600 to-green-700 gap-1"
                        onClick={() => handleApproveTransaction(transaction)}
                      >
                        <CheckIcon className="h-4 w-4" />
                        Approve
                      </Button>
                    </>
                  )}
                  {transaction.status === 'Approved' && (
                    <Badge className="bg-green-100 text-green-700 border-0">
                      Approved
                    </Badge>
                  )}
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderManageStudentsContent = () => (
    <div>
      <div className="flex items-center justify-end mb-6">
        <div className="flex gap-2">
          <Button 
            onClick={() => setAddStudentOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
          <Button 
            onClick={() => setRemoveStudentOpen(true)}
            variant="outline"
            className="text-red-600 hover:bg-red-50 border-red-200 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Remove Student
          </Button>
        </div>
      </div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-12">No students found</p>
          ) : (
            <div className="space-y-3">
              {students.map((student, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-slate-900">{student.name}</h4>
                    <p className="text-sm text-slate-500">
                      {student.id} • {student.course} • {student.year} • {student.section}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUpdateStudent(student)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Update Status
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge className={student.corStatus === 'Updated' ? 'bg-green-100 text-green-700 border-0' : 'bg-orange-100 text-orange-700 border-0'}>
                    COR: {student.corStatus}
                  </Badge>
                  <Badge className={student.gradesComplete ? 'bg-green-100 text-green-700 border-0' : 'bg-orange-100 text-orange-700 border-0'}>
                    Grades: {student.gradesComplete ? 'Complete' : 'Incomplete'}
                  </Badge>
                  <Badge className={student.clearanceStatus === 'Clear' ? 'bg-green-100 text-green-700 border-0' : 'bg-orange-100 text-orange-700 border-0'}>
                    Clearance: {student.clearanceStatus}
                  </Badge>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderManageTeachersContent = () => (
    <div>
      <div className="flex items-center justify-end mb-6">
        <div className="flex gap-2">
          <Button 
            onClick={() => setAddTeacherOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Teacher
          </Button>
          <Button 
            onClick={() => setRemoveTeacherOpen(true)}
            variant="outline"
            className="text-red-600 hover:bg-red-50 border-red-200 gap-2"
          >
            <UserMinus className="h-4 w-4" />
            Remove Teacher
          </Button>
        </div>
      </div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <div className="space-y-3">
            {teachers.map((teacher, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-slate-900">{teacher.name}</h4>
                    <p className="text-sm text-slate-500">{teacher.id} • {teacher.department}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-600 mb-2">Assigned Subjects:</p>
                  <div className="space-y-1">
                    {teacher.subjects.map((subject, idx) => (
                      <p key={idx} className="text-sm text-slate-700">• {subject}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSHSGradesContent = () => (
    <div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <p className="text-slate-600 mb-6">View and manage SHS student grades.</p>
          <div className="space-y-3">
            {shsStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <h4 className="text-slate-900">{student.name}</h4>
                  <p className="text-sm text-slate-500">
                    {student.id} • {student.strand} • Grade {student.grade} • {student.section}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewGrades(student)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Grades
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditGrades(student)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handlePrintGrades}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderCollegeGradesContent = () => (
    <div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <p className="text-slate-600 mb-6">View and manage college student grades.</p>
          <div className="space-y-3">
            {collegeStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <h4 className="text-slate-900">{student.name}</h4>
                  <p className="text-sm text-slate-500">
                    {student.id} • {student.course} • {student.year}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewGrades(student)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Grades
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditGrades(student)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handlePrintGrades}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSectionsContent = () => (
    <div>
      <div className="flex items-center justify-end mb-6">
        <div className="flex gap-2">
          <Button 
            onClick={() => setAddSectionOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
          <Button 
            onClick={() => setRemoveSectionOpen(true)}
            variant="outline"
            className="text-red-600 hover:bg-red-50 border-red-200 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Remove Section
          </Button>
        </div>
      </div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <h4 className="text-slate-900">{section.name}</h4>
                  <p className="text-sm text-slate-500">
                    {section.course} • {section.yearLevel} • Adviser: {section.adviser}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSubjectsContent = (type: 'SHS' | 'College') => (
    <div>
      <div className="flex items-center justify-end mb-6">
        <div className="flex gap-2">
          <Button 
            onClick={() => setAddSubjectOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
          <Button 
            onClick={() => setRemoveSubjectOpen(true)}
            variant="outline"
            className="text-red-600 hover:bg-red-50 border-red-200 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Remove Subject
          </Button>
        </div>
      </div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <p className="text-slate-600 mb-4">Manage {type} subjects and curriculum.</p>
          <div className="space-y-2">
            {(type === 'SHS' ? [
              { code: 'GEN-MATH', name: 'General Mathematics', units: 3 },
              { code: 'EARTH-SCI', name: 'Earth Science', units: 3 },
              { code: 'PHYSICAL-SCI', name: 'Physical Science', units: 3 },
            ] : [
              { code: 'CS101', name: 'Introduction to Programming', units: 3 },
              { code: 'MATH201', name: 'Calculus I', units: 3 },
              { code: 'ENG101', name: 'Technical Writing', units: 3 },
            ]).map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{subject.code} - {subject.name}</p>
                  <p className="text-xs text-slate-500">{subject.units} units</p>
                </div>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSchoolYearContent = () => (
    <div>
      <Card className="border-0 shadow-lg p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="school-year">Select Active School Year</Label>
            <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
              <SelectTrigger id="school-year" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2022-2023">2022-2023</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2025-2026">2025-2026</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500 mt-2">
              All data displayed will be based on the selected school year: <span className="font-medium">{selectedSchoolYear}</span>
            </p>
          </div>

          <div className="border-t pt-4 mt-6">
            <h4 className="mb-3">School Year Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Current Semester</p>
                <p className="font-medium">1st Semester</p>
              </div>
              <div>
                <p className="text-slate-500">Total Enrolled Students</p>
                <p className="font-medium">1,243</p>
              </div>
              <div>
                <p className="text-slate-500">Active Courses</p>
                <p className="font-medium">42</p>
              </div>
              <div>
                <p className="text-slate-500">Total Teachers</p>
                <p className="font-medium">87</p>
              </div>
            </div>
          </div>

          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 mt-4">
            Update School Year
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-slate-200 shadow-xl flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-slate-900">IC Northgate</h3>
                <p className="text-sm text-slate-500">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setActiveSection('Dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === 'Dashboard' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveSection('Enrollment Request')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === 'Enrollment Request' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="h-5 w-5" />
              Enrollment Requests
            </button>
            
            <button
              onClick={() => setActiveSection('Transactions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === 'Transactions' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              Transactions
            </button>

            <div className="pt-4">
              {/* Manage Collapsible */}
              <Collapsible open={manageOpen} onOpenChange={setManageOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all text-slate-700 hover:bg-slate-100">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span>Manage</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${manageOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 ml-4 space-y-1">
                  <button 
                    onClick={() => setActiveSection('Manage Students')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Students
                  </button>
                  <button 
                    onClick={() => setActiveSection('Manage Teachers')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Teachers
                  </button>
                  <button 
                    onClick={() => setActiveSection('SHS Grades')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    SHS Grades
                  </button>
                  <button 
                    onClick={() => setActiveSection('College Grades')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    College Grades
                  </button>
                </CollapsibleContent>
              </Collapsible>

              {/* Maintenance Collapsible - STEM button removed */}
              <Collapsible open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all text-slate-700 hover:bg-slate-100">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5" />
                    <span>Maintenance</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${maintenanceOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 ml-4 space-y-1">
                  <button 
                    onClick={() => setActiveSection('Sections')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Sections
                  </button>
                  <button 
                    onClick={() => setActiveSection('SHS Subjects')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    SHS Subjects
                  </button>
                  <button 
                    onClick={() => setActiveSection('College Subjects')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    College Subjects
                  </button>
                  <button 
                    onClick={() => setActiveSection('School Year')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    School Year
                  </button>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </nav>

          <div className="p-4 border-t border-slate-200">
            <Button 
              variant="outline" 
              className="w-full justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl mb-2">
                  {activeSection === 'Dashboard' && 'Admin Dashboard'}
                  {activeSection === 'Enrollment Request' && 'Enrollment Requests'}
                  {activeSection === 'Transactions' && 'Transactions'}
                  {activeSection === 'Manage Students' && 'Manage Students'}
                  {activeSection === 'Manage Teachers' && 'Manage Teachers'}
                  {activeSection === 'SHS Grades' && 'SHS Grades'}
                  {activeSection === 'College Grades' && 'College Grades'}
                  {activeSection === 'Sections' && 'Sections'}
                  {activeSection === 'SHS Subjects' && 'SHS Subjects'}
                  {activeSection === 'College Subjects' && 'College Subjects'}
                  {activeSection === 'School Year' && 'School Year'}
                </h1>
                <p className="text-slate-600">Welcome back, Administrator</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-slate-600">Admin User</p>
                  <p className="text-xs text-slate-500">admin@icnorthgate.edu</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Dynamic Content */}
            {activeSection === 'Dashboard' && renderDashboardContent()}
            {activeSection === 'Enrollment Request' && renderEnrollmentRequestsContent()}
            {activeSection === 'Transactions' && renderTransactionsContent()}
            {activeSection === 'Manage Students' && renderManageStudentsContent()}
            {activeSection === 'Manage Teachers' && renderManageTeachersContent()}
            {activeSection === 'SHS Grades' && renderSHSGradesContent()}
            {activeSection === 'College Grades' && renderCollegeGradesContent()}
            {activeSection === 'Sections' && renderSectionsContent()}
            {activeSection === 'SHS Subjects' && renderSubjectsContent('SHS')}
            {activeSection === 'College Subjects' && renderSubjectsContent('College')}
            {activeSection === 'School Year' && renderSchoolYearContent()}
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewType === 'student' ? 'Student Enrollment Preview' : 'Transaction Preview'}
            </DialogTitle>
            <DialogDescription>
              {previewType === 'student' 
                ? 'Review student information and uploaded documents'
                : 'Review transaction details and payment receipt'}
            </DialogDescription>
          </DialogHeader>
          
          {previewType === 'student' && selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Student Name</p>
                  <p className="font-medium">{selectedItem.student}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Student ID</p>
                  <p className="font-medium">{selectedItem.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Course</p>
                  <p className="font-medium">{selectedItem.course}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Student Type</p>
                  <p className="font-medium">{selectedItem.type}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3">Uploaded Documents</h4>
                <div className="space-y-2">
                  {selectedItem.hasDocuments ? (
                    <>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Form 137</span>
                        </div>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Form 138</span>
                        </div>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Birth Certificate</span>
                        </div>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No documents uploaded yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {previewType === 'transaction' && selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Transaction ID</p>
                  <p className="font-medium">{selectedItem.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Student Name</p>
                  <p className="font-medium">{selectedItem.student}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Transaction Type</p>
                  <p className="font-medium">{selectedItem.type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="font-medium">{selectedItem.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium">{selectedItem.date}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge className={`${
                    selectedItem.status === 'Approved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  } border-0`}>
                    {selectedItem.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3">Payment Receipt</h4>
                {selectedItem.hasReceipt ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 mb-3">Receipt uploaded</p>
                    <Button size="sm" variant="outline">View Receipt</Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center bg-orange-50">
                    <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                    <p className="text-sm text-orange-600">No receipt uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Grades Dialog */}
      <Dialog open={viewGradesOpen} onOpenChange={setViewGradesOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Grades</DialogTitle>
            <DialogDescription>
              View detailed grades for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-slate-500">Student Name</p>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Student ID</p>
                  <p className="font-medium">{selectedStudent.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{selectedStudent.course ? 'Course' : 'Strand'}</p>
                  <p className="font-medium">{selectedStudent.course || selectedStudent.strand}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">GPA</p>
                  <p className="font-medium">{selectedStudent.gpa}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-3">Grades</h4>
                <div className="space-y-2">
                  {selectedStudent.grades?.map((grade: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{grade.subject}</span>
                      <Badge className="bg-blue-100 text-blue-700 border-0">
                        {grade.grade}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Grades Dialog */}
      <Dialog open={editGradesOpen} onOpenChange={setEditGradesOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Grades & Subjects</DialogTitle>
            <DialogDescription>
              Edit grades and enrolled subjects for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-slate-500">Student Name</p>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Student ID</p>
                  <p className="font-medium">{selectedStudent.id}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-3">Edit Grades</h4>
                <div className="space-y-3">
                  {selectedStudent.grades?.map((grade: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input 
                        defaultValue={grade.subject} 
                        className="flex-1"
                        placeholder="Subject name"
                      />
                      <Input 
                        defaultValue={grade.grade} 
                        className="w-24"
                        placeholder="Grade"
                        type="number"
                        step="0.25"
                        min="1"
                        max="5"
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="mt-3 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Subject
                </Button>
              </div>

              <div className="flex gap-2 justify-end border-t pt-4">
                <Button variant="outline" onClick={() => setEditGradesOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Student Status Dialog */}
      <Dialog open={updateStudentOpen} onOpenChange={setUpdateStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Student Status</DialogTitle>
            <DialogDescription>
              Update COR status, grades completion, and clearance for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cor-status">COR Status</Label>
                <Select defaultValue={selectedStudent.corStatus}>
                  <SelectTrigger id="cor-status" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Updated">Updated</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Not Submitted">Not Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="grades-complete">Grades Status</Label>
                <Select defaultValue={selectedStudent.gradesComplete ? 'Complete' : 'Incomplete'}>
                  <SelectTrigger id="grades-complete" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Incomplete">Incomplete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="clearance-status">Clearance Status</Label>
                <Select defaultValue={selectedStudent.clearanceStatus}>
                  <SelectTrigger id="clearance-status" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clear">Clear</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="With Issues">With Issues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end border-t pt-4">
                <Button variant="outline" onClick={() => setUpdateStudentOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Other dialogs continue from previous implementation... */}
      {/* Add Section Dialog */}
      <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Create a new section for students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-name">Section Name</Label>
              <Input id="section-name" placeholder="e.g., IT-1A" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="section-course">Course/Program</Label>
              <Input id="section-course" placeholder="e.g., BSIT" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="section-year">Year Level</Label>
              <Input id="section-year" placeholder="e.g., 1st Year" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="section-adviser">Adviser (Optional)</Label>
              <Select>
                <SelectTrigger id="section-adviser" className="mt-2">
                  <SelectValue placeholder="Select adviser (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddSectionOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                Add Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subject Dialog */}
      <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>
              Create a new subject in the curriculum
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject-code">Subject Code</Label>
              <Input id="subject-code" placeholder="e.g., CS101" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input id="subject-name" placeholder="e.g., Introduction to Programming" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="subject-units">Units</Label>
              <Input id="subject-units" type="number" placeholder="3" className="mt-2" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddSubjectOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                Add Subject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Section Dialog */}
      <Dialog open={removeSectionOpen} onOpenChange={setRemoveSectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Section</DialogTitle>
            <DialogDescription>
              Select a section to remove
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Section</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose section..." />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name} - {section.course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRemoveSectionOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive">
                Remove Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Subject Dialog */}
      <Dialog open={removeSubjectOpen} onOpenChange={setRemoveSubjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Subject</DialogTitle>
            <DialogDescription>
              Select a subject to remove from the curriculum
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Subject</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose subject..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CS101">CS101 - Introduction to Programming</SelectItem>
                  <SelectItem value="MATH201">MATH201 - Calculus I</SelectItem>
                  <SelectItem value="ENG101">ENG101 - Technical Writing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRemoveSubjectOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive">
                Remove Subject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter student information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-id">Student ID *</Label>
                <Input 
                  id="student-id" 
                  placeholder="e.g., 2024-001" 
                  className="mt-2"
                  value={newStudentForm.student_id}
                  onChange={(e) => setNewStudentForm({...newStudentForm, student_id: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="student-type">Student Type *</Label>
                <Select 
                  value={newStudentForm.student_type}
                  onValueChange={(value) => setNewStudentForm({...newStudentForm, student_type: value})}
                >
                  <SelectTrigger id="student-type" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Transferee">Transferee</SelectItem>
                    <SelectItem value="Returning">Returning</SelectItem>
                    <SelectItem value="Continuing">Continuing</SelectItem>
                    <SelectItem value="Scholar">Scholar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first-name">First Name *</Label>
                <Input 
                  id="first-name" 
                  placeholder="First name" 
                  className="mt-2"
                  value={newStudentForm.first_name}
                  onChange={(e) => setNewStudentForm({...newStudentForm, first_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="middle-name">Middle Name</Label>
                <Input 
                  id="middle-name" 
                  placeholder="Middle name" 
                  className="mt-2"
                  value={newStudentForm.middle_name}
                  onChange={(e) => setNewStudentForm({...newStudentForm, middle_name: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="last-name">Last Name *</Label>
                <Input 
                  id="last-name" 
                  placeholder="Last name" 
                  className="mt-2"
                  value={newStudentForm.last_name}
                  onChange={(e) => setNewStudentForm({...newStudentForm, last_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="suffix">Suffix</Label>
                <Input 
                  id="suffix" 
                  placeholder="Jr., Sr., etc." 
                  className="mt-2"
                  value={newStudentForm.suffix}
                  onChange={(e) => setNewStudentForm({...newStudentForm, suffix: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course">Course</Label>
                <Select 
                  value={newStudentForm.course}
                  onValueChange={(value) => setNewStudentForm({...newStudentForm, course: value})}
                >
                  <SelectTrigger id="course" className="mt-2">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BSIT">BSIT</SelectItem>
                    <SelectItem value="BSCS">BSCS</SelectItem>
                    <SelectItem value="BSCpE">BSCpE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year-level">Year Level</Label>
                <Input 
                  id="year-level" 
                  type="number" 
                  min="1" 
                  max="4"
                  placeholder="1-4" 
                  className="mt-2"
                  value={newStudentForm.year_level}
                  onChange={(e) => setNewStudentForm({...newStudentForm, year_level: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={newStudentForm.gender}
                  onValueChange={(value) => setNewStudentForm({...newStudentForm, gender: value})}
                >
                  <SelectTrigger id="gender" className="mt-2">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="birth-date">Birth Date</Label>
                <Input 
                  id="birth-date" 
                  type="date"
                  className="mt-2"
                  value={newStudentForm.birth_date}
                  onChange={(e) => setNewStudentForm({...newStudentForm, birth_date: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                placeholder="Street address" 
                className="mt-2"
                value={newStudentForm.address}
                onChange={(e) => setNewStudentForm({...newStudentForm, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="email@example.com" 
                  className="mt-2"
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({...newStudentForm, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input 
                  id="contact" 
                  placeholder="09XXXXXXXXX" 
                  className="mt-2"
                  value={newStudentForm.contact_number}
                  onChange={(e) => setNewStudentForm({...newStudentForm, contact_number: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setAddStudentOpen(false)}
                disabled={loadingSection === 'add-student'}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleAddStudent}
                disabled={loadingSection === 'add-student' || !newStudentForm.student_id || !newStudentForm.first_name || !newStudentForm.last_name}
              >
                {loadingSection === 'add-student' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Student'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Student Dialog */}
      <Dialog open={removeStudentOpen} onOpenChange={setRemoveStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Student</DialogTitle>
            <DialogDescription>
              Select a student to remove (Superadmin only)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Student</Label>
              <Select value={selectedStudentToDelete} onValueChange={setSelectedStudentToDelete}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setRemoveStudentOpen(false);
                  setSelectedStudentToDelete('');
                }}
                disabled={loadingSection === 'delete-student'}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteStudent}
                disabled={loadingSection === 'delete-student' || !selectedStudentToDelete}
              >
                {loadingSection === 'delete-student' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove Student'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Teacher Dialog */}
      <Dialog open={addTeacherOpen} onOpenChange={setAddTeacherOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>
              Enter teacher information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teacher-name">Teacher Name</Label>
              <Input id="teacher-name" placeholder="Enter full name" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="teacher-dept">Department</Label>
              <Input id="teacher-dept" placeholder="e.g., Computer Science" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="teacher-subjects">Assigned Subjects</Label>
              <Textarea id="teacher-subjects" placeholder="List subjects (one per line)" className="mt-2" rows={4} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddTeacherOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                Add Teacher
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Teacher Dialog */}
      <Dialog open={removeTeacherOpen} onOpenChange={setRemoveTeacherOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Teacher</DialogTitle>
            <DialogDescription>
              Select a teacher to remove
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Teacher</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose teacher..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRemoveTeacherOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive">
                Remove Teacher
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Enrollment Request Dialog */}
      <Dialog open={editEnrollmentOpen} onOpenChange={setEditEnrollmentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Enrollment Request</DialogTitle>
            <DialogDescription>
              Update enrollment information for {editingItem?.student}
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-student-name">Student Name</Label>
                  <Input 
                    id="edit-student-name" 
                    defaultValue={editingItem.student}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-student-id">Student ID</Label>
                  <Input 
                    id="edit-student-id" 
                    defaultValue={editingItem.id}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-course">Course</Label>
                  <Select defaultValue={editingItem.course}>
                    <SelectTrigger id="edit-course" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BSIT">BSIT</SelectItem>
                      <SelectItem value="BSCS">BSCS</SelectItem>
                      <SelectItem value="BSCpE">BSCpE</SelectItem>
                      <SelectItem value="STEM">STEM</SelectItem>
                      <SelectItem value="ABM">ABM</SelectItem>
                      <SelectItem value="HUMSS">HUMSS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-type">Student Type</Label>
                  <Select defaultValue={editingItem.type}>
                    <SelectTrigger id="edit-type" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New Student">New Student</SelectItem>
                      <SelectItem value="Transferee">Transferee</SelectItem>
                      <SelectItem value="Returning">Returning</SelectItem>
                      <SelectItem value="Continuing">Continuing</SelectItem>
                      <SelectItem value="Scholar">Scholar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">Submission Date</Label>
                  <Input 
                    id="edit-date" 
                    type="date"
                    defaultValue={editingItem.date === 'Today' || editingItem.date === 'Yesterday' ? new Date().toISOString().split('T')[0] : editingItem.date}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-enrollment-status">Status</Label>
                  <Select 
                    value={editingItem.status || 'Pending'}
                    onValueChange={(value) => setEditingItem({...editingItem, status: value})}
                  >
                    <SelectTrigger id="edit-enrollment-status" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Assessed">Assessed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox 
                  id="edit-documents" 
                  defaultChecked={editingItem.hasDocuments}
                />
                <Label htmlFor="edit-documents" className="cursor-pointer">
                  All documents uploaded
                </Label>
              </div>

              <div className="flex gap-2 justify-end border-t pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditEnrollmentOpen(false);
                    setEditingItem(null);
                  }}
                  disabled={loadingSection === 'edit-enrollment'}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={handleSaveEnrollmentEdit}
                  disabled={loadingSection === 'edit-enrollment'}
                >
                  {loadingSection === 'edit-enrollment' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={editTransactionOpen} onOpenChange={setEditTransactionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update transaction information for {editingItem?.student}
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-txn-id">Transaction ID</Label>
                  <Input 
                    id="edit-txn-id" 
                    defaultValue={editingItem.id}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-txn-student">Student Name</Label>
                  <Input 
                    id="edit-txn-student" 
                    defaultValue={editingItem.student}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-txn-type">Transaction Type</Label>
                  <Select defaultValue={editingItem.type}>
                    <SelectTrigger id="edit-txn-type" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tuition Fee">Tuition Fee</SelectItem>
                      <SelectItem value="Enrollment Fee">Enrollment Fee</SelectItem>
                      <SelectItem value="Lab Fee">Lab Fee</SelectItem>
                      <SelectItem value="Miscellaneous Fee">Miscellaneous Fee</SelectItem>
                      <SelectItem value="Library Fee">Library Fee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-txn-amount">Amount</Label>
                  <Input 
                    id="edit-txn-amount" 
                    defaultValue={editingItem.amount}
                    placeholder="₱0.00"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-txn-date">Transaction Date</Label>
                  <Input 
                    id="edit-txn-date" 
                    type="date"
                    defaultValue={editingItem.date ? new Date().toISOString().split('T')[0] : ''}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-txn-status">Status</Label>
                  <Select 
                    value={editingItem.status}
                    onValueChange={(value) => setEditingItem({...editingItem, status: value})}
                  >
                    <SelectTrigger id="edit-txn-status" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox 
                  id="edit-txn-receipt" 
                  defaultChecked={editingItem.hasReceipt}
                />
                <Label htmlFor="edit-txn-receipt" className="cursor-pointer">
                  Receipt uploaded
                </Label>
              </div>

              <div className="flex gap-2 justify-end border-t pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditTransactionOpen(false);
                    setEditingItem(null);
                  }}
                  disabled={loadingSection === 'edit-transaction'}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-green-600 to-green-700"
                  onClick={handleSaveTransactionEdit}
                  disabled={loadingSection === 'edit-transaction'}
                >
                  {loadingSection === 'edit-transaction' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={confirmAction.open} onOpenChange={(open) => !open && setConfirmAction({ open: false, type: null, item: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction.type === 'approve-enrollment' && 'Approve Enrollment Request'}
              {confirmAction.type === 'reject-enrollment' && 'Reject Enrollment Request'}
              {confirmAction.type === 'approve-transaction' && 'Approve Transaction'}
              {confirmAction.type === 'deny-transaction' && 'Deny Transaction'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction.type === 'approve-enrollment' && (
                <>Are you sure you want to approve the enrollment request for <strong>{confirmAction.item?.student}</strong>? The student will be able to add subjects and proceed with enrollment.</>
              )}
              {confirmAction.type === 'reject-enrollment' && (
                <>Are you sure you want to reject the enrollment request for <strong>{confirmAction.item?.student}</strong>? You can change this later using the Edit button.</>
              )}
              {confirmAction.type === 'approve-transaction' && (
                <>Are you sure you want to approve transaction <strong>{confirmAction.item?.id}</strong> for <strong>{confirmAction.item?.student}</strong>?</>
              )}
              {confirmAction.type === 'deny-transaction' && (
                <>Are you sure you want to deny transaction <strong>{confirmAction.item?.id}</strong> for <strong>{confirmAction.item?.student}</strong>? You can change this later using the Edit button.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmActionHandler}
              className={
                confirmAction.type === 'approve-enrollment' || confirmAction.type === 'approve-transaction'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {confirmAction.type === 'approve-enrollment' && 'Approve'}
              {confirmAction.type === 'reject-enrollment' && 'Reject'}
              {confirmAction.type === 'approve-transaction' && 'Approve'}
              {confirmAction.type === 'deny-transaction' && 'Deny'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
