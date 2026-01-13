import { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface RegistrarDashboardProps {
  onLogout: () => void;
}

export default function RegistrarDashboard({ onLogout }: RegistrarDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');

  const stats = [
    { 
      label: 'Total Records', 
      value: '1,243', 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      change: '+45'
    },
    { 
      label: 'Pending Grades', 
      value: '28', 
      icon: ClipboardCheck, 
      color: 'from-orange-500 to-orange-600',
      change: '12 urgent'
    },
    { 
      label: 'COR Requests', 
      value: '15', 
      icon: Award, 
      color: 'from-green-500 to-green-600',
      change: '+8'
    },
    { 
      label: 'Clearances', 
      value: '42', 
      icon: CheckCircle, 
      color: 'from-purple-500 to-purple-600',
      change: '18 pending'
    },
  ];

  const studentRecords = [
    { id: '2024-001', name: 'Juan Dela Cruz', course: 'BSIT', year: '2nd Year', gpa: 1.6, status: 'Regular', clearance: 'Clear' },
    { id: '2024-002', name: 'Maria Santos', course: 'BSCS', year: '3rd Year', gpa: 1.4, status: 'Regular', clearance: 'Clear' },
    { id: '2024-003', name: 'Jose Reyes', course: 'BSIT', year: '1st Year', gpa: 1.9, status: 'Regular', clearance: 'Pending' },
    { id: '2024-004', name: 'Ana Garcia', course: 'BSCpE', year: '4th Year', gpa: 1.3, status: 'Regular', clearance: 'Clear' },
  ];

  const corRequests = [
    { id: 'COR-001', student: 'Juan Dela Cruz', studentId: '2024-001', course: 'BSIT', semester: '1st Sem 2024-2025', status: 'Pending', date: 'Dec 10, 2024' },
    { id: 'COR-002', student: 'Maria Santos', studentId: '2024-002', course: 'BSCS', semester: '1st Sem 2024-2025', status: 'Pending', date: 'Dec 10, 2024' },
    { id: 'COR-003', student: 'Jose Reyes', studentId: '2024-003', course: 'BSIT', semester: '1st Sem 2024-2025', status: 'Approved', date: 'Dec 9, 2024' },
  ];

  const gradeSubmissions = [
    { id: 'GS-001', faculty: 'Dr. Roberto Santos', subject: 'CS101 - Introduction to Programming', section: 'IT-2A', students: 35, status: 'Submitted', date: 'Dec 8, 2024' },
    { id: 'GS-002', faculty: 'Prof. Maria Reyes', subject: 'MATH201 - Calculus I', section: 'CS-3B', students: 30, status: 'Pending', date: 'Overdue' },
    { id: 'GS-003', faculty: 'Ms. Jennifer Garcia', subject: 'ENG101 - Technical Writing', section: 'IT-1A', students: 32, status: 'Submitted', date: 'Dec 7, 2024' },
  ];

  const clearanceRequests = [
    { id: 'CLR-001', student: 'Jose Reyes', studentId: '2024-003', type: 'Library', status: 'Pending', issue: 'Unreturned books', date: 'Dec 9, 2024' },
    { id: 'CLR-002', student: 'Carlos Rodriguez', studentId: '2024-005', type: 'Finance', status: 'Pending', issue: 'Unpaid fees', date: 'Dec 8, 2024' },
  ];

  const renderDashboardContent = () => (
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
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">
                  {stat.change}
                </Badge>
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
              <div className="space-y-3">
                {corRequests.map((request) => (
                  <div key={request.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-slate-900">{request.student}</p>
                        <p className="text-xs text-slate-500">{request.studentId} • {request.course}</p>
                      </div>
                      <Badge className={request.status === 'Approved' ? 'bg-green-100 text-green-700 border-0 text-xs' : 'bg-orange-100 text-orange-700 border-0 text-xs'}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{request.semester}</p>
                    <p className="text-xs text-slate-400 mt-1">{request.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </Card>

        {/* Grade Submissions */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-white">Grade Submissions</h3>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              <div className="space-y-3">
                {gradeSubmissions.map((submission) => (
                  <div key={submission.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{submission.subject}</p>
                        <p className="text-xs text-slate-500">{submission.faculty} • {submission.section}</p>
                        <p className="text-xs text-slate-600 mt-1">{submission.students} students</p>
                        <p className="text-xs text-slate-400 mt-1">{submission.date}</p>
                      </div>
                      <Badge className={submission.status === 'Submitted' ? 'bg-green-100 text-green-700 border-0 text-xs' : 'bg-red-100 text-red-700 border-0 text-xs'}>
                        {submission.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </>
  );

  const renderStudentRecordsContent = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search student records..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <div className="space-y-3">
            {studentRecords.map((student) => (
              <div key={student.id} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-slate-900">{student.name}</h4>
                    <p className="text-sm text-slate-500">{student.id} • {student.course} • {student.year}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">GPA: {student.gpa}</Badge>
                      <Badge className={student.clearance === 'Clear' ? 'bg-green-100 text-green-700 border-0' : 'bg-orange-100 text-orange-700 border-0'}>
                        {student.clearance}
                      </Badge>
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
                    <Button size="sm" variant="outline">
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

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

  const renderCORManagementContent = () => (
    <div>
      <div className="flex justify-end mb-6">
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <Download className="h-4 w-4 mr-2" />
          Export All CORs
        </Button>
      </div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <div className="space-y-4">
            {corRequests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-slate-900">{request.student}</h4>
                    <p className="text-sm text-slate-500">{request.id} • {request.studentId}</p>
                    <p className="text-sm text-slate-600 mt-2">{request.course} • {request.semester}</p>
                    <p className="text-xs text-slate-400 mt-1">{request.date}</p>
                  </div>
                  <Badge className={request.status === 'Approved' ? 'bg-green-100 text-green-700 border-0' : 'bg-orange-100 text-orange-700 border-0'}>
                    {request.status}
                  </Badge>
                </div>
                {request.status === 'Pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-700">
                      Approve & Generate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                  </div>
                )}
                {request.status === 'Approved' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View COR
                    </Button>
                    <Button size="sm" variant="outline">
                      <Printer className="h-4 w-4 mr-1" />
                      Reprint
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderClearanceContent = () => (
    <div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <p className="text-slate-600 mb-6">Manage student clearances and requirements.</p>
          <div className="space-y-4">
            {clearanceRequests.map((clearance) => (
              <div key={clearance.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-slate-900">{clearance.student}</h4>
                    <p className="text-sm text-slate-500">{clearance.id} • {clearance.studentId}</p>
                    <div className="mt-2">
                      <Badge variant="secondary">{clearance.type}</Badge>
                    </div>
                    <p className="text-sm text-orange-700 mt-2">Issue: {clearance.issue}</p>
                    <p className="text-xs text-slate-400 mt-1">{clearance.date}</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-0">
                    {clearance.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Contact Student
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-700">
                    Mark Resolved
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Student Records', icon: Users },
    { name: 'Grades Management', icon: ClipboardCheck },
    { name: 'COR Management', icon: Award },
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
          </div>
        </div>
      </div>
    </div>
  );
}
