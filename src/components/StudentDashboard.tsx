import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  User, 
  LogOut, 
  LayoutDashboard, 
  ClipboardCheck, 
  BookOpen,
  Calendar as CalendarIcon,
  UserCircle,
  GraduationCap,
  Clock,
  CheckCircle2,
  Upload,
  Download,
  Check,
  AlertCircle,
  Bell,
  Loader2
} from 'lucide-react';
import { enrollmentService } from '../services/enrollment.service';
import { studentService } from '../services/student.service';
import { subjectService } from '../services/subject.service';
import { Calendar } from './ui/calendar';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { DocumentUpload } from './ui/document-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface StudentDashboardProps {
  onLogout: () => void;
}

export default function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studentType, setStudentType] = useState<string>('');
  const [enrollmentStep, setEnrollmentStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('basic-info');
  const [enrollmentStatus, setEnrollmentStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [hasNewNotification, setHasNewNotification] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentEnrollment, setCurrentEnrollment] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [currentCourses, setCurrentCourses] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, File>>({});
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [semester, setSemester] = useState('1st Semester');

  // Fetch student data on mount
  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch student profile
      const profile = await studentService.getProfile();
      setStudentProfile(profile.student);
      
      // Fetch enrollments
      const enrollmentsData = await enrollmentService.getMyEnrollments();
      const enrollmentsList = enrollmentsData.enrollments || [];
      setEnrollments(enrollmentsList);
      
      // Find current enrollment
      const current = enrollmentsList.find((e: any) => 
        e.status === 'Approved' || e.status === 'Pending'
      );
      setCurrentEnrollment(current);
      
      if (current) {
        setEnrollmentStatus(
          current.status === 'Approved' ? 'approved' :
          current.status === 'Pending' ? 'pending' :
          current.status === 'Rejected' ? 'rejected' : 'none'
        );
        
        // Fetch enrollment details with subjects
        const details = await enrollmentService.getEnrollmentDetails(current.id);
        const subjects = details.enrollment?.enrollment_subjects || [];
        setCurrentCourses(subjects.map((es: any) => ({
          code: es.subject?.subject_code || '',
          name: es.subject?.subject_name || '',
          instructor: es.instructor || 'TBA',
          units: es.subject?.units || 0,
          schedule: es.schedule || '',
          room: es.room || ''
        })));
        
        // Build schedule from subjects
        const scheduleList = subjects.map((es: any) => ({
          day: es.schedule?.split(' ')[0] || 'TBA',
          time: es.schedule?.split(' ').slice(1).join(' ') || 'TBA',
          subject: es.subject?.subject_code || '',
          room: es.room || 'TBA'
        }));
        setSchedule(scheduleList);
      }
      
      // Fetch available subjects
      const subjectsData = await subjectService.getAllSubjects();
      const subjectsList = subjectsData.subjects || [];
      setAvailableSubjects(subjectsList.map((s: any) => ({
        code: s.subject_code,
        name: s.subject_name,
        instructor: 'TBA',
        units: s.units || 0,
        schedule: 'TBA',
        subjectId: s.id
      })));
      
    } catch (error: any) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: 'Total Enrollments', 
      value: enrollments.length.toString(), 
      icon: ClipboardCheck, 
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      label: 'Approved', 
      value: enrollments.filter((e: any) => e.status === 'Approved').length.toString(), 
      icon: CheckCircle2, 
      color: 'from-green-500 to-green-600' 
    },
    { 
      label: 'Pending', 
      value: enrollments.filter((e: any) => e.status === 'Pending').length.toString(), 
      icon: Clock, 
      color: 'from-orange-500 to-orange-600' 
    },
  ];

  const toggleSubject = (code: string) => {
    if (enrollmentStatus !== 'approved') return;
    
    setSelectedSubjects(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleSubmitForAssessment = async () => {
    try {
      setLoading(true);
      
      // Create enrollment
      const enrollment = await enrollmentService.createEnrollment(schoolYear, semester);
      
      // Upload documents if any
      for (const [docType, file] of Object.entries(uploadedDocuments)) {
        if (file instanceof File) {
          await studentService.uploadDocument(file, docType, enrollment.enrollment.id);
        }
      }
      
      // Submit for assessment
      await enrollmentService.submitForAssessment(enrollment.enrollment.id);
      
      setEnrollmentStatus('pending');
      setEnrollmentStep(1);
      setStudentType('');
      setUploadedDocuments({});
      setActiveSection('Dashboard');
      await fetchStudentData();
    } catch (error: any) {
      alert(error.message || 'Failed to submit enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = (docType: string, file: File | null) => {
    if (file === null) {
      const updated = { ...uploadedDocuments };
      delete updated[docType];
      setUploadedDocuments(updated);
    } else {
      setUploadedDocuments({...uploadedDocuments, [docType]: file});
    }
  };

  const handleAddSubject = async (subjectId: number) => {
    if (!currentEnrollment) return;
    
    try {
      await enrollmentService.addSubject(currentEnrollment.id, subjectId);
      await fetchStudentData();
    } catch (error: any) {
      alert(error.message || 'Failed to add subject');
    }
  };

  const handleRemoveSubject = async (subjectId: number) => {
    if (!currentEnrollment) return;
    
    try {
      await enrollmentService.removeSubject(currentEnrollment.id, subjectId);
      await fetchStudentData();
    } catch (error: any) {
      alert(error.message || 'Failed to remove subject');
    }
  };

  const handleViewNotification = () => {
    setShowNotification(true);
    setHasNewNotification(false);
  };

  const renderDashboardContent = () => (
    <div className="space-y-4">
      {/* Approval Notification */}
      {enrollmentStatus === 'approved' && showNotification && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Pre-Enrollment Approved!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your pre-enrollment has been approved. You can now add subjects in the Subjects tab and proceed to payment.
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Status Alert */}
      {enrollmentStatus === 'pending' && (
        <Alert className="bg-orange-50 border-orange-200">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900">Pre-Enrollment Pending</AlertTitle>
          <AlertDescription className="text-orange-700">
            Your pre-enrollment is currently pending admin approval. Please wait for confirmation before adding subjects.
          </AlertDescription>
        </Alert>
      )}

      {/* Rejected Status Alert */}
      {enrollmentStatus === 'rejected' && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Pre-Enrollment Rejected</AlertTitle>
          <AlertDescription className="text-red-700">
            Your pre-enrollment has been rejected. Please contact the admin office for more information.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Current Courses and Schedule */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Courses */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
              <h3 className="text-white text-lg">Current Enrolled Courses</h3>
            </div>
            <ScrollArea className="h-[280px]">
              <div className="p-4">
                <div className="space-y-2">
                  {currentCourses.map((course, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-2 py-0">
                              {course.code}
                            </Badge>
                            <span className="text-sm text-slate-900 truncate">{course.name}</span>
                          </div>
                          <p className="text-xs text-slate-500">Instructor: {course.instructor}</p>
                        </div>
                        <Badge variant="outline" className="text-slate-600 text-xs ml-2 shrink-0">
                          {course.units} Units
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </Card>

          {/* Schedule */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
              <h3 className="text-white text-lg">This Week's Schedule</h3>
            </div>
            <ScrollArea className="h-[240px]">
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {schedule.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="w-12 shrink-0">
                        <p className="text-xs text-slate-900">{item.day}</p>
                        <p className="text-xs text-slate-500">{item.time}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900">{item.subject}</p>
                        <p className="text-xs text-slate-500">{item.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Calendar */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3">
              <h3 className="text-white text-lg">Academic Calendar</h3>
            </div>
            <div className="p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md scale-90 -my-2"
              />
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg p-4">
            <h4 className="mb-3 text-slate-900">Quick Actions</h4>
            <div className="space-y-2">
              <Button 
                onClick={() => setActiveSection('Enroll')}
                className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-9 text-sm"
                disabled={enrollmentStatus === 'pending'}
              >
                <ClipboardCheck className="h-4 w-4" />
                New Enrollment
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-9 text-sm"
                disabled={enrollmentStatus !== 'approved'}
              >
                <BookOpen className="h-4 w-4" />
                View Grades
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
                <CalendarIcon className="h-4 w-4" />
                Class Schedule
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderEnrollmentContent = () => (
    <div>
      {enrollmentStatus === 'pending' && (
        <Card className="border-0 shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-xl mb-2">Pre-Enrollment Pending</h3>
          <p className="text-slate-600 mb-4">Your pre-enrollment is awaiting admin approval.</p>
          <Badge className="bg-orange-100 text-orange-700 border-0">Pending Assessment</Badge>
        </Card>
      )}

      {enrollmentStatus === 'approved' && (
        <Card className="border-0 shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl mb-2">Pre-Enrollment Approved!</h3>
          <p className="text-slate-600 mb-4">You can now add subjects and proceed to payment.</p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => setActiveSection('Subjects')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Add Subjects
            </Button>
            <Button 
              onClick={() => {
                setEnrollmentStep(1);
                setStudentType('');
              }}
              variant="outline"
            >
              Start New Enrollment
            </Button>
          </div>
        </Card>
      )}

      {enrollmentStatus !== 'pending' && enrollmentStatus !== 'approved' && (
        <Card className="border-0 shadow-lg p-6">
          {/* Student Type Selection */}
          {enrollmentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="student-type">Select Student Type</Label>
                <Select value={studentType} onValueChange={setStudentType}>
                  <SelectTrigger id="student-type" className="mt-2">
                    <SelectValue placeholder="Choose student type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Student</SelectItem>
                    <SelectItem value="transferee">Transferee</SelectItem>
                    <SelectItem value="returning">Returning Student</SelectItem>
                    <SelectItem value="continuing">Continuing Student</SelectItem>
                    <SelectItem value="scholar">Scholar Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {studentType && (
                <Button 
                  onClick={() => setEnrollmentStep(2)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Next
                </Button>
              )}
            </div>
          )}

          {/* New Student */}
          {enrollmentStep === 2 && studentType === 'new' && (
            <div className="space-y-4">
              <h3 className="text-lg mb-4">New Student - Upload Requirements</h3>
              
              <DocumentUpload
                label="Form 137"
                description="Upload your Form 137 (Report Card)"
                docType="form137"
                onFileSelect={handleDocumentUpload}
                selectedFile={uploadedDocuments['form137']}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <DocumentUpload
                label="Form 138"
                description="Upload your Form 138 (Transcript of Records)"
                docType="form138"
                onFileSelect={handleDocumentUpload}
                selectedFile={uploadedDocuments['form138']}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <DocumentUpload
                label="Birth Certificate"
                description="Upload a copy of your Birth Certificate"
                docType="birth_certificate"
                onFileSelect={handleDocumentUpload}
                selectedFile={uploadedDocuments['birth_certificate']}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <DocumentUpload
                label="Good Moral Certificate"
                description="Upload your Good Moral Certificate"
                docType="moral_certificate"
                onFileSelect={handleDocumentUpload}
                selectedFile={uploadedDocuments['moral_certificate']}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Download Admission Forms</Label>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Download and fill out the admission forms</p>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setEnrollmentStep(1)}>Back</Button>
                <Button 
                  onClick={handleSubmitForAssessment}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Submit for Assessment
                </Button>
              </div>
            </div>
          )}

          {/* Transferee */}
          {enrollmentStep === 2 && studentType === 'transferee' && (
            <div className="space-y-4">
              <h3 className="text-lg mb-4">Transferee - Upload Requirements</h3>
              
              <DocumentUpload
                label="Transcript of Records (TOR)"
                description="Upload your official TOR from previous school"
                docType="tor"
                onFileSelect={handleDocumentUpload}
                selectedFile={uploadedDocuments['tor']}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <DocumentUpload
                label="Certificate of Transfer"
                description="Upload your Certificate of Transfer/Honorable Dismissal"
                docType="certificate_transfer"
                onFileSelect={handleDocumentUpload}
                selectedFile={uploadedDocuments['certificate_transfer']}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <DocumentUpload
                label="Other Requirements"
                description="Upload any additional required documents"
                docType="other_requirements"
                onFileSelect={handleDocumentUpload}
                selectedFile={uploadedDocuments['other_requirements']}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setEnrollmentStep(1)}>Back</Button>
                <Button 
                  onClick={handleSubmitForAssessment}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Submit for Assessment
                </Button>
              </div>
            </div>
          )}

          {/* Returning Student */}
          {enrollmentStep === 2 && studentType === 'returning' && (
            <div className="space-y-4">
              <h3 className="text-lg mb-4">Returning Student - Upload Requirements</h3>
              
              <DocumentUpload
                label="Clearance"
                description="Upload your clearance from previous term"
                docType="clearance"
                onFileSelect={handleDocumentUpload}
                selectedFile={uploadedDocuments['clearance']}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <DocumentUpload
                label="Update Forms"
                description="Upload completed update forms"
                docType="update_forms"
                onFileSelect={handleDocumentUpload}
                selectedFile={uploadedDocuments['update_forms']}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setEnrollmentStep(1)}>Back</Button>
                <Button 
                  onClick={handleSubmitForAssessment}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Submit for Assessment
                </Button>
              </div>
            </div>
          )}

          {/* Continuing Student */}
          {enrollmentStep === 2 && studentType === 'continuing' && (
            <div className="space-y-4">
              <h3 className="text-lg mb-4">Continuing Student</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="mb-2">Previous Term Data</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-slate-600">Term:</span> 1st Semester 2023-2024</p>
                  <p><span className="text-slate-600">Program:</span> BSIT</p>
                  <p><span className="text-slate-600">Year Level:</span> 2nd Year</p>
                  <p><span className="text-slate-600">GPA:</span> 3.5</p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setEnrollmentStep(1)}>Back</Button>
                <Button 
                  onClick={handleSubmitForAssessment}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Submit for Assessment
                </Button>
              </div>
            </div>
          )}

          {/* Scholar Student */}
          {enrollmentStep === 2 && studentType === 'scholar' && (
            <div className="space-y-4">
              <h3 className="text-lg mb-4">Scholar Student</h3>
              
              <div className="border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Scholarship Application Form</Label>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Download the scholarship application form</p>
              </div>

              <Button 
                onClick={() => setEnrollmentStep(3)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                Next
              </Button>
            </div>
          )}

          {enrollmentStep === 3 && studentType === 'scholar' && (
            <div className="space-y-4">
              <h3 className="text-lg mb-4">Upload Scholarship Documents</h3>
              
              <DocumentUpload
                label="Scholarship Application Form"
                description="Upload completed scholarship application"
                docType="scholarship_application"
                onFileSelect={handleDocumentUpload}
                selectedFile={uploadedDocuments['scholarship_application']}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <DocumentUpload
                label="Supporting Documents"
                description="Upload required supporting documents"
                docType="scholarship_supporting"
                onFileSelect={handleDocumentUpload}
                selectedFile={uploadedDocuments['scholarship_supporting']}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setEnrollmentStep(2)}>Back</Button>
                <Button 
                  onClick={handleSubmitForAssessment}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Submit for Assessment
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );

  const renderSubjectsContent = () => (
    <div>
      {enrollmentStatus !== 'approved' && (
        <Alert className="mb-4 bg-orange-50 border-orange-200">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900">Pre-Enrollment Required</AlertTitle>
          <AlertDescription className="text-orange-700">
            You must complete and get approval for pre-enrollment before you can add subjects and proceed to payment.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-0 shadow-lg p-6">
        <p className="text-slate-600 mb-6">Browse and enroll in available subjects.</p>
        
        {selectedSubjects.length > 0 && enrollmentStatus === 'approved' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm mb-2">
              <span className="font-medium">{selectedSubjects.length}</span> subject(s) selected
            </p>
            <div className="bg-slate-100 rounded-lg p-3 mb-3">
              <p className="text-xs text-slate-600 mb-2">Tuition Computation:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Tuition Fee ({selectedSubjects.length * 3} units):</span>
                  <span>₱{(selectedSubjects.length * 3 * 1500).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Laboratory Fee:</span>
                  <span>₱2,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Miscellaneous:</span>
                  <span>₱3,000</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-medium">₱{((selectedSubjects.length * 3 * 1500) + 2500 + 3000).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
              Proceed to Payment
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {availableSubjects.map((subject, index) => (
            <div 
              key={index} 
              className={`border rounded-lg p-4 transition-colors ${
                enrollmentStatus === 'approved' ? 'hover:bg-slate-50' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox 
                      id={`subject-${index}`}
                      checked={selectedSubjects.includes(subject.code)}
                      onCheckedChange={() => toggleSubject(subject.code)}
                      disabled={enrollmentStatus !== 'approved'}
                    />
                    <label 
                      htmlFor={`subject-${index}`} 
                      className={enrollmentStatus === 'approved' ? 'cursor-pointer' : 'cursor-not-allowed'}
                    >
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                        {subject.code}
                      </Badge>
                      <span className="ml-2 text-slate-900">{subject.name}</span>
                    </label>
                  </div>
                  <p className="text-sm text-slate-500 ml-6">Instructor: {subject.instructor}</p>
                  <p className="text-sm text-slate-500 ml-6">Schedule: {subject.schedule}</p>
                </div>
                <Badge variant="outline" className="text-slate-600">
                  {subject.units} Units
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderScheduleContent = () => (
    <div>
      <Card className="border-0 shadow-lg p-6">
        <p className="text-slate-600 mb-6">Your complete class schedule for the semester.</p>
        <div className="space-y-4">
          {schedule.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-slate-50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-slate-900">{item.subject}</h4>
                  <p className="text-sm text-slate-500">{item.day} • {item.time}</p>
                </div>
                <Badge variant="outline">{item.room}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderProfileContent = () => (
    <div>
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Profile Summary */}
        <div className="col-span-3">
          <Card className="border-0 shadow-lg p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-white" />
            </div>
            <h3 className="mb-1">Juan Dela Cruz</h3>
            <p className="text-sm text-slate-500 mb-4">juan.delacruz@email.com</p>
            
            <div className="space-y-3 text-left">
              <div>
                <p className="text-xs text-slate-500">Course</p>
                <p className="text-sm">BSIT</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Section</p>
                <p className="text-sm">IT-2A</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Semester</p>
                <p className="text-sm">1st Semester 2024-2025</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Content - Tabbed Information */}
        <div className="col-span-9">
          <Card className="border-0 shadow-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b px-6 pt-4">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="basic-info">BASIC INFO</TabsTrigger>
                  <TabsTrigger value="credentials">CREDENTIALS</TabsTrigger>
                  <TabsTrigger value="address">ADDRESS</TabsTrigger>
                  <TabsTrigger value="guardian">GUARDIAN</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="basic-info" className="p-6">
                <div className="space-y-4">
                  <h4 className="mb-4">Personal Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input placeholder="Juan" className="mt-1" />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input placeholder="Dela Cruz" className="mt-1" />
                    </div>
                    <div>
                      <Label>Middle Name</Label>
                      <Input placeholder="Santos" className="mt-1" />
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <Input type="date" className="mt-1" />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Contact Number</Label>
                      <Input placeholder="09XX XXX XXXX" className="mt-1" />
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-6">
                    <h4 className="mb-4">Other Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nationality</Label>
                        <Input placeholder="Filipino" className="mt-1" />
                      </div>
                      <div>
                        <Label>Civil Status</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                    Save Changes
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="credentials" className="p-6">
                <div className="space-y-4">
                  <h4 className="mb-4">Account Credentials</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Email Address</Label>
                      <Input type="email" placeholder="juan.delacruz@email.com" className="mt-1" />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input placeholder="juandelacruz" className="mt-1" />
                    </div>
                    <div>
                      <Label>Current Password</Label>
                      <Input type="password" placeholder="Enter current password" className="mt-1" />
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <Input type="password" placeholder="Enter new password" className="mt-1" />
                    </div>
                    <div>
                      <Label>Confirm Password</Label>
                      <Input type="password" placeholder="Confirm new password" className="mt-1" />
                    </div>
                  </div>
                  <Button className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                    Update Credentials
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="address" className="p-6">
                <div className="space-y-4">
                  <h4 className="mb-4">Address Information</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Street Address</Label>
                      <Input placeholder="123 Rizal Street" className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input placeholder="Manila" className="mt-1" />
                      </div>
                      <div>
                        <Label>Province</Label>
                        <Input placeholder="Metro Manila" className="mt-1" />
                      </div>
                      <div>
                        <Label>Postal Code</Label>
                        <Input placeholder="1000" className="mt-1" />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Input placeholder="Philippines" className="mt-1" />
                      </div>
                    </div>
                  </div>
                  <Button className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                    Save Address
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="guardian" className="p-6">
                <div className="space-y-4">
                  <h4 className="mb-4">Guardian/Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Guardian Name</Label>
                      <Input placeholder="Maria Dela Cruz" className="mt-1" />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input placeholder="Mother" className="mt-1" />
                    </div>
                    <div>
                      <Label>Contact Number</Label>
                      <Input placeholder="09XX XXX XXXX" className="mt-1" />
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <Input type="email" placeholder="maria.delacruz@email.com" className="mt-1" />
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <Input placeholder="123 Rizal Street, Manila" className="mt-1" />
                    </div>
                  </div>
                  <Button className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                    Save Guardian Info
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-slate-200 shadow-xl flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm text-slate-900">IC Northgate</h3>
                <p className="text-xs text-slate-500">Student Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            <button
              onClick={() => setActiveSection('Dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                activeSection === 'Dashboard' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            
            <button
              onClick={() => {
                setActiveSection('Enroll');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                activeSection === 'Enroll' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ClipboardCheck className="h-4 w-4" />
              Enroll
              {enrollmentStatus === 'pending' && (
                <Badge className="ml-auto bg-orange-500 text-white border-0 text-xs px-1.5 py-0">
                  Pending
                </Badge>
              )}
            </button>
            
            <button
              onClick={() => setActiveSection('Subjects')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                activeSection === 'Subjects' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Subjects
            </button>

            <button
              onClick={() => setActiveSection('My Schedule')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                activeSection === 'My Schedule' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              My Schedule
            </button>

            <button
              onClick={() => setActiveSection('My Profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                activeSection === 'My Profile' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <UserCircle className="h-4 w-4" />
              My Profile
            </button>
          </nav>

          <div className="p-3 border-t border-slate-200">
            <Button 
              variant="outline" 
              className="w-full justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-9 text-sm"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl mb-1">
                  {activeSection === 'Dashboard' && 'Student Dashboard'}
                  {activeSection === 'Enroll' && 'Enroll'}
                  {activeSection === 'Subjects' && 'Subjects'}
                  {activeSection === 'My Schedule' && 'My Schedule'}
                  {activeSection === 'My Profile' && 'My Profile'}
                </h1>
                <p className="text-sm text-slate-600">Welcome back to your learning portal</p>
              </div>
              <div className="flex items-center gap-3">
                {hasNewNotification && enrollmentStatus === 'approved' && (
                  <button 
                    onClick={handleViewNotification}
                    className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Bell className="h-5 w-5 text-slate-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                )}
                <div className="text-right">
                  <p className="text-xs text-slate-600">Student ID: 2024-0001</p>
                  <p className="text-xs text-slate-500">BSIT - 2nd Year</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* Stats Grid - Only on Dashboard */}
            {activeSection === 'Dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="p-4 border-0 shadow-lg hover:shadow-xl transition-all bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl mb-1">{stat.value}</h3>
                      <p className="text-xs text-slate-600">{stat.label}</p>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Dynamic Content */}
            {activeSection === 'Dashboard' && renderDashboardContent()}
            {activeSection === 'Enroll' && renderEnrollmentContent()}
            {activeSection === 'Subjects' && renderSubjectsContent()}
            {activeSection === 'My Schedule' && renderScheduleContent()}
            {activeSection === 'My Profile' && renderProfileContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
