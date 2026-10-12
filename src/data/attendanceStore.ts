export interface AdminEntity {
  admin_id: string;
  name: string;
  email: string;
}

export interface TeacherEntity {
  teacher_id: string;
  name: string;
  email: string;
  department: string;
  admin_id: string;
}

export interface ClassEntity {
  class_id: string;
  class_name: string;
  section: string;
}

export interface SubjectEntity {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  teacher_id: string;
  class_id: string;
}

export interface StudentEntity {
  student_id: string;
  roll_no: string;
  name: string;
  email: string;
  class_id: string;
}

export type AttendanceStatus = 'Present' | 'Absent';

export interface AttendanceEntity {
  attendance_id: string;
  student_id: string;
  subject_id: string;
  teacher_id: string;
  class_id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export interface ApiTransactionLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  durationMs: number;
  sqlPreview: string;
  summary: string;
}

export interface DatabaseState {
  admins: AdminEntity[];
  teachers: TeacherEntity[];
  classes: ClassEntity[];
  subjects: SubjectEntity[];
  students: StudentEntity[];
  attendance: AttendanceEntity[];
}

export const INITIAL_DB_STATE: DatabaseState = {
  admins: [
    {
      admin_id: 'ADM-001',
      name: 'Dr. Vikramaditya Rao',
      email: 'vikram.rao@anurag.edu.in',
    },
  ],
  teachers: [
    {
      teacher_id: 'TCH-101',
      name: 'Prof. Ananya Deshmukh',
      email: 'ananya.deshmukh@anurag.edu.in',
      department: 'CSE — Enterprise Systems',
      admin_id: 'ADM-001',
    },
    {
      teacher_id: 'TCH-102',
      name: 'Dr. Siddharth Kulkarni',
      email: 'siddharth.k@anurag.edu.in',
      department: 'CSE — Distributed Computing',
      admin_id: 'ADM-001',
    },
    {
      teacher_id: 'TCH-103',
      name: 'Prof. Meera Nair',
      email: 'meera.nair@anurag.edu.in',
      department: 'CSE — Data Engineering',
      admin_id: 'ADM-001',
    },
  ],
  classes: [
    {
      class_id: 'CLS-01',
      class_name: 'B.Tech CSE III Year',
      section: 'Section A',
    },
    {
      class_id: 'CLS-02',
      class_name: 'B.Tech CSE III Year',
      section: 'Section B',
    },
    {
      class_id: 'CLS-03',
      class_name: 'B.Tech CSE (AI & ML)',
      section: 'Section A',
    },
  ],
  subjects: [
    {
      subject_id: 'SUB-301',
      subject_name: 'Java Spring Boot & Microservices',
      subject_code: 'CS301J',
      teacher_id: 'TCH-101',
      class_id: 'CLS-01',
    },
    {
      subject_id: 'SUB-302',
      subject_name: 'Database Management Systems',
      subject_code: 'CS302D',
      teacher_id: 'TCH-103',
      class_id: 'CLS-01',
    },
    {
      subject_id: 'SUB-303',
      subject_name: 'Cloud Native & Docker Orchestration',
      subject_code: 'CS303C',
      teacher_id: 'TCH-102',
      class_id: 'CLS-01',
    },
    {
      subject_id: 'SUB-304',
      subject_name: 'Enterprise Software Engineering',
      subject_code: 'CS304E',
      teacher_id: 'TCH-101',
      class_id: 'CLS-02',
    },
    {
      subject_id: 'SUB-305',
      subject_name: 'Relational Systems & SQL Architecture',
      subject_code: 'CS305R',
      teacher_id: 'TCH-103',
      class_id: 'CLS-03',
    },
  ],
  students: [
    {
      student_id: 'STU-201',
      roll_no: '25EG505R01',
      name: 'Aarav Sharma',
      email: '25eg505r01@anurag.edu.in',
      class_id: 'CLS-01',
    },
    {
      student_id: 'STU-202',
      roll_no: '25EG505R02',
      name: 'Diya Reddy',
      email: '25eg505r02@anurag.edu.in',
      class_id: 'CLS-01',
    },
    {
      student_id: 'STU-203',
      roll_no: '25EG505R03',
      name: 'Karthikeya Varma',
      email: '25eg505r03@anurag.edu.in',
      class_id: 'CLS-01',
    },
    {
      student_id: 'STU-204',
      roll_no: '25EG505R04',
      name: 'Nandini Iyer',
      email: '25eg505r04@anurag.edu.in',
      class_id: 'CLS-01',
    },
    {
      student_id: 'STU-205',
      roll_no: '25EG505R05',
      name: 'Rohan Chandra',
      email: '25eg505r05@anurag.edu.in',
      class_id: 'CLS-01',
    },
    {
      student_id: 'STU-206',
      roll_no: '25EG505R06',
      name: 'Sneha Patil',
      email: '25eg505r06@anurag.edu.in',
      class_id: 'CLS-01',
    },
    {
      student_id: 'STU-207',
      roll_no: '25EG505R07',
      name: 'Pranav Joshi',
      email: '25eg505r07@anurag.edu.in',
      class_id: 'CLS-02',
    },
    {
      student_id: 'STU-208',
      roll_no: '25EG505R08',
      name: 'Ishita Menon',
      email: '25eg505r08@anurag.edu.in',
      class_id: 'CLS-02',
    },
    {
      student_id: 'STU-209',
      roll_no: '25EG505R09',
      name: 'Aditya Verma',
      email: '25eg505r09@anurag.edu.in',
      class_id: 'CLS-02',
    },
    {
      student_id: 'STU-210',
      roll_no: '25EG505R10',
      name: 'Kavya Krishnan',
      email: '25eg505r10@anurag.edu.in',
      class_id: 'CLS-03',
    },
    {
      student_id: 'STU-211',
      roll_no: '25EG505R11',
      name: 'Harsha Vardhan',
      email: '25eg505r11@anurag.edu.in',
      class_id: 'CLS-03',
    },
  ],
  attendance: [
    // Date 1: 2026-10-08 (SUB-301, CLS-01)
    { attendance_id: 'ATT-1001', student_id: 'STU-201', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-08', status: 'Present' },
    { attendance_id: 'ATT-1002', student_id: 'STU-202', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-08', status: 'Present' },
    { attendance_id: 'ATT-1003', student_id: 'STU-203', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-08', status: 'Present' },
    { attendance_id: 'ATT-1004', student_id: 'STU-204', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-08', status: 'Absent' },
    { attendance_id: 'ATT-1005', student_id: 'STU-205', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-08', status: 'Present' },
    { attendance_id: 'ATT-1006', student_id: 'STU-206', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-08', status: 'Present' },

    // Date 2: 2026-10-09 (SUB-301, CLS-01)
    { attendance_id: 'ATT-1007', student_id: 'STU-201', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-09', status: 'Present' },
    { attendance_id: 'ATT-1008', student_id: 'STU-202', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-09', status: 'Present' },
    { attendance_id: 'ATT-1009', student_id: 'STU-203', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-09', status: 'Present' },
    { attendance_id: 'ATT-1010', student_id: 'STU-204', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-09', status: 'Present' },
    { attendance_id: 'ATT-1011', student_id: 'STU-205', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-09', status: 'Absent' },
    { attendance_id: 'ATT-1012', student_id: 'STU-206', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-09', status: 'Present' },

    // Date 3: 2026-10-10 (SUB-301, CLS-01)
    { attendance_id: 'ATT-1013', student_id: 'STU-201', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-10', status: 'Present' },
    { attendance_id: 'ATT-1014', student_id: 'STU-202', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-10', status: 'Absent' },
    { attendance_id: 'ATT-1015', student_id: 'STU-203', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-10', status: 'Present' },
    { attendance_id: 'ATT-1016', student_id: 'STU-204', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-10', status: 'Absent' },
    { attendance_id: 'ATT-1017', student_id: 'STU-205', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-10', status: 'Present' },
    { attendance_id: 'ATT-1018', student_id: 'STU-206', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-10', status: 'Present' },

    // Date 4: 2026-10-12 (SUB-301, CLS-01)
    { attendance_id: 'ATT-1019', student_id: 'STU-201', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-12', status: 'Present' },
    { attendance_id: 'ATT-1020', student_id: 'STU-202', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-12', status: 'Present' },
    { attendance_id: 'ATT-1021', student_id: 'STU-203', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-12', status: 'Present' },
    { attendance_id: 'ATT-1022', student_id: 'STU-204', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-12', status: 'Present' },
    { attendance_id: 'ATT-1023', student_id: 'STU-205', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-12', status: 'Absent' },
    { attendance_id: 'ATT-1024', student_id: 'STU-206', subject_id: 'SUB-301', teacher_id: 'TCH-101', class_id: 'CLS-01', date: '2026-10-12', status: 'Present' },

    // SUB-302 Database Management Systems (CLS-01)
    { attendance_id: 'ATT-1025', student_id: 'STU-201', subject_id: 'SUB-302', teacher_id: 'TCH-103', class_id: 'CLS-01', date: '2026-10-10', status: 'Present' },
    { attendance_id: 'ATT-1026', student_id: 'STU-202', subject_id: 'SUB-302', teacher_id: 'TCH-103', class_id: 'CLS-01', date: '2026-10-10', status: 'Present' },
    { attendance_id: 'ATT-1027', student_id: 'STU-203', subject_id: 'SUB-302', teacher_id: 'TCH-103', class_id: 'CLS-01', date: '2026-10-10', status: 'Present' },
    { attendance_id: 'ATT-1028', student_id: 'STU-204', subject_id: 'SUB-302', teacher_id: 'TCH-103', class_id: 'CLS-01', date: '2026-10-10', status: 'Present' },
    { attendance_id: 'ATT-1029', student_id: 'STU-205', subject_id: 'SUB-302', teacher_id: 'TCH-103', class_id: 'CLS-01', date: '2026-10-10', status: 'Absent' },
    { attendance_id: 'ATT-1030', student_id: 'STU-206', subject_id: 'SUB-302', teacher_id: 'TCH-103', class_id: 'CLS-01', date: '2026-10-10', status: 'Present' },

    // SUB-303 Cloud Native & Docker Orchestration (CLS-01)
    { attendance_id: 'ATT-1031', student_id: 'STU-201', subject_id: 'SUB-303', teacher_id: 'TCH-102', class_id: 'CLS-01', date: '2026-10-11', status: 'Present' },
    { attendance_id: 'ATT-1032', student_id: 'STU-202', subject_id: 'SUB-303', teacher_id: 'TCH-102', class_id: 'CLS-01', date: '2026-10-11', status: 'Present' },
    { attendance_id: 'ATT-1033', student_id: 'STU-203', subject_id: 'SUB-303', teacher_id: 'TCH-102', class_id: 'CLS-01', date: '2026-10-11', status: 'Present' },
    { attendance_id: 'ATT-1034', student_id: 'STU-204', subject_id: 'SUB-303', teacher_id: 'TCH-102', class_id: 'CLS-01', date: '2026-10-11', status: 'Absent' },
    { attendance_id: 'ATT-1035', student_id: 'STU-205', subject_id: 'SUB-303', teacher_id: 'TCH-102', class_id: 'CLS-01', date: '2026-10-11', status: 'Present' },
    { attendance_id: 'ATT-1036', student_id: 'STU-206', subject_id: 'SUB-303', teacher_id: 'TCH-102', class_id: 'CLS-01', date: '2026-10-11', status: 'Absent' },

    // SUB-304 Enterprise Software Engineering (CLS-02)
    { attendance_id: 'ATT-1037', student_id: 'STU-207', subject_id: 'SUB-304', teacher_id: 'TCH-101', class_id: 'CLS-02', date: '2026-10-12', status: 'Present' },
    { attendance_id: 'ATT-1038', student_id: 'STU-208', subject_id: 'SUB-304', teacher_id: 'TCH-101', class_id: 'CLS-02', date: '2026-10-12', status: 'Present' },
    { attendance_id: 'ATT-1039', student_id: 'STU-209', subject_id: 'SUB-304', teacher_id: 'TCH-101', class_id: 'CLS-02', date: '2026-10-12', status: 'Absent' },
  ],
};

/**
 * Exact formula from Section 3.4 of Project PDF:
 * Attendance Percentage = (Number of classes attended ÷ Total number of classes held) × 100
 */
export function calculateAttendancePercentage(attended: number, totalHeld: number): number {
  if (totalHeld <= 0) return 0;
  return Number(((attended / totalHeld) * 100).toFixed(1));
}
