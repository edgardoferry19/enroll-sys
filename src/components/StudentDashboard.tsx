import React, { useState, useEffect } from 'react';
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
import { Card } from './ui/card';
import { Badge } from './ui/badge';
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
  const [enrollmentDetails, setEnrollmentDetails] = useState<any>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, File>>({});
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [semester, setSemester] = useState('1st Semester');
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    contact_number: '',
    address: '',
    birth_date: '',
    gender: '',
    username: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch student data on mount
  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch student profile
      const profile = await studentService.getProfile();
      const student = profile.student || profile.data?.student || profile;
      setStudentProfile(student);
      
      // Update profile form with fetched data
      if (student) {
        setProfileForm({
          first_name: student.first_name || '',
          middle_name: student.middle_name || '',
          last_name: student.last_name || '',
          suffix: student.suffix || '',
          contact_number: student.contact_number || '',
          address: student.address || '',
          birth_date: student.birth_date || '',
          gender: student.gender || '',
          username: student.username || ''
        });
      }
      
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
        setEnrollmentDetails(details.enrollment || details);
        const subjects = (details.enrollment?.enrollment_subjects || details.enrollment_subjects || []);
        setCurrentCourses(subjects.map((es: any) => ({
          code: es.subject?.subject_code || '',
          name: es.subject?.subject_name || '',
          instructor: es.instructor || 'TBA',
          units: es.subject?.units || 0,
          schedule: es.schedule || '',
          room: es.room || '',
          subject_id: es.subject_id || es.subject?.id
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

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await studentService.updateProfile(profileForm);
      alert('Profile updated successfully');
      await fetchStudentData();
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await studentService.changePassword(passwordForm.newPassword);
      alert('Password changed successfully');
      setPasswordForm({
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      alert(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Status Alert */}
        {enrollmentStatus === 'approved' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Enrollment Approved</AlertTitle>
            <AlertDescription className="text-green-700">
              You can now manage subjects and view your schedule.
            </AlertDescription>
          </Alert>
        )}

        {enrollmentStatus === 'pending' && (
          <Alert className="bg-orange-50 border-orange-200">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900">Enrollment Pending</AlertTitle>
            <AlertDescription className="text-orange-700">
              Your enrollment is awaiting admin approval.
            </AlertDescription>
          </Alert>
        )}

        {enrollmentStatus === 'rejected' && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">Enrollment Rejected</AlertTitle>
            <AlertDescription className="text-red-700">
              Please contact the admin office for more information.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Courses */}
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Current Enrolled Subjects</h3>
            {currentCourses.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No enrolled subjects</p>
            ) : (
              <div className="space-y-3">
                {currentCourses.map((course, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-blue-100 text-blue-700 border-0">
                            {course.code}
                          </Badge>
                          <span className="text-slate-900 font-medium">{course.name}</span>
                        </div>
                        <p className="text-sm text-slate-500">Instructor: {course.instructor}</p>
                        {course.schedule && (
                          <p className="text-sm text-slate-500">Schedule: {course.schedule}</p>
                        )}
                        {course.room && (
                          <p className="text-sm text-slate-500">Room: {course.room}</p>
                        )}
                      </div>
                      <Badge variant="outline">{course.units} Units</Badge>
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

  const renderSubjectsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    // Get enrolled subject IDs from current courses
    const enrolledSubjectIds = currentCourses.map((c: any) => c.subject_id).filter((id: any) => id);

    return (
      <div>
        {enrollmentStatus !== 'approved' && (
          <Alert className="mb-4 bg-orange-50 border-orange-200">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900">Enrollment Required</AlertTitle>
            <AlertDescription className="text-orange-700">
              You must complete and get approval for enrollment before you can manage subjects.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Available Subjects</h3>
            <p className="text-slate-600">Browse and enroll in available subjects for your course.</p>
          </div>

          {availableSubjects.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No subjects available</p>
          ) : (
            <div className="space-y-3">
              {availableSubjects.map((subject, index) => {
                const isEnrolledSubject = enrolledSubjectIds.includes(subject.subjectId);
                return (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-4 transition-colors ${
                      enrollmentStatus === 'approved' ? 'hover:bg-slate-50' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700 border-0">
                            {subject.code}
                          </Badge>
                          <span className="text-slate-900 font-medium">{subject.name}</span>
                          {isEnrolledSubject && (
                            <Badge className="bg-green-100 text-green-700 border-0">Enrolled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">Units: {subject.units}</p>
                        {subject.course && (
                          <p className="text-sm text-slate-500">Course: {subject.course}</p>
                        )}
                      </div>
                      {enrollmentStatus === 'approved' && currentEnrollment && (
                        <div className="flex gap-2">
                          {!isEnrolledSubject ? (
                            <Button 
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-indigo-600"
                              onClick={() => handleAddSubject(subject.subjectId)}
                            >
                              Add Subject
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleRemoveSubject(subject.subjectId)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderScheduleContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    // Group schedule by day for better display
    const scheduleByDay: Record<string, any[]> = {};
    currentCourses.forEach((course: any) => {
      if (course.schedule) {
        const parts = course.schedule.split(' ');
        const day = parts[0] || 'TBA';
        const time = parts.slice(1).join(' ') || 'TBA';
        if (!scheduleByDay[day]) {
          scheduleByDay[day] = [];
        }
        scheduleByDay[day].push({
          code: course.code,
          name: course.name,
          time,
          room: course.room || 'TBA',
          instructor: course.instructor || 'TBA'
        });
      }
    });

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedDays = Object.keys(scheduleByDay).sort((a, b) => {
      const aIndex = daysOrder.indexOf(a);
      const bIndex = daysOrder.indexOf(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return (
      <div>
        <Card className="border-0 shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">My Class Schedule</h3>
          
          {currentEnrollment && (
            <div className="mb-6 text-sm text-slate-600">
              <p>School Year: {currentEnrollment.school_year || 'N/A'}</p>
              <p>Semester: {currentEnrollment.semester || 'N/A'}</p>
            </div>
          )}

          {sortedDays.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No schedule available</p>
          ) : (
            <div className="space-y-4">
              {sortedDays.map((day) => (
                <div key={day} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">{day}</h4>
                  <div className="space-y-2">
                    {scheduleByDay[day].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-100 text-blue-700 border-0">{item.code}</Badge>
                            <span className="text-slate-900">{item.name}</span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {item.time} • Room: {item.room} • Instructor: {item.instructor}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderProfileContent = () => {
    if (loading || !studentProfile) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div>
        <Card className="border-0 shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-6">My Profile</h3>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-md font-medium mb-4">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-first-name">First Name</Label>
                  <Input 
                    id="profile-first-name"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-last-name">Last Name</Label>
                  <Input 
                    id="profile-last-name"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-middle-name">Middle Name</Label>
                  <Input 
                    id="profile-middle-name"
                    value={profileForm.middle_name}
                    onChange={(e) => setProfileForm({ ...profileForm, middle_name: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-birth-date">Birth Date</Label>
                  <Input 
                    id="profile-birth-date"
                    type="date"
                    value={profileForm.birth_date ? profileForm.birth_date.split('T')[0] : ''}
                    onChange={(e) => setProfileForm({ ...profileForm, birth_date: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-gender">Gender</Label>
                  <Select
                    value={profileForm.gender}
                    onValueChange={(value) => setProfileForm({ ...profileForm, gender: value })}
                  >
                    <SelectTrigger id="profile-gender" className="mt-2">
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
                  <Label htmlFor="profile-contact">Contact Number</Label>
                  <Input 
                    id="profile-contact"
                    value={profileForm.contact_number}
                    onChange={(e) => setProfileForm({ ...profileForm, contact_number: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium mb-4">Contact Information</h4>
              <div>
                <Label htmlFor="profile-address">Address</Label>
                <Input 
                  id="profile-address"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Account Credentials */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium mb-4">Account Credentials</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-username">Username</Label>
                  <Input 
                    id="profile-username"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="mt-2"
                    placeholder="Enter username"
                  />
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium mb-4">Change Password</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="mt-2"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="mt-2"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleChangePassword}
                disabled={loading || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>

            {/* Student Information (Read-only) */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium mb-4">Student Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Student ID</p>
                  <p className="font-medium">{studentProfile.student_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Course</p>
                  <p className="font-medium">{studentProfile.course || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Year Level</p>
                  <p className="font-medium">{studentProfile.year_level ? `${studentProfile.year_level}${studentProfile.year_level === 1 ? 'st' : studentProfile.year_level === 2 ? 'nd' : studentProfile.year_level === 3 ? 'rd' : 'th'} Year` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Student Type</p>
                  <p className="font-medium">{studentProfile.student_type || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t pt-6">
              <Button 
                variant="outline"
                onClick={() => {
                  setProfileForm({
                    first_name: studentProfile.first_name || '',
                    middle_name: studentProfile.middle_name || '',
                    last_name: studentProfile.last_name || '',
                    suffix: studentProfile.suffix || '',
                    contact_number: studentProfile.contact_number || '',
                    address: studentProfile.address || '',
                    birth_date: studentProfile.birth_date || '',
                    gender: studentProfile.gender || '',
                    username: studentProfile.username || ''
                  });
                }}
              >
                Reset
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile Changes'
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

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
