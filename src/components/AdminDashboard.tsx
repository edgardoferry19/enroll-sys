import React, { useState, useEffect } from 'react';
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
import { facultyService } from '../services/faculty.service';
import { gradesService } from '../services/grades.service';
import { maintenanceService } from '../services/maintenance.service';
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
  const [editTeacherOpen, setEditTeacherOpen] = useState(false);
  const [removeTeacherOpen, setRemoveTeacherOpen] = useState(false);
  const [newTeacherForm, setNewTeacherForm] = useState({
    faculty_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    department: '',
    specialization: '',
    email: '',
    contact_number: ''
  });
  const [editTeacherForm, setEditTeacherForm] = useState({
    faculty_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    department: '',
    specialization: '',
    email: '',
    contact_number: '',
    status: 'Active'
  });
  const [newSectionForm, setNewSectionForm] = useState({
    section_code: '',
    section_name: '',
    course: '',
    year_level: 1,
    school_year: '',
    semester: '1st',
    capacity: 50,
    adviser_id: 0
  });
  const [editSectionForm, setEditSectionForm] = useState({
    section_code: '',
    section_name: '',
    course: '',
    year_level: 1,
    school_year: '',
    semester: '1st',
    capacity: 50,
    adviser_id: 0
  });
  const [newSubjectForm, setNewSubjectForm] = useState({
    subject_code: '',
    subject_name: '',
    description: '',
    units: 3,
    course: '',
    year_level: 1,
    semester: '1st',
    subject_type: 'College' as 'SHS' | 'College'
  });
  const [editSubjectForm, setEditSubjectForm] = useState({
    subject_code: '',
    subject_name: '',
    description: '',
    units: 3,
    course: '',
    year_level: 1,
    semester: '1st',
    subject_type: 'College' as 'SHS' | 'College'
  });
  const [newSchoolYearForm, setNewSchoolYearForm] = useState({
    school_year: '',
    start_date: '',
    end_date: '',
    enrollment_start: '',
    enrollment_end: '',
    is_active: false
  });
  const [editSchoolYearForm, setEditSchoolYearForm] = useState({
    school_year: '',
    start_date: '',
    end_date: '',
    enrollment_start: '',
    enrollment_end: '',
    is_active: false
  });
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [editingSchoolYear, setEditingSchoolYear] = useState<any>(null);
  const [viewGradesOpen, setViewGradesOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [editSectionOpen, setEditSectionOpen] = useState(false);
  const [removeSectionOpen, setRemoveSectionOpen] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [editSubjectOpen, setEditSubjectOpen] = useState(false);
  const [removeSubjectOpen, setRemoveSubjectOpen] = useState(false);
  const [editSchoolYearOpen, setEditSchoolYearOpen] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('2024-2025');
  const [editGradesOpen, setEditGradesOpen] = useState(false);
  const [updateStudentOpen, setUpdateStudentOpen] = useState(false);
  const [editEnrollmentOpen, setEditEnrollmentOpen] = useState(false);
  const [editTransactionOpen, setEditTransactionOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [studentStatusForm, setStudentStatusForm] = useState<any>({
    corStatus: '',
    gradesComplete: false,
    clearanceStatus: ''
  });
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
  const [teachers, setTeachers] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [shsStudents, setShsStudents] = useState<any[]>([]);
  const [collegeStudents, setCollegeStudents] = useState<any[]>([]);
  const [shsGrades, setShsGrades] = useState<any[]>([]);
  const [collegeGrades, setCollegeGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

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
          corStatus: s.cor_status || 'Updated',
          gradesComplete: s.grades_complete || false,
          clearanceStatus: s.clearance_status || 'Clear',
          ...s
        })) || [];
        setStudents(studentList);

        // Separate SHS and College students
        const shs = studentList.filter((s: any) => s.course?.includes('SHS') || s.course?.includes('Senior'));
        const college = studentList.filter((s: any) => !s.course?.includes('SHS') && !s.course?.includes('Senior'));
        setShsStudents(shs);
        setCollegeStudents(college);
      }

      // Fetch teachers
      if (activeSection === 'Manage Teachers') {
        const teachersData = await facultyService.getAllFaculty();
        if (teachersData.success) {
          setTeachers(teachersData.data || []);
        }
      }

      // Fetch sections
      if (activeSection === 'Sections') {
        const sectionsData = await maintenanceService.getAllSections();
        if (sectionsData.success) {
          setSections(sectionsData.data || []);
        }
      }

      // Fetch subjects
      if (activeSection === 'SHS Subjects' || activeSection === 'College Subjects') {
        const subjectType = activeSection === 'SHS Subjects' ? 'SHS' : 'College';
        const subjectsData = await maintenanceService.getAllSubjectsByType({ subject_type: subjectType });
        if (subjectsData.success) {
          setSubjects(subjectsData.data || []);
        }
      }

      // Fetch school years
      if (activeSection === 'School Year') {
        const schoolYearsData = await maintenanceService.getAllSchoolYears();
        if (schoolYearsData.success) {
          setSchoolYears(schoolYearsData.data || []);
        }
      }

      // Fetch grades for SHS
      if (activeSection === 'SHS Grades' && shsStudents.length > 0) {
        // Fetch grades for first student as example - in real app, would fetch all
        if (shsStudents[0]) {
          const gradesData = await gradesService.getStudentGrades(shsStudents[0].id, { subject_type: 'SHS' });
          if (gradesData.success) {
            setShsGrades(gradesData.data || []);
          }
        }
      }

      // Fetch grades for College
      if (activeSection === 'College Grades' && collegeStudents.length > 0) {
        // Fetch grades for first student as example - in real app, would fetch all
        if (collegeStudents[0]) {
          const gradesData = await gradesService.getStudentGrades(collegeStudents[0].id, { subject_type: 'College' });
          if (gradesData.success) {
            setCollegeGrades(gradesData.data || []);
          }
        }
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

  // Placeholder data removed - now using state from backend

  // Placeholder data removed - now using state from backend

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
    setStudentStatusForm({
      corStatus: student.corStatus || 'Updated',
      gradesComplete: student.gradesComplete ? 'Complete' : 'Incomplete',
      clearanceStatus: student.clearanceStatus || 'Clear'
    });
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

  const handleSaveStudentStatus = async () => {
    if (!selectedStudent?.studentId) return;
    
    try {
      setLoadingSection('update-student-status');
      // Only send the status fields we're updating
      await adminService.updateStudent(selectedStudent.studentId, {
        cor_status: studentStatusForm.corStatus,
        grades_complete: studentStatusForm.gradesComplete === 'Complete',
        clearance_status: studentStatusForm.clearanceStatus
      });
      alert(`Student status updated for ${selectedStudent.name}`);
      setUpdateStudentOpen(false);
      // reflect changes locally
      setStudents(prev => prev.map(s => s.studentId === selectedStudent.studentId ? { ...s, corStatus: studentStatusForm.corStatus, gradesComplete: studentStatusForm.gradesComplete === 'Complete', clearanceStatus: studentStatusForm.clearanceStatus } : s));
      setStudentStatusForm({
        corStatus: '',
        gradesComplete: false,
        clearanceStatus: ''
      });
      await fetchDashboardData();
    } catch (error: any) {
      alert(error.message || 'Failed to update student status');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleCreateTeacher = async () => {
    try {
      setError('');
      setLoadingSection('create-teacher');
      await facultyService.createFaculty(newTeacherForm);
      setAddTeacherOpen(false);
      setNewTeacherForm({
        faculty_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        department: '',
        specialization: '',
        email: '',
        contact_number: ''
      });
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to create teacher');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleUpdateTeacher = async () => {
    try {
      setError('');
      setLoadingSection('update-teacher');
      await facultyService.updateFaculty(selectedStudent.id, editTeacherForm);
      setEditTeacherOpen(false);
      setSelectedStudent(null);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to update teacher');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleDeleteTeacher = async () => {
    try {
      setError('');
      setLoadingSection('delete-teacher');
      await facultyService.deleteFaculty(selectedStudent.id);
      setRemoveTeacherOpen(false);
      setSelectedStudent(null);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete teacher');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleCreateSection = async (sectionData: any) => {
    try {
      setError('');
      setLoadingSection('create-section');
      await maintenanceService.createSection(sectionData);
      setAddSectionOpen(false);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to create section');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleCreateSubject = async (subjectData: any) => {
    try {
      setError('');
      setLoadingSection('create-subject');
      await maintenanceService.createSubject(subjectData);
      setAddSubjectOpen(false);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to create subject');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleCreateSchoolYear = async (schoolYearData: any) => {
    try {
      setError('');
      setLoadingSection('create-school-year');
      await maintenanceService.createSchoolYear(schoolYearData);
      setAddSectionOpen(false);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to create school year');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;
    try {
      setError('');
      setLoadingSection('update-section');
      await maintenanceService.updateSection(editingSection.id, editSectionForm);
      setEditSectionOpen(false);
      setEditingSection(null);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to update section');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;
    try {
      setError('');
      setLoadingSection('update-subject');
      await maintenanceService.updateSubject(editingSubject.id, editSubjectForm);
      setEditSubjectOpen(false);
      setEditingSubject(null);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to update subject');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleUpdateSchoolYear = async () => {
    if (!editingSchoolYear) return;
    try {
      setError('');
      setLoadingSection('update-school-year');
      await maintenanceService.updateSchoolYear(editingSchoolYear.id, editSchoolYearForm);
      setEditSchoolYearOpen(false);
      setEditingSchoolYear(null);
      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message || 'Failed to update school year');
    } finally {
      setLoadingSection(null);
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedStudent?.grades) return;
    try {
      setError('');
      setLoadingSection('save-grades');
      // Convert grades array to the format expected by the API
      const gradesToUpdate = selectedStudent.grades.map((g: any, index: number) => ({
        enrollment_subject_id: g.enrollment_subject_id || index + 1,
        grade: g.grade
      }));
      
      // Use bulk update if available
      if (gradesToUpdate.length > 0) {
        await gradesService.bulkUpdateGrades(gradesToUpdate);
        alert('Grades updated successfully');
        setEditGradesOpen(false);
        await fetchDashboardData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update grades');
      alert(err.message || 'Failed to update grades');
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

  const renderManageTeachersContent = () => {
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
        <div className="flex items-center justify-end mb-6">
          <div className="flex gap-2">
            <Button 
              onClick={() => setAddTeacherOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Teacher
            </Button>
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            {teachers.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No teachers found</p>
            ) : (
              <div className="space-y-3">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-slate-900">{teacher.first_name} {teacher.last_name}</h4>
                        <p className="text-sm text-slate-500">{teacher.faculty_id} • {teacher.department || 'N/A'}</p>
                        {teacher.specialization && (
                          <p className="text-sm text-slate-600 mt-1">{teacher.specialization}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedStudent(teacher);
                            setEditTeacherForm({
                              faculty_id: teacher.faculty_id || '',
                              first_name: teacher.first_name || '',
                              middle_name: teacher.middle_name || '',
                              last_name: teacher.last_name || '',
                              suffix: teacher.suffix || '',
                              department: teacher.department || '',
                              specialization: teacher.specialization || '',
                              email: teacher.email || '',
                              contact_number: teacher.contact_number || '',
                              status: teacher.status || 'Active'
                            });
                            setEditTeacherOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedStudent(teacher);
                            setRemoveTeacherOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    {teacher.email && (
                      <p className="text-xs text-slate-500">{teacher.email}</p>
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

  const renderSHSGradesContent = () => {
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
            <p className="text-slate-600 mb-6">View and manage SHS student grades.</p>
            {shsStudents.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No SHS students found</p>
            ) : (
              <div className="space-y-3">
                {shsStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
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
                        onClick={async () => {
                          try {
                            const gradesData = await gradesService.getStudentGrades(student.id, { subject_type: 'SHS' });
                            if (gradesData.success) {
                              setSelectedStudent({ ...student, grades: gradesData.data });
                              setViewGradesOpen(true);
                            }
                          } catch (err: any) {
                            setError(err.message || 'Failed to load grades');
                          }
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Grades
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={async () => {
                          try {
                            const gradesData = await gradesService.getStudentGrades(student.id, { subject_type: 'SHS' });
                            if (gradesData.success) {
                              setSelectedStudent({ ...student, grades: gradesData.data });
                              setEditGradesOpen(true);
                            }
                          } catch (err: any) {
                            setError(err.message || 'Failed to load grades');
                          }
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
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

  const renderCollegeGradesContent = () => {
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
            <p className="text-slate-600 mb-6">View and manage college student grades.</p>
            {collegeStudents.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No college students found</p>
            ) : (
              <div className="space-y-3">
                {collegeStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
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
                        onClick={async () => {
                          try {
                            const gradesData = await gradesService.getStudentGrades(student.id, { subject_type: 'College' });
                            if (gradesData.success) {
                              setSelectedStudent({ ...student, grades: gradesData.data });
                              setViewGradesOpen(true);
                            }
                          } catch (err: any) {
                            setError(err.message || 'Failed to load grades');
                          }
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Grades
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={async () => {
                          try {
                            const gradesData = await gradesService.getStudentGrades(student.id, { subject_type: 'College' });
                            if (gradesData.success) {
                              setSelectedStudent({ ...student, grades: gradesData.data });
                              setEditGradesOpen(true);
                            }
                          } catch (err: any) {
                            setError(err.message || 'Failed to load grades');
                          }
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
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

  const renderSectionsContent = () => {
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
        <div className="flex items-center justify-end mb-6">
          <div className="flex gap-2">
            <Button 
              onClick={() => setAddSectionOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            {sections.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No sections found</p>
            ) : (
              <div className="space-y-3">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex-1">
                      <h4 className="text-slate-900">{section.section_name}</h4>
                      <p className="text-sm text-slate-500">
                        {section.section_code} • {section.course} • Year {section.year_level}
                        {section.adviser_name && ` • Adviser: ${section.adviser_name}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {section.current_enrollment || 0}/{section.capacity || 50} students • {section.school_year} • {section.semester}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingSection(section);
                          setEditSectionForm({
                            section_code: section.section_code || '',
                            section_name: section.section_name || '',
                            course: section.course || '',
                            year_level: section.year_level || 1,
                            school_year: section.school_year || '',
                            semester: section.semester || '1st',
                            capacity: section.capacity || 50,
                            adviser_id: section.adviser_id || 0
                          });
                          setEditSectionOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          try {
                            await maintenanceService.deleteSection(section.id);
                            fetchDashboardData();
                          } catch (err: any) {
                            setError(err.message || 'Failed to delete section');
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
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

  const renderSubjectsContent = (type: 'SHS' | 'College') => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    const filteredSubjects = subjects.filter((s: any) => s.subject_type === type);

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
        <div className="flex items-center justify-end mb-6">
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setSelectedStudent({ subject_type: type });
                setAddSubjectOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Subject
            </Button>
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <p className="text-slate-600 mb-4">Manage {type} subjects and curriculum.</p>
            {filteredSubjects.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No {type} subjects found</p>
            ) : (
              <div className="space-y-2">
                {filteredSubjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">{subject.subject_code} - {subject.subject_name}</p>
                      <p className="text-xs text-slate-500">
                        {subject.units} units
                        {subject.course && ` • ${subject.course}`}
                        {subject.year_level && ` • Year ${subject.year_level}`}
                        {subject.semester && ` • ${subject.semester} Semester`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingSubject(subject);
                          setEditSubjectForm({
                            subject_code: subject.subject_code || '',
                            subject_name: subject.subject_name || '',
                            description: subject.description || '',
                            units: subject.units || 3,
                            course: subject.course || '',
                            year_level: subject.year_level || 1,
                            semester: subject.semester || '1st',
                            subject_type: subject.subject_type || type
                          });
                          setEditSubjectOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          try {
                            await maintenanceService.deleteSubject(subject.id);
                            fetchDashboardData();
                          } catch (err: any) {
                            setError(err.message || 'Failed to delete subject');
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
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

  const renderSchoolYearContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    const activeSchoolYear = schoolYears.find((sy: any) => sy.is_active === 1);

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
        <div className="flex items-center justify-end mb-6">
          <Button 
            onClick={() => setAddSectionOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add School Year
          </Button>
        </div>
        <Card className="border-0 shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="school-year">Active School Year</Label>
              {activeSchoolYear ? (
                <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-900">{activeSchoolYear.school_year}</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {activeSchoolYear.start_date} to {activeSchoolYear.end_date}
                  </p>
                  {activeSchoolYear.enrollment_start && (
                    <p className="text-xs text-blue-600 mt-1">
                      Enrollment: {activeSchoolYear.enrollment_start} to {activeSchoolYear.enrollment_end}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-2">No active school year set</p>
              )}
            </div>

            <div className="border-t pt-4 mt-6">
              <h4 className="mb-3">All School Years</h4>
              {schoolYears.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No school years found</p>
              ) : (
                <div className="space-y-2">
                  {schoolYears.map((sy: any) => (
                    <div key={sy.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sy.school_year}</p>
                        <p className="text-sm text-slate-500">
                          {sy.start_date} to {sy.end_date}
                          {sy.is_active === 1 && (
                            <Badge className="ml-2 bg-green-100 text-green-700 border-0">Active</Badge>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingSchoolYear(sy);
                            setEditSchoolYearForm({
                              school_year: sy.school_year || '',
                              start_date: sy.start_date || '',
                              end_date: sy.end_date || '',
                              enrollment_start: sy.enrollment_start || '',
                              enrollment_end: sy.enrollment_end || '',
                              is_active: sy.is_active === 1
                            });
                            setEditSchoolYearOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={async () => {
                            try {
                              await maintenanceService.deleteSchoolYear(sy.id);
                              fetchDashboardData();
                            } catch (err: any) {
                              setError(err.message || 'Failed to delete school year');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

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
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={handleSaveGrades}
                  disabled={loadingSection === 'save-grades'}
                >
                  {loadingSection === 'save-grades' ? (
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
                <Select value={studentStatusForm.corStatus} onValueChange={(value) => setStudentStatusForm({ ...studentStatusForm, corStatus: value })}>
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
                <Select value={studentStatusForm.gradesComplete} onValueChange={(value) => setStudentStatusForm({ ...studentStatusForm, gradesComplete: value })}>
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
                <Select value={studentStatusForm.clearanceStatus} onValueChange={(value) => setStudentStatusForm({ ...studentStatusForm, clearanceStatus: value })}>
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
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={handleSaveStudentStatus}
                  disabled={loadingSection === 'update-student-status'}
                >
                  {loadingSection === 'update-student-status' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section-code">Section Code</Label>
                <Input 
                  id="section-code" 
                  placeholder="e.g., IT-1A" 
                  className="mt-2"
                  value={newSectionForm.section_code}
                  onChange={(e) => setNewSectionForm({ ...newSectionForm, section_code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="section-name">Section Name</Label>
                <Input 
                  id="section-name" 
                  placeholder="e.g., IT-1A" 
                  className="mt-2"
                  value={newSectionForm.section_name}
                  onChange={(e) => setNewSectionForm({ ...newSectionForm, section_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section-course">Course/Program</Label>
                <Input 
                  id="section-course" 
                  placeholder="e.g., BSIT" 
                  className="mt-2"
                  value={newSectionForm.course}
                  onChange={(e) => setNewSectionForm({ ...newSectionForm, course: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="section-year">Year Level</Label>
                <Input 
                  id="section-year" 
                  type="number"
                  min="1"
                  max="4"
                  placeholder="1" 
                  className="mt-2"
                  value={newSectionForm.year_level}
                  onChange={(e) => setNewSectionForm({ ...newSectionForm, year_level: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section-school-year">School Year</Label>
                <Input 
                  id="section-school-year" 
                  placeholder="2024-2025" 
                  className="mt-2"
                  value={newSectionForm.school_year}
                  onChange={(e) => setNewSectionForm({ ...newSectionForm, school_year: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="section-semester">Semester</Label>
                <Select
                  value={newSectionForm.semester}
                  onValueChange={(value) => setNewSectionForm({ ...newSectionForm, semester: value })}
                >
                  <SelectTrigger id="section-semester" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Semester</SelectItem>
                    <SelectItem value="2nd">2nd Semester</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="section-capacity">Capacity</Label>
              <Input 
                id="section-capacity" 
                type="number"
                placeholder="50" 
                className="mt-2"
                value={newSectionForm.capacity}
                onChange={(e) => setNewSectionForm({ ...newSectionForm, capacity: parseInt(e.target.value) || 50 })}
              />
            </div>
            <div>
              <Label htmlFor="section-adviser">Adviser (Optional)</Label>
              <Select
                value={newSectionForm.adviser_id.toString()}
                onValueChange={(value) => setNewSectionForm({ ...newSectionForm, adviser_id: parseInt(value) || 0 })}
              >
                <SelectTrigger id="section-adviser" className="mt-2">
                  <SelectValue placeholder="Select adviser (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.first_name} {teacher.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setAddSectionOpen(false);
                setNewSectionForm({
                  section_code: '',
                  section_name: '',
                  course: '',
                  year_level: 1,
                  school_year: '',
                  semester: '1st',
                  capacity: 50,
                  adviser_id: 0
                });
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => handleCreateSection(newSectionForm)}
                disabled={loadingSection === 'create-section'}
              >
                {loadingSection === 'create-section' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Section'
                )}
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
              <Label htmlFor="subject-type">Subject Type</Label>
              <Select
                value={newSubjectForm.subject_type}
                onValueChange={(value: 'SHS' | 'College') => setNewSubjectForm({ ...newSubjectForm, subject_type: value })}
              >
                <SelectTrigger id="subject-type" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHS">SHS</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject-code">Subject Code</Label>
              <Input 
                id="subject-code" 
                placeholder="e.g., CS101" 
                className="mt-2"
                value={newSubjectForm.subject_code}
                onChange={(e) => setNewSubjectForm({ ...newSubjectForm, subject_code: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input 
                id="subject-name" 
                placeholder="e.g., Introduction to Programming" 
                className="mt-2"
                value={newSubjectForm.subject_name}
                onChange={(e) => setNewSubjectForm({ ...newSubjectForm, subject_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject-units">Units</Label>
                <Input 
                  id="subject-units" 
                  type="number" 
                  placeholder="3" 
                  className="mt-2"
                  value={newSubjectForm.units}
                  onChange={(e) => setNewSubjectForm({ ...newSubjectForm, units: parseInt(e.target.value) || 3 })}
                />
              </div>
              <div>
                <Label htmlFor="subject-course">Course (Optional)</Label>
                <Input 
                  id="subject-course" 
                  placeholder="e.g., BSIT" 
                  className="mt-2"
                  value={newSubjectForm.course}
                  onChange={(e) => setNewSubjectForm({ ...newSubjectForm, course: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject-year">Year Level (Optional)</Label>
                <Input 
                  id="subject-year" 
                  type="number"
                  min="1"
                  max="4"
                  placeholder="1" 
                  className="mt-2"
                  value={newSubjectForm.year_level}
                  onChange={(e) => setNewSubjectForm({ ...newSubjectForm, year_level: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="subject-semester">Semester (Optional)</Label>
                <Select
                  value={newSubjectForm.semester}
                  onValueChange={(value) => setNewSubjectForm({ ...newSubjectForm, semester: value })}
                >
                  <SelectTrigger id="subject-semester" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Semester</SelectItem>
                    <SelectItem value="2nd">2nd Semester</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="subject-description">Description (Optional)</Label>
              <Textarea 
                id="subject-description" 
                placeholder="Subject description" 
                className="mt-2"
                rows={3}
                value={newSubjectForm.description}
                onChange={(e) => setNewSubjectForm({ ...newSubjectForm, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setAddSubjectOpen(false);
                setNewSubjectForm({
                  subject_code: '',
                  subject_name: '',
                  description: '',
                  units: 3,
                  course: '',
                  year_level: 1,
                  semester: '1st',
                  subject_type: selectedStudent?.subject_type || 'College'
                });
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => handleCreateSubject(newSubjectForm)}
                disabled={loadingSection === 'create-subject'}
              >
                {loadingSection === 'create-subject' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Subject'
                )}
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
              <Label htmlFor="teacher-faculty-id">Faculty ID</Label>
              <Input 
                id="teacher-faculty-id" 
                placeholder="F-001" 
                className="mt-2"
                value={newTeacherForm.faculty_id}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, faculty_id: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teacher-first-name">First Name</Label>
                <Input 
                  id="teacher-first-name" 
                  placeholder="First name" 
                  className="mt-2"
                  value={newTeacherForm.first_name}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="teacher-last-name">Last Name</Label>
                <Input 
                  id="teacher-last-name" 
                  placeholder="Last name" 
                  className="mt-2"
                  value={newTeacherForm.last_name}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, last_name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="teacher-dept">Department</Label>
              <Input 
                id="teacher-dept" 
                placeholder="e.g., Computer Science" 
                className="mt-2"
                value={newTeacherForm.department}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, department: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teacher-email">Email</Label>
                <Input 
                  id="teacher-email" 
                  type="email"
                  placeholder="email@example.com" 
                  className="mt-2"
                  value={newTeacherForm.email}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="teacher-contact">Contact Number</Label>
                <Input 
                  id="teacher-contact" 
                  placeholder="+63..." 
                  className="mt-2"
                  value={newTeacherForm.contact_number}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, contact_number: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="teacher-specialization">Specialization</Label>
              <Input 
                id="teacher-specialization" 
                placeholder="e.g., Database Systems" 
                className="mt-2"
                value={newTeacherForm.specialization}
                onChange={(e) => setNewTeacherForm({ ...newTeacherForm, specialization: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddTeacherOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleCreateTeacher}
                disabled={loadingSection === 'create-teacher'}
              >
                {loadingSection === 'create-teacher' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Teacher'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={editTeacherOpen} onOpenChange={setEditTeacherOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update teacher information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Faculty ID</Label>
                <Input 
                  value={editTeacherForm.faculty_id}
                  onChange={(e) => setEditTeacherForm({ ...editTeacherForm, faculty_id: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input 
                  value={editTeacherForm.department}
                  onChange={(e) => setEditTeacherForm({ ...editTeacherForm, department: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input 
                  value={editTeacherForm.first_name}
                  onChange={(e) => setEditTeacherForm({ ...editTeacherForm, first_name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input 
                  value={editTeacherForm.last_name}
                  onChange={(e) => setEditTeacherForm({ ...editTeacherForm, last_name: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={editTeacherForm.email}
                  onChange={(e) => setEditTeacherForm({ ...editTeacherForm, email: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input 
                  value={editTeacherForm.contact_number}
                  onChange={(e) => setEditTeacherForm({ ...editTeacherForm, contact_number: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editTeacherForm.status}
                onValueChange={(value) => setEditTeacherForm({ ...editTeacherForm, status: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditTeacherOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleUpdateTeacher}
                disabled={loadingSection === 'update-teacher'}
              >
                {loadingSection === 'update-teacher' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Teacher'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Teacher Dialog */}
      <AlertDialog open={removeTeacherOpen} onOpenChange={setRemoveTeacherOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete teacher {selectedStudent?.first_name} {selectedStudent?.last_name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTeacher}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      {/* Edit Section Dialog */}
      <Dialog open={editSectionOpen} onOpenChange={setEditSectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update section information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-section-code">Section Code</Label>
                <Input 
                  id="edit-section-code" 
                  className="mt-2"
                  value={editSectionForm.section_code}
                  onChange={(e) => setEditSectionForm({ ...editSectionForm, section_code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-section-name">Section Name</Label>
                <Input 
                  id="edit-section-name" 
                  className="mt-2"
                  value={editSectionForm.section_name}
                  onChange={(e) => setEditSectionForm({ ...editSectionForm, section_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-section-course">Course/Program</Label>
                <Input 
                  id="edit-section-course" 
                  className="mt-2"
                  value={editSectionForm.course}
                  onChange={(e) => setEditSectionForm({ ...editSectionForm, course: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-section-year">Year Level</Label>
                <Input 
                  id="edit-section-year" 
                  type="number"
                  min="1"
                  max="4"
                  className="mt-2"
                  value={editSectionForm.year_level}
                  onChange={(e) => setEditSectionForm({ ...editSectionForm, year_level: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-section-school-year">School Year</Label>
                <Input 
                  id="edit-section-school-year" 
                  className="mt-2"
                  value={editSectionForm.school_year}
                  onChange={(e) => setEditSectionForm({ ...editSectionForm, school_year: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-section-semester">Semester</Label>
                <Select
                  value={editSectionForm.semester}
                  onValueChange={(value) => setEditSectionForm({ ...editSectionForm, semester: value })}
                >
                  <SelectTrigger id="edit-section-semester" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Semester</SelectItem>
                    <SelectItem value="2nd">2nd Semester</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-section-capacity">Capacity</Label>
              <Input 
                id="edit-section-capacity" 
                type="number"
                className="mt-2"
                value={editSectionForm.capacity}
                onChange={(e) => setEditSectionForm({ ...editSectionForm, capacity: parseInt(e.target.value) || 50 })}
              />
            </div>
            <div>
              <Label htmlFor="edit-section-adviser">Adviser (Optional)</Label>
              <Select
                value={editSectionForm.adviser_id.toString()}
                onValueChange={(value) => setEditSectionForm({ ...editSectionForm, adviser_id: parseInt(value) || 0 })}
              >
                <SelectTrigger id="edit-section-adviser" className="mt-2">
                  <SelectValue placeholder="Select adviser (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.first_name} {teacher.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setEditSectionOpen(false);
                setEditingSection(null);
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleUpdateSection}
                disabled={loadingSection === 'update-section'}
              >
                {loadingSection === 'update-section' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Section'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={editSubjectOpen} onOpenChange={setEditSubjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update subject information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-subject-type">Subject Type</Label>
              <Select
                value={editSubjectForm.subject_type}
                onValueChange={(value: 'SHS' | 'College') => setEditSubjectForm({ ...editSubjectForm, subject_type: value })}
              >
                <SelectTrigger id="edit-subject-type" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHS">SHS</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-subject-code">Subject Code</Label>
              <Input 
                id="edit-subject-code" 
                className="mt-2"
                value={editSubjectForm.subject_code}
                onChange={(e) => setEditSubjectForm({ ...editSubjectForm, subject_code: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-subject-name">Subject Name</Label>
              <Input 
                id="edit-subject-name" 
                className="mt-2"
                value={editSubjectForm.subject_name}
                onChange={(e) => setEditSubjectForm({ ...editSubjectForm, subject_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-subject-units">Units</Label>
                <Input 
                  id="edit-subject-units" 
                  type="number" 
                  className="mt-2"
                  value={editSubjectForm.units}
                  onChange={(e) => setEditSubjectForm({ ...editSubjectForm, units: parseInt(e.target.value) || 3 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-subject-course">Course (Optional)</Label>
                <Input 
                  id="edit-subject-course" 
                  className="mt-2"
                  value={editSubjectForm.course}
                  onChange={(e) => setEditSubjectForm({ ...editSubjectForm, course: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-subject-year">Year Level (Optional)</Label>
                <Input 
                  id="edit-subject-year" 
                  type="number"
                  min="1"
                  max="4"
                  className="mt-2"
                  value={editSubjectForm.year_level}
                  onChange={(e) => setEditSubjectForm({ ...editSubjectForm, year_level: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-subject-semester">Semester (Optional)</Label>
                <Select
                  value={editSubjectForm.semester}
                  onValueChange={(value) => setEditSubjectForm({ ...editSubjectForm, semester: value })}
                >
                  <SelectTrigger id="edit-subject-semester" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Semester</SelectItem>
                    <SelectItem value="2nd">2nd Semester</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-subject-description">Description (Optional)</Label>
              <Textarea 
                id="edit-subject-description" 
                className="mt-2"
                rows={3}
                value={editSubjectForm.description}
                onChange={(e) => setEditSubjectForm({ ...editSubjectForm, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setEditSubjectOpen(false);
                setEditingSubject(null);
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleUpdateSubject}
                disabled={loadingSection === 'update-subject'}
              >
                {loadingSection === 'update-subject' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Subject'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit School Year Dialog */}
      <Dialog open={editSchoolYearOpen} onOpenChange={setEditSchoolYearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit School Year</DialogTitle>
            <DialogDescription>
              Update school year information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-sy-year">School Year</Label>
              <Input 
                id="edit-sy-year" 
                placeholder="2024-2025" 
                className="mt-2"
                value={editSchoolYearForm.school_year}
                onChange={(e) => setEditSchoolYearForm({ ...editSchoolYearForm, school_year: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-sy-start">Start Date</Label>
                <Input 
                  id="edit-sy-start" 
                  type="date"
                  className="mt-2"
                  value={editSchoolYearForm.start_date}
                  onChange={(e) => setEditSchoolYearForm({ ...editSchoolYearForm, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-sy-end">End Date</Label>
                <Input 
                  id="edit-sy-end" 
                  type="date"
                  className="mt-2"
                  value={editSchoolYearForm.end_date}
                  onChange={(e) => setEditSchoolYearForm({ ...editSchoolYearForm, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-sy-enroll-start">Enrollment Start</Label>
                <Input 
                  id="edit-sy-enroll-start" 
                  type="date"
                  className="mt-2"
                  value={editSchoolYearForm.enrollment_start}
                  onChange={(e) => setEditSchoolYearForm({ ...editSchoolYearForm, enrollment_start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-sy-enroll-end">Enrollment End</Label>
                <Input 
                  id="edit-sy-enroll-end" 
                  type="date"
                  className="mt-2"
                  value={editSchoolYearForm.enrollment_end}
                  onChange={(e) => setEditSchoolYearForm({ ...editSchoolYearForm, enrollment_end: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="edit-sy-active" 
                checked={editSchoolYearForm.is_active}
                onCheckedChange={(checked) => setEditSchoolYearForm({ ...editSchoolYearForm, is_active: checked === true })}
              />
              <Label htmlFor="edit-sy-active" className="cursor-pointer">
                Set as active school year
              </Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setEditSchoolYearOpen(false);
                setEditingSchoolYear(null);
              }}>
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleUpdateSchoolYear}
                disabled={loadingSection === 'update-school-year'}
              >
                {loadingSection === 'update-school-year' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update School Year'
                )}
              </Button>
            </div>
          </div>
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
