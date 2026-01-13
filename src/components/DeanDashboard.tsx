import { useState } from 'react';
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
  Plus
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

interface DeanDashboardProps {
  onLogout: () => void;
}

export default function DeanDashboard({ onLogout }: DeanDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [academicOpen, setAcademicOpen] = useState(false);

  const stats = [
    { 
      label: 'Total Faculty', 
      value: '48', 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      change: '+3'
    },
    { 
      label: 'Active Programs', 
      value: '12', 
      icon: BookOpen, 
      color: 'from-green-500 to-green-600',
      change: '+2'
    },
    { 
      label: 'Total Students', 
      value: '1,243', 
      icon: GraduationCap, 
      color: 'from-purple-500 to-purple-600',
      change: '+45'
    },
    { 
      label: 'Pending Approvals', 
      value: '8', 
      icon: FileText, 
      color: 'from-orange-500 to-orange-600',
      change: '2 urgent'
    },
  ];

  const facultyMembers = [
    { id: 'F-001', name: 'Dr. Roberto Santos', department: 'Computer Science', subjects: 3, status: 'Active' },
    { id: 'F-002', name: 'Prof. Maria Reyes', department: 'Mathematics', subjects: 2, status: 'Active' },
    { id: 'F-003', name: 'Ms. Jennifer Garcia', department: 'English', subjects: 2, status: 'Active' },
    { id: 'F-004', name: 'Engr. Carlos Martinez', department: 'Engineering', subjects: 4, status: 'Active' },
  ];

  const curriculumProposals = [
    { id: 'CP-001', program: 'BSIT', proposal: 'Add Cybersecurity Course', submittedBy: 'Dr. Roberto Santos', status: 'Pending', date: 'Dec 8, 2024' },
    { id: 'CP-002', program: 'BSCS', proposal: 'Update Data Science Track', submittedBy: 'Prof. Maria Reyes', status: 'Pending', date: 'Dec 7, 2024' },
    { id: 'CP-003', program: 'BSCpE', proposal: 'IoT Laboratory Setup', submittedBy: 'Engr. Carlos Martinez', status: 'Approved', date: 'Dec 5, 2024' },
  ];

  const programs = [
    { code: 'BSIT', name: 'Bachelor of Science in Information Technology', students: 420, faculty: 12 },
    { code: 'BSCS', name: 'Bachelor of Science in Computer Science', students: 380, faculty: 10 },
    { code: 'BSCpE', name: 'Bachelor of Science in Computer Engineering', students: 290, faculty: 8 },
    { code: 'ACT', name: 'Associate in Computer Technology', students: 153, faculty: 6 },
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
        {/* Faculty Overview */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-white">Faculty Members</h3>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              <div className="space-y-3">
                {facultyMembers.map((faculty) => (
                  <div key={faculty.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-slate-900">{faculty.name}</p>
                        <p className="text-xs text-slate-500">{faculty.id} • {faculty.department}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                        {faculty.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{faculty.subjects} subjects assigned</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </Card>

        {/* Curriculum Proposals */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <h3 className="text-white">Curriculum Proposals</h3>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              <div className="space-y-3">
                {curriculumProposals.map((proposal) => (
                  <div key={proposal.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{proposal.proposal}</p>
                        <p className="text-xs text-slate-500">{proposal.program} • {proposal.submittedBy}</p>
                        <p className="text-xs text-slate-400 mt-1">{proposal.date}</p>
                      </div>
                      <Badge className={proposal.status === 'Approved' ? 'bg-green-100 text-green-700 border-0 text-xs' : 'bg-orange-100 text-orange-700 border-0 text-xs'}>
                        {proposal.status}
                      </Badge>
                    </div>
                    {proposal.status === 'Pending' && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="text-xs h-7">Review</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </>
  );

  const renderFacultyManagementContent = () => (
    <div>
      <div className="flex justify-end mb-6">
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Faculty Member
        </Button>
      </div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <p className="text-slate-600 mb-6">Manage faculty members and their assignments.</p>
          <div className="space-y-4">
            {facultyMembers.map((faculty) => (
              <div key={faculty.id} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-slate-900">{faculty.name}</h4>
                    <p className="text-sm text-slate-500">{faculty.id} • {faculty.department}</p>
                    <p className="text-sm text-slate-600 mt-1">{faculty.subjects} subjects assigned</p>
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
        </div>
      </Card>
    </div>
  );

  const renderProgramManagementContent = () => (
    <div>
      <div className="flex justify-end mb-6">
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>
      </div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <p className="text-slate-600 mb-6">Manage academic programs and curricula.</p>
          <div className="space-y-4">
            {programs.map((program) => (
              <div key={program.code} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-slate-900">{program.code}</h4>
                      <Badge variant="secondary">{program.students} students</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{program.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Curriculum</Button>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{program.faculty} faculty members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderCurriculumContent = () => (
    <div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <Tabs defaultValue="proposals">
            <TabsList>
              <TabsTrigger value="proposals">Proposals</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            
            <TabsContent value="proposals" className="mt-6">
              <div className="space-y-4">
                {curriculumProposals.filter(p => p.status === 'Pending').map((proposal) => (
                  <div key={proposal.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{proposal.proposal}</h4>
                        <p className="text-sm text-slate-500">{proposal.id} • {proposal.program}</p>
                        <p className="text-sm text-slate-600 mt-2">Submitted by: {proposal.submittedBy}</p>
                        <p className="text-xs text-slate-400 mt-1">{proposal.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-700">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                        Reject
                      </Button>
                      <Button size="sm" variant="outline">
                        Request Changes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="approved" className="mt-6">
              <div className="space-y-4">
                {curriculumProposals.filter(p => p.status === 'Approved').map((proposal) => (
                  <div key={proposal.id} className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{proposal.proposal}</h4>
                        <p className="text-sm text-slate-500">{proposal.id} • {proposal.program}</p>
                        <p className="text-sm text-slate-600 mt-2">Submitted by: {proposal.submittedBy}</p>
                        <p className="text-xs text-slate-400 mt-1">{proposal.date}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0">
                        Approved
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="archived" className="mt-6">
              <p className="text-center text-slate-500 py-8">No archived proposals</p>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Faculty Management', icon: Users },
    { name: 'Program Management', icon: BookOpen },
    { name: 'Curriculum', icon: FileText },
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
            {activeSection === 'Curriculum' && renderCurriculumContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
