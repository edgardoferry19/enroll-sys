import db, { run, query } from './connection';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  try {
    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'admin', 'superadmin', 'dean', 'registrar')),
        email TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    console.log('✅ Users table created');

    // Create index on username and role
    db.exec('CREATE INDEX IF NOT EXISTS idx_username ON users(username)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_role ON users(role)');

    // Create students table
    db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        student_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        middle_name TEXT,
        last_name TEXT NOT NULL,
        suffix TEXT,
        student_type TEXT NOT NULL CHECK(student_type IN ('New', 'Transferee', 'Returning', 'Continuing', 'Scholar')),
        course TEXT,
        year_level INTEGER,
        contact_number TEXT,
        address TEXT,
        birth_date TEXT,
        gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
        cor_status TEXT DEFAULT 'Updated',
        grades_complete INTEGER DEFAULT 0,
        clearance_status TEXT DEFAULT 'Clear',
        status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Graduated')),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Students table created');

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_student_id ON students(student_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_student_type ON students(student_type)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_status ON students(status)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_cor_status ON students(cor_status)');

    // Create enrollments table
    db.exec(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        school_year TEXT NOT NULL,
        semester TEXT NOT NULL CHECK(semester IN ('1st', '2nd', 'Summer')),
        status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'For Assessment', 'Assessed', 'For Approval', 'Approved', 'Enrolled', 'Rejected')),
        enrollment_date TEXT DEFAULT (datetime('now')),
        assessed_by INTEGER,
        assessed_at TEXT,
        approved_by INTEGER,
        approved_at TEXT,
        total_units INTEGER DEFAULT 0,
        total_amount REAL DEFAULT 0.00,
        remarks TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (assessed_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Enrollments table created');

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_student_enrollment ON enrollments(student_id, school_year, semester)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_enrollment_status ON enrollments(status)');

    // Create subjects table
    db.exec(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_code TEXT UNIQUE NOT NULL,
        subject_name TEXT NOT NULL,
        description TEXT,
        units INTEGER NOT NULL,
        course TEXT,
        year_level INTEGER,
        semester TEXT CHECK(semester IN ('1st', '2nd', 'Summer')),
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    console.log('✅ Subjects table created');

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_subject_code ON subjects(subject_code)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_course_year ON subjects(course, year_level)');

    // Create enrollment_subjects table
    db.exec(`
      CREATE TABLE IF NOT EXISTS enrollment_subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enrollment_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        schedule TEXT,
        room TEXT,
        instructor TEXT,
        status TEXT DEFAULT 'Enrolled' CHECK(status IN ('Enrolled', 'Dropped', 'Completed')),
        grade TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE(enrollment_id, subject_id)
      )
    `);
    console.log('✅ Enrollment subjects table created');

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_enrollment_subjects_enrollment ON enrollment_subjects(enrollment_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_enrollment_subjects_subject ON enrollment_subjects(subject_id)');

    // Create documents table
    db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        enrollment_id INTEGER,
        document_type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        upload_date TEXT DEFAULT (datetime('now')),
        status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Verified', 'Rejected')),
        verified_by INTEGER,
        verified_at TEXT,
        remarks TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Documents table created');

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_student_docs ON documents(student_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_enrollment_docs ON documents(enrollment_id)');

    // Create transactions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enrollment_id INTEGER NOT NULL,
        transaction_type TEXT NOT NULL CHECK(transaction_type IN ('Enrollment Fee', 'Tuition', 'Miscellaneous', 'Refund', 'Other')),
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL CHECK(payment_method IN ('Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Online Payment', 'Check')),
        reference_number TEXT,
        payment_date TEXT DEFAULT (datetime('now')),
        processed_by INTEGER,
        status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Completed', 'Cancelled', 'Refunded')),
        remarks TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
        FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Transactions table created');

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_enrollment_transactions ON transactions(enrollment_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_transaction_reference ON transactions(reference_number)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_transaction_status ON transactions(status)');

    // Create activity_logs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id INTEGER,
        description TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Activity logs table created');

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_user_activity ON activity_logs(user_id, created_at)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_entity ON activity_logs(entity_type, entity_id)');

    // Create faculty table (not users, just records)
    db.exec(`
      CREATE TABLE IF NOT EXISTS faculty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        faculty_id TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        middle_name TEXT,
        last_name TEXT NOT NULL,
        suffix TEXT,
        department TEXT,
        specialization TEXT,
        email TEXT,
        contact_number TEXT,
        status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'On Leave')),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    console.log('✅ Faculty table created');
    db.exec('CREATE INDEX IF NOT EXISTS idx_faculty_id ON faculty(faculty_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department)');

    // Create sections table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_code TEXT UNIQUE NOT NULL,
        section_name TEXT NOT NULL,
        course TEXT NOT NULL,
        year_level INTEGER NOT NULL,
        school_year TEXT NOT NULL,
        semester TEXT CHECK(semester IN ('1st', '2nd', 'Summer')),
        capacity INTEGER DEFAULT 50,
        current_enrollment INTEGER DEFAULT 0,
        adviser_id INTEGER,
        status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Closed')),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (adviser_id) REFERENCES faculty(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Sections table created');
    db.exec('CREATE INDEX IF NOT EXISTS idx_section_code ON sections(section_code)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_section_course ON sections(course, year_level)');

    // Create school_years table
    db.exec(`
      CREATE TABLE IF NOT EXISTS school_years (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_year TEXT UNIQUE NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        enrollment_start TEXT,
        enrollment_end TEXT,
        is_active INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    console.log('✅ School years table created');
    db.exec('CREATE INDEX IF NOT EXISTS idx_school_year ON school_years(school_year)');

    // Create programs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        program_code TEXT UNIQUE NOT NULL,
        program_name TEXT NOT NULL,
        description TEXT,
        department TEXT,
        degree_type TEXT CHECK(degree_type IN ('Bachelor', 'Associate', 'Master', 'Doctorate')),
        duration_years INTEGER,
        total_units INTEGER,
        status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Archived')),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    console.log('✅ Programs table created');
    db.exec('CREATE INDEX IF NOT EXISTS idx_program_code ON programs(program_code)');

    // Create curriculum table
    db.exec(`
      CREATE TABLE IF NOT EXISTS curriculum (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        program_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        year_level INTEGER NOT NULL,
        semester TEXT CHECK(semester IN ('1st', '2nd', 'Summer')),
        is_core INTEGER DEFAULT 1,
        prerequisite_subject_id INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (prerequisite_subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
        UNIQUE(program_id, subject_id, year_level, semester)
      )
    `);
    console.log('✅ Curriculum table created');
    db.exec('CREATE INDEX IF NOT EXISTS idx_curriculum_program ON curriculum(program_id)');

    // Create clearances table
    db.exec(`
      CREATE TABLE IF NOT EXISTS clearances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        clearance_type TEXT NOT NULL,
        status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Cleared', 'Blocked')),
        issue_description TEXT,
        resolved_at TEXT,
        resolved_by INTEGER,
        remarks TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Clearances table created');
    db.exec('CREATE INDEX IF NOT EXISTS idx_clearance_student ON clearances(student_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_clearance_status ON clearances(status)');

    // Create cors table (Certificate of Registration)
    db.exec(`
      CREATE TABLE IF NOT EXISTS cors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        enrollment_id INTEGER NOT NULL,
        cor_number TEXT UNIQUE,
        status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Generated', 'Approved', 'Printed')),
        generated_at TEXT,
        generated_by INTEGER,
        printed_at TEXT,
        printed_by INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
        FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (printed_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ CORs table created');
    db.exec('CREATE INDEX IF NOT EXISTS idx_cor_student ON cors(student_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_cor_enrollment ON cors(enrollment_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_cor_number ON cors(cor_number)');

    // Update subjects table to add subject_type (SHS or College)
    try {
      // Check if column exists
      const tableInfo = db.prepare("PRAGMA table_info(subjects)").all();
      const hasSubjectType = tableInfo.some((col: any) => col.name === 'subject_type');
      
      if (!hasSubjectType) {
        db.exec(`
          ALTER TABLE subjects ADD COLUMN subject_type TEXT DEFAULT 'College' CHECK(subject_type IN ('SHS', 'College'))
        `);
        console.log('✅ Added subject_type column to subjects table');
      }
    } catch (error) {
      // Column might already exist, ignore error
      console.log('⚠️ subject_type column may already exist');
    }

    // Insert default admin users (password: admin123)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const defaultUsers = [
      ['superadmin', hashedPassword, 'superadmin', 'superadmin@informatics.edu'],
      ['admin1', hashedPassword, 'admin', 'admin@informatics.edu'],
      ['dean1', hashedPassword, 'dean', 'dean@informatics.edu'],
      ['registrar1', hashedPassword, 'registrar', 'registrar@informatics.edu']
    ];

    const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password, role, email) VALUES (?, ?, ?, ?)');
    const insertManyUsers = db.transaction((users: any[]) => {
      for (const user of users) {
        insertUser.run(user);
      }
    });
    
    insertManyUsers(defaultUsers);
    console.log('✅ Default users created');

    // Insert sample subjects
    const sampleSubjects = [
      ['CS101', 'Introduction to Computer Science', 3, 'BSCS', 1, '1st'],
      ['MATH101', 'College Algebra', 3, 'BSCS', 1, '1st'],
      ['ENG101', 'Communication Skills 1', 3, 'BSCS', 1, '1st'],
      ['PE101', 'Physical Education 1', 2, 'BSCS', 1, '1st'],
      ['NSTP101', 'National Service Training Program 1', 3, 'BSCS', 1, '1st'],
      ['CS102', 'Programming Fundamentals', 3, 'BSCS', 1, '2nd'],
      ['MATH102', 'Trigonometry', 3, 'BSCS', 1, '2nd'],
      ['ENG102', 'Communication Skills 2', 3, 'BSCS', 1, '2nd'],
      ['IT101', 'Introduction to Information Technology', 3, 'BSIT', 1, '1st'],
      ['IT102', 'Web Development Basics', 3, 'BSIT', 1, '2nd']
    ];

    const insertSubject = db.prepare('INSERT OR IGNORE INTO subjects (subject_code, subject_name, units, course, year_level, semester) VALUES (?, ?, ?, ?, ?, ?)');
    const insertManySubjects = db.transaction((subjects: any[]) => {
      for (const subject of subjects) {
        insertSubject.run(subject);
      }
    });
    
    insertManySubjects(sampleSubjects);
    console.log('✅ Sample subjects created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nDefault credentials:');
    console.log('  Superadmin: superadmin / admin123');
    console.log('  Admin: admin1 / admin123');
    console.log('  Dean: dean1 / admin123');
    console.log('  Registrar: registrar1 / admin123');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase().then(() => {
  db.close();
  process.exit(0);
}).catch((error) => {
  console.error('❌ Setup failed:', error);
  db.close();
  process.exit(1);
});
