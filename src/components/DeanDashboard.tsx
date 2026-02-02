import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  LogOut, 
  LayoutDashboard, 
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Calendar,
  Award,
  ChevronDown,
  Eye,
  Edit,
  Plus,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
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
import { deanService } from '../services/dean.service';
import { facultyService } from '../services/faculty.service';
import { subjectService } from '../services/subject.service';
import CoursesManagement from './CoursesManagement';
import { gradesService } from '../services/grades.service';

interface DeanDashboardProps {
  onLogout: () => void;
}

export default function DeanDashboard({ onLogout }: DeanDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [academicOpen, setAcademicOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [facultyMembers, setFacultyMembers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [gradesList, setGradesList] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('');
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignForm, setReassignForm] = useState({ teacherId: '', fromSubjectId: '', toSubjectId: '' });
  const [gradesDialogOpen, setGradesDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [addFacultyOpen, setAddFacultyOpen] = useState(false);
  const [editFacultyOpen, setEditFacultyOpen] = useState(false);
  const [deleteFacultyOpen, setDeleteFacultyOpen] = useState(false);
  const [addProgramOpen, setAddProgramOpen] = useState(false);
  const [editProgramOpen, setEditProgramOpen] = useState(false);
  const [viewCurriculumOpen, setViewCurriculumOpen] = useState(false);
  const [addSubjectToCurriculumOpen, setAddSubjectToCurriculumOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [forDeanEnrollments, setForDeanEnrollments] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const [newFacultyForm, setNewFacultyForm] = useState({
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

  const [editFacultyForm, setEditFacultyForm] = useState({
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

  const [newProgramForm, setNewProgramForm] = useState({
    program_code: '',
    program_name: '',
    description: '',
    department: '',
    degree_type: 'Bachelor',
    duration_years: 4,
    total_units: 0
  });

  const [curriculumForm, setCurriculumForm] = useState({
    program_id: 0,
    subject_id: 0,
    year_level: 1,
    semester: '1st',
    is_core: true,
    prerequisite_subject_id: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeSection]);

  useEffect(() => {
    loadSubjects();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeSection === 'Dashboard') {
        const statsResponse = await deanService.getDashboardStats();
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        }
        // Fetch recent faculty for dashboard
        const facultyResponse = await facultyService.getAllFaculty({ status: 'Active' });
        if (facultyResponse.success) {
          setFacultyMembers(facultyResponse.data?.slice(0, 5) || []);
        }
      } else if (activeSection === 'Faculty Management') {
        const facultyResponse = await facultyService.getAllFaculty();
        if (facultyResponse.success) {
          setFacultyMembers(facultyResponse.data || []);
        }
      } else if (activeSection === 'Program Management') {
        const programsResponse = await deanService.getAllPrograms();
        if (programsResponse.success) {
          setPrograms(programsResponse.data || []);
        }
      } else if (activeSection === 'Curriculum') {
        const programsResponse = await deanService.getAllPrograms({ status: 'Active' });
        if (programsResponse.success) {
          setPrograms(programsResponse.data || []);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaculty = async () => {
    try {
      setError('');
      await facultyService.createFaculty(newFacultyForm);
      setAddFacultyOpen(false);
      setNewFacultyForm({
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
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create faculty');
    }
  };

  const handleUpdateFaculty = async () => {
    try {
      setError('');
      await facultyService.updateFaculty(selectedFaculty.id, editFacultyForm);
      setEditFacultyOpen(false);
      setSelectedFaculty(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update faculty');
    }
  };

  const handleDeleteFaculty = async () => {
    try {
      setError('');
      await facultyService.deleteFaculty(selectedFaculty.id);
      setDeleteFacultyOpen(false);
      setSelectedFaculty(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete faculty');
    }
  };

  const handleCreateProgram = async () => {
    try {
      setError('');
      await deanService.createProgram(newProgramForm);
      setAddProgramOpen(false);
      setNewProgramForm({
        program_code: '',
        program_name: '',
        description: '',
        department: '',
        degree_type: 'Bachelor',
        duration_years: 4,
        total_units: 0
      });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create program');
    }
  };

  const handleViewCurriculum = async (programId: number) => {
    try {
      setError('');
      const response = await deanService.getCurriculumByProgram(programId);
      if (response.success) {
        setCurriculum(response.data || []);
        const program = programs.find(p => p.id === programId);
        setSelectedProgram(program);
        setViewCurriculumOpen(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load curriculum');
    }
  };

  const handleAddSubjectToCurriculum = async () => {
    try {
      setError('');
      await deanService.addSubjectToCurriculum(curriculumForm);
      setAddSubjectToCurriculumOpen(false);
      if (selectedProgram) {
        await handleViewCurriculum(selectedProgram.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add subject to curriculum');
    }
  };

  const handleRemoveSubjectFromCurriculum = async (curriculumId: number) => {
    try {
      setError('');
      await deanService.removeSubjectFromCurriculum(curriculumId);
      if (selectedProgram) {
        await handleViewCurriculum(selectedProgram.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove subject from curriculum');
    }
  };

  const fetchForDeanEnrollments = async () => {
    try {
      setError('');
      const response = await deanService.getEnrollments({ status: 'For Dean Approval' });
      if (response.success) {
        setForDeanEnrollments(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load enrollments for dean');
    }
  };

  const handleApproveSubjects = async (enrollmentId: number) => {
    try {
      setApprovingId(enrollmentId);
      await deanService.approveSubjectSelection(enrollmentId);
      setApprovingId(null);
      await fetchForDeanEnrollments();
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve subjects');
      setApprovingId(null);
    }
  };

  const loadGrades = async () => {
    try {
      setLoading(true);
      const resp = await gradesService.getGradesBySection({ sectionId: selectedSection || undefined, subjectId: selectedSubjectFilter || undefined });
      if (resp?.data) setGradesList(resp.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveGrade = async (enrollmentSubjectId: number) => {
    try {
      setLoading(true);
      await gradesService.approveGrade(enrollmentSubjectId);
      await loadGrades();
    } catch (err: any) {
      setError(err.message || 'Failed to approve grade');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReassign = (teacherId?: string) => {
    setReassignForm({ teacherId: teacherId || '', fromSubjectId: '', toSubjectId: '' });
    setReassignOpen(true);
  };

  const handleReassignTeacher = async () => {
    try {
      setLoading(true);
      await deanService.reassignTeacher(reassignForm);
      setReassignOpen(false);
      setReassignForm({ teacherId: '', fromSubjectId: '', toSubjectId: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to reassign teacher');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await subjectService.getAllSubjects();
      if (response.success) {
        setSubjects(response.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load subjects:', err);
    }
  };

  const stats = dashboardStats ? [
    { 
      label: 'Total Faculty', 
      value: dashboardStats.totalFaculty?.toString() || '0', 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      change: ''
    },
    { 
      label: 'Active Programs', 
      value: dashboardStats.activePrograms?.toString() || '0', 
      icon: BookOpen, 
      color: 'from-green-500 to-green-600',
      change: ''
    },
    { 
      label: 'Total Students', 
      value: dashboardStats.totalStudents?.toString() || '0', 
      icon: GraduationCap, 
      color: 'from-purple-500 to-purple-600',
      change: ''
    },
    { 
      label: 'Pending Approvals', 
      value: dashboardStats.pendingApprovals?.toString() || '0', 
      icon: FileText, 
      color: 'from-orange-500 to-orange-600',
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
          {/* Faculty Overview */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-white">Faculty Members</h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {facultyMembers.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No faculty members found</p>
                ) : (
                  <div className="space-y-3">
                    {facultyMembers.map((faculty) => (
                      <div key={faculty.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm text-slate-900">{faculty.first_name} {faculty.last_name}</p>
                            <p className="text-xs text-slate-500">{faculty.faculty_id} • {faculty.department || 'N/A'}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                            {faculty.status}
                          </Badge>
                        </div>
                        {faculty.specialization && (
                          <p className="text-xs text-slate-600">{faculty.specialization}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Active Programs */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h3 className="text-white">Active Programs</h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {programs.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No programs found</p>
                ) : (
                  <div className="space-y-3">
                    {programs.slice(0, 10).map((program) => (
                      <div key={program.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm text-slate-900">{program.program_code}</p>
                            <p className="text-xs text-slate-500">{program.program_name}</p>
                            <p className="text-xs text-slate-400 mt-1">{program.department || 'N/A'}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                            {program.status}
                          </Badge>
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
  };

  const renderFacultyManagementContent = () => {
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
        <div className="flex justify-end mb-6">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setAddFacultyOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty Member
          </Button>
        </div>
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <p className="text-slate-600 mb-6">Manage faculty members and their assignments.</p>
            {facultyMembers.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No faculty members found</p>
            ) : (
              <div className="space-y-4">
                {facultyMembers.map((faculty) => (
                  <div key={faculty.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{faculty.first_name} {faculty.last_name}</h4>
                        <p className="text-sm text-slate-500">{faculty.faculty_id} • {faculty.department || 'N/A'}</p>
                        {faculty.specialization && (
                          <p className="text-sm text-slate-600 mt-1">{faculty.specialization}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedFaculty(faculty);
                            setEditFacultyForm({
                              faculty_id: faculty.faculty_id,
                              first_name: faculty.first_name,
                              middle_name: faculty.middle_name || '',
                              last_name: faculty.last_name,
                              suffix: faculty.suffix || '',
                              department: faculty.department || '',
                              specialization: faculty.specialization || '',
                              email: faculty.email || '',
                              contact_number: faculty.contact_number || '',
                              status: faculty.status
                            });
                            setEditFacultyOpen(true);
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
                            setSelectedFaculty(faculty);
                            setDeleteFacultyOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleOpenReassign(faculty.id)}>
                          Reassign
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Add Faculty Dialog */}
        <Dialog open={addFacultyOpen} onOpenChange={setAddFacultyOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Faculty Member</DialogTitle>
              <DialogDescription>Create a new faculty member record.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Faculty ID</Label>
                  <Input
                    value={newFacultyForm.faculty_id}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, faculty_id: e.target.value })}
                    placeholder="F-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={newFacultyForm.department}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, department: e.target.value })}
                    placeholder="Computer Science"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={newFacultyForm.first_name}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Middle Name</Label>
                  <Input
                    value={newFacultyForm.middle_name}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, middle_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={newFacultyForm.last_name}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newFacultyForm.email}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input
                    value={newFacultyForm.contact_number}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, contact_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input
                  value={newFacultyForm.specialization}
                  onChange={(e) => setNewFacultyForm({ ...newFacultyForm, specialization: e.target.value })}
                  placeholder="e.g., Database Systems"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddFacultyOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateFaculty}>Create Faculty</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Faculty Dialog */}
        <Dialog open={editFacultyOpen} onOpenChange={setEditFacultyOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Faculty Member</DialogTitle>
              <DialogDescription>Update faculty member information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Faculty ID</Label>
                  <Input
                    value={editFacultyForm.faculty_id}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, faculty_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={editFacultyForm.department}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={editFacultyForm.first_name}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Middle Name</Label>
                  <Input
                    value={editFacultyForm.middle_name}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, middle_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={editFacultyForm.last_name}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editFacultyForm.email}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input
                    value={editFacultyForm.contact_number}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, contact_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editFacultyForm.status}
                  onValueChange={(value) => setEditFacultyForm({ ...editFacultyForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditFacultyOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateFaculty}>Update Faculty</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Faculty Dialog */}
        <AlertDialog open={deleteFacultyOpen} onOpenChange={setDeleteFacultyOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete faculty member {selectedFaculty?.first_name} {selectedFaculty?.last_name}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFaculty} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  const renderProgramManagementContent = () => {
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
        <div className="flex justify-end mb-6">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setAddProgramOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Program
          </Button>
        </div>
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <p className="text-slate-600 mb-6">Manage academic programs and curricula.</p>
            {programs.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No programs found</p>
            ) : (
              <div className="space-y-4">
                {programs.map((program) => (
                  <div key={program.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-slate-900">{program.program_code}</h4>
                          <Badge variant="secondary">{program.studentCount || 0} students</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{program.program_name}</p>
                        {program.description && (
                          <p className="text-xs text-slate-500 mt-1">{program.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewCurriculum(program.id)}
                        >
                          View Curriculum
                        </Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{program.department || 'N/A'}</span>
                      {program.degree_type && <span>• {program.degree_type}</span>}
                      {program.duration_years && <span>• {program.duration_years} years</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Add Program Dialog */}
        {/* Reassign Teacher Dialog */}
        <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reassign Teacher</DialogTitle>
              <DialogDescription>Reassign a teacher from one subject to another for workload balancing.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <div>
                <Label>Teacher</Label>
                <Select value={reassignForm.teacherId} onValueChange={(v) => setReassignForm({ ...reassignForm, teacherId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyMembers.map(f => (<SelectItem key={f.id} value={f.id}>{f.first_name} {f.last_name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>From Subject</Label>
                <Select value={reassignForm.fromSubjectId} onValueChange={(v) => setReassignForm({ ...reassignForm, fromSubjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="From subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (<SelectItem key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>To Subject</Label>
                <Select value={reassignForm.toSubjectId} onValueChange={(v) => setReassignForm({ ...reassignForm, toSubjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="To subject" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (<SelectItem key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setReassignOpen(false)}>Cancel</Button>
              <Button className="ml-2" onClick={handleReassignTeacher}>Reassign</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Grades Review Dialog */}
        <Dialog open={gradesDialogOpen} onOpenChange={setGradesDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Grades Review</DialogTitle>
              <DialogDescription>Load grades by section/subject and approve individual grades.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Section</Label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Sections will be loaded via subjects for simplicity placeholder */}
                      <SelectItem value="">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={selectedSubjectFilter} onValueChange={setSelectedSubjectFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {subjects.map(s => (<SelectItem key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadGrades}>Load Grades</Button>
                <Button variant="outline" onClick={() => { setSelectedSection(''); setSelectedSubjectFilter(''); setGradesList([]); }}>Reset</Button>
              </div>

              <div>
                {gradesList.length === 0 ? (
                  <p className="text-sm text-slate-500">No grades loaded</p>
                ) : (
                  <div className="space-y-2">
                    {gradesList.map((g: any) => (
                      <div key={g.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{g.student_name} — {g.subject_code}</div>
                          <div className="text-xs text-slate-500">Grade: {g.grade || 'N/A'}</div>
                        </div>
                        <div>
                          <Button size="sm" onClick={() => handleApproveGrade(g.id)}>Approve</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setGradesDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={addProgramOpen} onOpenChange={setAddProgramOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Program</DialogTitle>
              <DialogDescription>Create a new academic program.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Program Code</Label>
                  <Input
                    value={newProgramForm.program_code}
                    onChange={(e) => setNewProgramForm({ ...newProgramForm, program_code: e.target.value })}
                    placeholder="BSIT"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Degree Type</Label>
                  <Select
                    value={newProgramForm.degree_type}
                    onValueChange={(value) => setNewProgramForm({ ...newProgramForm, degree_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Associate">Associate</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Doctorate">Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Program Name</Label>
                <Input
                  value={newProgramForm.program_name}
                  onChange={(e) => setNewProgramForm({ ...newProgramForm, program_name: e.target.value })}
                  placeholder="Bachelor of Science in Information Technology"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={newProgramForm.department}
                    onChange={(e) => setNewProgramForm({ ...newProgramForm, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (Years)</Label>
                  <Input
                    type="number"
                    value={newProgramForm.duration_years}
                    onChange={(e) => setNewProgramForm({ ...newProgramForm, duration_years: parseInt(e.target.value) || 4 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newProgramForm.description}
                  onChange={(e) => setNewProgramForm({ ...newProgramForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddProgramOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateProgram}>Create Program</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderDeanApprovalsContent = () => {
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

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Enrollments - For Dean Approval</h3>
          <div>
            <Button variant="outline" onClick={fetchForDeanEnrollments}>Refresh</Button>
            <Button variant="outline" className="ml-2" onClick={() => setGradesDialogOpen(true)}>Grades Review</Button>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <ScrollArea className="h-[500px]">
            <div className="p-4">
              {forDeanEnrollments.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No enrollments pending dean approval</p>
              ) : (
                <div className="space-y-3">
                  {forDeanEnrollments.map((enr) => (
                    <div key={enr.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{enr.first_name} {enr.last_name} — {enr.course || enr.program_name}</p>
                        <p className="text-xs text-slate-500">Submitted: {new Date(enr.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleApproveSubjects(enr.id)} disabled={approvingId === enr.id}>
                          {approvingId === enr.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    );
  };

  const renderCurriculumContent = () => {
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
            <p className="text-slate-600 mb-6">Manage curriculum for each program.</p>
            {programs.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No programs found. Create a program first.</p>
            ) : (
              <div className="space-y-4">
                {programs.map((program) => (
                  <div key={program.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{program.program_code} - {program.program_name}</h4>
                        <p className="text-sm text-slate-500 mt-1">{program.department || 'N/A'}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewCurriculum(program.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View/Edit Curriculum
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* View Curriculum Dialog */}
        <Dialog open={viewCurriculumOpen} onOpenChange={setViewCurriculumOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Curriculum: {selectedProgram?.program_code}</DialogTitle>
              <DialogDescription>Manage subjects for this program.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {curriculum.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No subjects in curriculum yet.</p>
              ) : (
                <div className="space-y-2">
                  {curriculum.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.subject_code} - {item.subject_name}</p>
                        <p className="text-xs text-slate-500">
                          Year {item.year_level} • {item.semester} Semester • {item.units} units
                          {item.is_core ? ' • Core' : ' • Elective'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveSubjectFromCurriculum(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={async () => {
                    await loadSubjects();
                    setCurriculumForm({ ...curriculumForm, program_id: selectedProgram?.id || 0 });
                    setAddSubjectToCurriculumOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
                <Button variant="outline" onClick={() => setViewCurriculumOpen(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Subject to Curriculum Dialog */}
        <Dialog open={addSubjectToCurriculumOpen} onOpenChange={setAddSubjectToCurriculumOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Subject to Curriculum</DialogTitle>
              <DialogDescription>Add a subject to the program curriculum.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select
                  value={curriculumForm.subject_id.toString()}
                  onValueChange={(value) => setCurriculumForm({ ...curriculumForm, subject_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.subject_code} - {subject.subject_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year Level</Label>
                  <Input
                    type="number"
                    min="1"
                    max="4"
                    value={curriculumForm.year_level}
                    onChange={(e) => setCurriculumForm({ ...curriculumForm, year_level: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select
                    value={curriculumForm.semester}
                    onValueChange={(value) => setCurriculumForm({ ...curriculumForm, semester: value })}
                  >
                    <SelectTrigger>
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddSubjectToCurriculumOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSubjectToCurriculum}>Add Subject</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Faculty Management', icon: Users },
    { name: 'Program Management', icon: BookOpen },
    { name: 'Courses', icon: BookOpen },
    { name: 'Curriculum', icon: FileText },
    { name: 'For Dean Approval', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Dean Dashboard
            </h1>
            <p className="text-slate-600">Academic management and curriculum oversight</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-900">Dean Roberto Santos</p>
                <p className="text-xs text-slate-500">Academic Affairs</p>
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
            {activeSection === 'Faculty Management' && renderFacultyManagementContent()}
            {activeSection === 'Program Management' && renderProgramManagementContent()}
            {activeSection === 'Courses' && <CoursesManagement />}
            {activeSection === 'Curriculum' && renderCurriculumContent()}
            {activeSection === 'For Dean Approval' && renderDeanApprovalsContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
