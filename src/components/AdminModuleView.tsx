import React, { useState } from 'react';
import { Plus, Trash2, Search, UserPlus, BookOpen, Layers, GraduationCap, Edit3, Check, X } from 'lucide-react';
import {
  DatabaseState,
  StudentEntity,
  TeacherEntity,
  ClassEntity,
  SubjectEntity,
} from '../data/attendanceStore';

interface AdminModuleViewProps {
  db: DatabaseState;
  onAddStudent: (student: Omit<StudentEntity, 'student_id'>) => void;
  onUpdateStudent: (student: StudentEntity) => void;
  onDeleteStudent: (studentId: string) => void;
  onAddTeacher: (teacher: Omit<TeacherEntity, 'teacher_id' | 'admin_id'>) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onAddClass: (cls: Omit<ClassEntity, 'class_id'>) => void;
  onDeleteClass: (classId: string) => void;
  onAddSubject: (subject: Omit<SubjectEntity, 'subject_id'>) => void;
  onDeleteSubject: (subjectId: string) => void;
}

type AdminTab = 'students' | 'teachers' | 'classes' | 'subjects';

export const AdminModuleView: React.FC<AdminModuleViewProps> = ({
  db,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddTeacher,
  onDeleteTeacher,
  onAddClass,
  onDeleteClass,
  onAddSubject,
  onDeleteSubject,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('students');
  const [searchQuery, setSearchQuery] = useState('');

  // Student form state
  const [stuRollNo, setStuRollNo] = useState('');
  const [stuName, setStuName] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuClassId, setStuClassId] = useState(db.classes[0]?.class_id || 'CLS-01');

  // Inline edit state for student
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStuName, setEditStuName] = useState('');
  const [editStuRoll, setEditStuRoll] = useState('');
  const [editStuClassId, setEditStuClassId] = useState('');

  // Teacher form state
  const [tchName, setTchName] = useState('');
  const [tchEmail, setTchEmail] = useState('');
  const [tchDept, setTchDept] = useState('CSE — Enterprise Systems');

  // Class form state
  const [clsName, setClsName] = useState('');
  const [clsSection, setClsSection] = useState('');

  // Subject form state
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subTeacherId, setSubTeacherId] = useState(db.teachers[0]?.teacher_id || 'TCH-101');
  const [subClassId, setSubClassId] = useState(db.classes[0]?.class_id || 'CLS-01');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName.trim() || !stuRollNo.trim()) return;
    onAddStudent({
      roll_no: stuRollNo.trim().toUpperCase(),
      name: stuName.trim(),
      email:
        stuEmail.trim() || `${stuRollNo.trim().toLowerCase()}@anurag.edu.in`,
      class_id: stuClassId,
    });
    setStuRollNo('');
    setStuName('');
    setStuEmail('');
  };

  const startEditingStudent = (stu: StudentEntity) => {
    setEditingStudentId(stu.student_id);
    setEditStuName(stu.name);
    setEditStuRoll(stu.roll_no);
    setEditStuClassId(stu.class_id);
  };

  const saveStudentEdit = (stu: StudentEntity) => {
    if (!editStuName.trim() || !editStuRoll.trim()) return;
    onUpdateStudent({
      ...stu,
      name: editStuName.trim(),
      roll_no: editStuRoll.trim().toUpperCase(),
      class_id: editStuClassId,
    });
    setEditingStudentId(null);
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tchName.trim() || !tchEmail.trim()) return;
    onAddTeacher({
      name: tchName.trim(),
      email: tchEmail.trim(),
      department: tchDept.trim() || 'Computer Science & Engineering',
    });
    setTchName('');
    setTchEmail('');
  };

  const handleClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clsName.trim() || !clsSection.trim()) return;
    onAddClass({
      class_name: clsName.trim(),
      section: clsSection.trim(),
    });
    setClsName('');
    setClsSection('');
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subCode.trim()) return;
    onAddSubject({
      subject_name: subName.trim(),
      subject_code: subCode.trim().toUpperCase(),
      teacher_id: subTeacherId,
      class_id: subClassId,
    });
    setSubName('');
    setSubCode('');
  };

  const getClassName = (classId: string) => {
    const c = db.classes.find((item) => item.class_id === classId);
    return c ? `${c.class_name} · ${c.section}` : classId;
  };

  const getTeacherName = (teacherId: string) => {
    const t = db.teachers.find((item) => item.teacher_id === teacherId);
    return t ? t.name : teacherId;
  };

  const filteredStudents = db.students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = db.teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClasses = db.classes.filter(
    (c) =>
      c.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = db.subjects.filter(
    (sub) =>
      sub.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.subject_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Module Header & Segmented Entity Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-[#A100FF]">
            Section 3.1 · Admin Module · Master Data Governance
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institutional Directory & Relational Schema Records
          </h2>
          <p className="text-sm text-slate-600">
            Maintain student profiles, faculty accounts, class sections, and subject assignments.
            Logged in as Administrator:{' '}
            <span className="font-medium text-slate-900">{db.admins[0]?.name}</span> ·{' '}
            <span className="font-mono text-xs text-slate-500">{db.admins[0]?.admin_id}</span>
          </p>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#A100FF]" />
            Students ({db.students.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teachers')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#A100FF]" />
            Teachers ({db.teachers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#A100FF]" />
            Classes ({db.classes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subjects')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#A100FF]" />
            Subjects ({db.subjects.length})
          </button>
        </div>
      </div>

      {/* Main 12-Column Split: Left Form (4 cols) + Right Data Table (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4 Cols: Entity Creation Form */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          {activeTab === 'students' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register New Student</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inserts into <span className="font-mono">STUDENT</span> table with foreign key{' '}
                  <span className="font-mono">class_id</span>.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Roll Number (Unique)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 25EG505R12"
                  value={stuRollNo}
                  onChange={(e) => setStuRollNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#A100FF]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Riya Sengupta"
                  value={stuName}
                  onChange={(e) => setStuName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#A100FF]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. 25eg505r12@anurag.edu.in"
                  value={stuEmail}
                  onChange={(e) => setStuEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#A100FF]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Assigned Class (FK: class_id)
                </label>
                <select
                  value={stuClassId}
                  onChange={(e) => setStuClassId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#A100FF]"
                >
                  {db.classes.map((c) => (
                    <option key={c.class_id} value={c.class_id}>
                      {c.class_id} — {c.class_name} ({c.section})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#A100FF] hover:bg-[#8800D8] rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Save Student Record
              </button>
            </form>
          )}

          {activeTab === 'teachers' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Teacher Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inserts into <span className="font-mono">TEACHER</span> table managed by{' '}
                  <span className="font-mono">{db.admins[0]?.admin_id}</span>.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Faculty Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arvind Swaminathan"
                  value={tchName}
                  onChange={(e) => setTchName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#A100FF]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Faculty Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. arvind.s@anurag.edu.in"
                  value={tchEmail}
                  onChange={(e) => setTchEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#A100FF]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Department / Specialization
                </label>
                <input
                  type="text"
                  required
                  value={tchDept}
                  onChange={(e) => setTchDept(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#A100FF]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#A100FF] hover:bg-[#8800D8] rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create Teacher Account
              </button>
            </form>
          )}

          {activeTab === 'classes' && (
            <form onSubmit={handleClassSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Define Class & Section</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Creates a new cohort in the <span className="font-mono">CLASS</span> entity.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Class / Program Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech CSE IV Year"
                  value={clsName}
                  onChange={(e) => setClsName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#A100FF]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Section</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section C"
                  value={clsSection}
                  onChange={(e) => setClsSection(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#A100FF]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#A100FF] hover:bg-[#8800D8] rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Class Cohort
              </button>
            </form>
          )}

          {activeTab === 'subjects' && (
            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign Subject & Faculty</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Links <span className="font-mono">SUBJECT</span> to{' '}
                  <span className="font-mono">teacher_id</span> and{' '}
                  <span className="font-mono">class_id</span>.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS306K"
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#A100FF]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Subject Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kubernetes & DevSecOps"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#A100FF]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Assigned Teacher (FK: teacher_id)
                </label>
                <select
                  value={subTeacherId}
                  onChange={(e) => setSubTeacherId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#A100FF]"
                >
                  {db.teachers.map((t) => (
                    <option key={t.teacher_id} value={t.teacher_id}>
                      {t.teacher_id} — {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Target Class (FK: class_id)
                </label>
                <select
                  value={subClassId}
                  onChange={(e) => setSubClassId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#A100FF]"
                >
                  {db.classes.map((c) => (
                    <option key={c.class_id} value={c.class_id}>
                      {c.class_id} — {c.class_name} ({c.section})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#A100FF] hover:bg-[#8800D8] rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create Subject Assignment
              </button>
            </form>
          )}
        </div>

        {/* Right 8 Cols: Active Entity Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 capitalize">
                Active {activeTab} Directory
              </h3>
              <p className="text-xs text-slate-500">
                All additions, edits, and deletions update the relational database immediately.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Filter ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#A100FF]"
              />
            </div>
          </div>

          {/* STUDENTS TABLE */}
          {activeTab === 'students' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-3">Student ID (PK)</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Class Cohort (FK)</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.map((stu) => {
                    const isEditing = editingStudentId === stu.student_id;
                    return (
                      <tr key={stu.student_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono tabular-nums text-slate-500">
                          {stu.student_id}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums font-medium text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editStuRoll}
                              onChange={(e) => setEditStuRoll(e.target.value)}
                              className="px-2 py-1 text-xs border border-slate-300 rounded font-mono w-28"
                            />
                          ) : (
                            stu.roll_no
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editStuName}
                              onChange={(e) => setEditStuName(e.target.value)}
                              className="px-2 py-1 text-xs border border-slate-300 rounded w-40"
                            />
                          ) : (
                            <div>
                              <div className="font-medium text-slate-900">{stu.name}</div>
                              <div className="text-[11px] text-slate-400">{stu.email}</div>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {isEditing ? (
                            <select
                              value={editStuClassId}
                              onChange={(e) => setEditStuClassId(e.target.value)}
                              className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                            >
                              {db.classes.map((c) => (
                                <option key={c.class_id} value={c.class_id}>
                                  {c.class_name} · {c.section}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span>
                              {getClassName(stu.class_id)} ·{' '}
                              <span className="font-mono text-slate-400">{stu.class_id}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveStudentEdit(stu)}
                                  className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                  title="Save changes"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingStudentId(null)}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditingStudent(stu)}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                  title="Edit student"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteStudent(stu.student_id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  title="Delete student"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TEACHERS TABLE */}
          {activeTab === 'teachers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-3">Teacher ID (PK)</th>
                    <th className="py-2.5 px-3">Faculty Name</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTeachers.map((t) => (
                    <tr key={t.teacher_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-500">
                        {t.teacher_id}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">{t.name}</td>
                      <td className="py-3 px-3 text-slate-600">{t.department}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{t.email}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteTeacher(t.teacher_id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete teacher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CLASSES TABLE */}
          {activeTab === 'classes' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-3">Class ID (PK)</th>
                    <th className="py-2.5 px-3">Class Name</th>
                    <th className="py-2.5 px-3">Section</th>
                    <th className="py-2.5 px-3 text-right">Enrolled Students</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredClasses.map((c) => {
                    const studentCount = db.students.filter(
                      (s) => s.class_id === c.class_id
                    ).length;
                    return (
                      <tr key={c.class_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono tabular-nums text-slate-500">
                          {c.class_id}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900">{c.class_name}</td>
                        <td className="py-3 px-3 text-slate-600">{c.section}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                          {studentCount} students
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteClass(c.class_id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* SUBJECTS TABLE */}
          {activeTab === 'subjects' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-3">Subject ID (PK)</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3">Assigned Faculty (FK)</th>
                    <th className="py-2.5 px-3">Class Cohort (FK)</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredSubjects.map((sub) => (
                    <tr key={sub.subject_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-500">
                        {sub.subject_id}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                        {sub.subject_code}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">{sub.subject_name}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {getTeacherName(sub.teacher_id)} ·{' '}
                        <span className="font-mono text-slate-400">{sub.teacher_id}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {getClassName(sub.class_id)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteSubject(sub.subject_id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
