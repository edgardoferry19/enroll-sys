import { useState } from 'react';
import { Button } from './ui/button';
import { 
  User, 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Shield,
  Settings,
  Database,
  Activity,
  UserCog,
  Key,
  Lock,
  ChevronDown
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface SuperadminDashboardProps {
  onLogout: () => void;
}

export default function SuperadminDashboard({ onLogout }: SuperadminDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [systemOpen, setSystemOpen] = useState(false);

  const stats = [
    { 
      label: 'Total Users', 
      value: '2,458', 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      change: '+124'
    },
    { 
      label: 'Active Sessions', 
      value: '847', 
      icon: Activity, 
      color: 'from-green-500 to-green-600',
      change: '+42'
    },
    { 
      label: 'System Uptime', 
      value: '99.9%', 
      icon: Database, 
      color: 'from-purple-500 to-purple-600',
      change: 'Excellent'
    },
    { 
      label: 'Security Alerts', 
      value: '3', 
      icon: Shield, 
      color: 'from-red-500 to-red-600',
      change: 'Low'
    },
  ];

  const systemUsers = [
    { id: 'U-001', name: 'Admin Maria Cruz', role: 'Admin', status: 'Active', lastLogin: '5 mins ago', permissions: ['Enrollment', 'Transactions'] },
    { id: 'U-002', name: 'Dean Roberto Santos', role: 'Dean', status: 'Active', lastLogin: '1 hour ago', permissions: ['Academic', 'Faculty'] },
    { id: 'U-003', name: 'Registrar Ana Garcia', role: 'Registrar', status: 'Active', lastLogin: '2 hours ago', permissions: ['Records', 'Grades'] },
    { id: 'U-004', name: 'Marketing Jose Reyes', role: 'Marketing', status: 'Active', lastLogin: '30 mins ago', permissions: ['Campaigns', 'Reports'] },
  ];

  const auditLogs = [
    { id: 'LOG-001', user: 'Admin Maria Cruz', action: 'Approved enrollment request', timestamp: '2 mins ago', status: 'success' },
    { id: 'LOG-002', user: 'Dean Roberto Santos', action: 'Updated curriculum', timestamp: '15 mins ago', status: 'success' },
    { id: 'LOG-003', user: 'Registrar Ana Garcia', action: 'Generated report', timestamp: '1 hour ago', status: 'success' },
    { id: 'LOG-004', user: 'Marketing Jose Reyes', action: 'Created campaign', timestamp: '2 hours ago', status: 'success' },
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

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Users */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-white">System Users</h3>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              <div className="space-y-3">
                {systemUsers.map((user) => (
                  <div key={user.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.id} • {user.role}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                        {user.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      Last login: {user.lastLogin}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </Card>

        {/* Audit Logs */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <h3 className="text-white">Recent Activity</h3>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{log.user}</p>
                        <p className="text-xs text-slate-600 mt-1">{log.action}</p>
                        <p className="text-xs text-slate-500 mt-1">{log.timestamp}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                        {log.status}
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

  const renderUserManagementContent = () => (
    <div>
      <div className="flex justify-end mb-6">
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <UserCog className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <p className="text-slate-600 mb-6">Manage system users and their roles.</p>
          <div className="space-y-4">
            {systemUsers.map((user) => (
              <div key={user.id} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-slate-900">{user.name}</h4>
                    <p className="text-sm text-slate-500">{user.id} • {user.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">Remove</Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {user.permissions.map((perm, idx) => (
                    <Badge key={idx} variant="secondary">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSystemSettingsContent = () => (
    <div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>System Name</Label>
                <Input defaultValue="Informatics College Enrollment System" />
              </div>
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select defaultValue="2024-2025">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Enrollment Period</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" />
                  <Input type="date" />
                </div>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Save Changes</Button>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4 mt-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  <h4 className="text-yellow-900">Security Settings</h4>
                </div>
                <p className="text-sm text-yellow-700">Configure system-wide security policies.</p>
              </div>
              <div className="space-y-2">
                <Label>Password Policy</Label>
                <Select defaultValue="strong">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                    <SelectItem value="maximum">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input type="number" defaultValue="30" />
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Update Security</Button>
            </TabsContent>
            
            <TabsContent value="database" className="space-y-4 mt-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h4 className="text-blue-900">Database Management</h4>
                </div>
                <p className="text-sm text-blue-700">Backup and maintenance operations.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">Backup Database</Button>
                <Button variant="outline">Restore Database</Button>
              </div>
              <div className="space-y-2">
                <Label>Last Backup</Label>
                <Input disabled value="Dec 10, 2024 08:00 AM" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'User Management', icon: UserCog },
    { name: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Superadmin Dashboard
            </h1>
            <p className="text-slate-600">Full system control and management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-900">Superadmin</p>
                <p className="text-xs text-slate-500">Full Access</p>
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
            {activeSection === 'User Management' && renderUserManagementContent()}
            {activeSection === 'System Settings' && renderSystemSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
