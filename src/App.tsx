/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_DB_STATE,
  DatabaseState,
  ApiTransactionLog,
  StudentEntity,
  TeacherEntity,
  ClassEntity,
  SubjectEntity,
  AttendanceStatus,
  calculateAttendancePercentage,
} from './data/attendanceStore';
import { TeacherModuleView } from './components/TeacherModuleView';
import { AdminModuleView } from './components/AdminModuleView';
import { StudentModuleView } from './components/StudentModuleView';
import { ReportsModuleView } from './components/ReportsModuleView';
import { SpringBootDockerView } from './components/SpringBootDockerView';

type ActiveModule = 'teacher' | 'admin' | 'student' | 'reports' | 'architecture';

const STORAGE_KEY = 'accenttrack_enterprise_attendance_db_v1';

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('teacher');

  const [db, setDb] = useState<DatabaseState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to initial seed state
    }
    return INITIAL_DB_STATE;
  });

  const [apiLogs, setApiLogs] = useState<ApiTransactionLog[]>([
    {
      id: 'LOG-101',
      timestamp: '2026-10-12 09:00:02',
      method: 'GET',
      endpoint: '/api/v1/attendance/bootstrap',
      status: 200,
      durationMs: 14,
      sqlPreview:
        'SELECT * FROM admin, teacher, school_class, subject, student, attendance;',
      summary: 'Initialized in-browser Spring Boot 3.2 JPA relational persistence context.',
    },
  ]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Ignore storage quota errors
    }
  }, [db]);

  const appendApiLog = (
    method: ApiTransactionLog['method'],
    endpoint: string,
    sqlPreview: string,
    summary: string
  ) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);
    const newLog: ApiTransactionLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp,
      method,
      endpoint,
      status: 200,
      durationMs: Math.floor(Math.random() * 14) + 6,
      sqlPreview,
      summary,
    };
    setApiLogs((prev) => [newLog, ...prev]);
  };

  // Teacher Module: Save Batch Attendance
  const handleSaveBatchAttendance = (payload: {
    classId: string;
    subjectId: string;
    teacherId: string;
    date: string;
    entries: { studentId: string; status: AttendanceStatus }[];
  }) => {
    setDb((prev) => {
      // Remove existing entries for the same (studentId, subjectId, date) and insert updated batch
      const studentSet = new Set(payload.entries.map((e) => e.studentId));
      const remaining = prev.attendance.filter(
        (a) =>
          !(
            a.subject_id === payload.subjectId &&
            a.date === payload.date &&
            studentSet.has(a.student_id)
          )
      );

      const newRecords = payload.entries.map((entry, idx) => ({
        attendance_id: `ATT-${Date.now().toString().slice(-4)}${idx}`,
        student_id: entry.studentId,
        subject_id: payload.subjectId,
        teacher_id: payload.teacherId,
        class_id: payload.classId,
        date: payload.date,
        status: entry.status,
      }));

      return {
        ...prev,
        attendance: [...remaining, ...newRecords],
      };
    });

    appendApiLog(
      'POST',
      '/api/v1/attendance/mark-batch',
      `INSERT INTO attendance (attendance_id, student_id, subject_id, teacher_id, class_id, attendance_date, status) VALUES (${payload.entries.length} rows) ON DUPLICATE KEY UPDATE status = VALUES(status);`,
      `Marked attendance for ${payload.entries.length} students in ${payload.classId} (${payload.subjectId}) on ${payload.date}.`
    );
  };

  // Admin Module Handlers
  const handleAddStudent = (stu: Omit<StudentEntity, 'student_id'>) => {
    const nextId = `STU-${201 + db.students.length + Math.floor(Math.random() * 90)}`;
    const newStudent: StudentEntity = {
      student_id: nextId,
      ...stu,
    };
    setDb((prev) => ({
      ...prev,
      students: [...prev.students, newStudent],
    }));
    appendApiLog(
      'POST',
      '/api/v1/students',
      `INSERT INTO student (student_id, roll_no, name, email, class_id) VALUES ('${nextId}', '${stu.roll_no}', '${stu.name}', '${stu.email}', '${stu.class_id}');`,
      `Registered student ${stu.name} (${stu.roll_no}) in class ${stu.class_id}.`
    );
  };

  const handleUpdateStudent = (updated: StudentEntity) => {
    setDb((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.student_id === updated.student_id ? updated : s
      ),
    }));
    appendApiLog(
      'PUT',
      `/api/v1/students/${updated.student_id}`,
      `UPDATE student SET name='${updated.name}', roll_no='${updated.roll_no}', class_id='${updated.class_id}' WHERE student_id='${updated.student_id}';`,
      `Updated student profile for ${updated.name} (${updated.student_id}).`
    );
  };

  const handleDeleteStudent = (studentId: string) => {
    setDb((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.student_id !== studentId),
      attendance: prev.attendance.filter((a) => a.student_id !== studentId),
    }));
    appendApiLog(
      'DELETE',
      `/api/v1/students/${studentId}`,
      `DELETE FROM student WHERE student_id='${studentId}'; -- ON DELETE CASCADE attendance`,
      `Removed student ${studentId} and cascaded attendance entries.`
    );
  };

  const handleAddTeacher = (tch: Omit<TeacherEntity, 'teacher_id' | 'admin_id'>) => {
    const nextId = `TCH-${101 + db.teachers.length + Math.floor(Math.random() * 50)}`;
    const newTeacher: TeacherEntity = {
      teacher_id: nextId,
      admin_id: db.admins[0]?.admin_id || 'ADM-001',
      ...tch,
    };
    setDb((prev) => ({
      ...prev,
      teachers: [...prev.teachers, newTeacher],
    }));
    appendApiLog(
      'POST',
      '/api/v1/teachers',
      `INSERT INTO teacher (teacher_id, name, email, department, admin_id) VALUES ('${nextId}', '${tch.name}', '${tch.email}', '${tch.department}', 'ADM-001');`,
      `Created faculty account for ${tch.name} (${nextId}).`
    );
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setDb((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.teacher_id !== teacherId),
    }));
    appendApiLog(
      'DELETE',
      `/api/v1/teachers/${teacherId}`,
      `DELETE FROM teacher WHERE teacher_id='${teacherId}';`,
      `Removed teacher record ${teacherId}.`
    );
  };

  const handleAddClass = (cls: Omit<ClassEntity, 'class_id'>) => {
    const nextId = `CLS-0${db.classes.length + 1}`;
    const newClass: ClassEntity = {
      class_id: nextId,
      ...cls,
    };
    setDb((prev) => ({
      ...prev,
      classes: [...prev.classes, newClass],
    }));
    appendApiLog(
      'POST',
      '/api/v1/classes',
      `INSERT INTO school_class (class_id, class_name, section) VALUES ('${nextId}', '${cls.class_name}', '${cls.section}');`,
      `Added class cohort ${cls.class_name} (${cls.section}).`
    );
  };

  const handleDeleteClass = (classId: string) => {
    setDb((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c.class_id !== classId),
    }));
    appendApiLog(
      'DELETE',
      `/api/v1/classes/${classId}`,
      `DELETE FROM school_class WHERE class_id='${classId}';`,
      `Deleted class cohort ${classId}.`
    );
  };

  const handleAddSubject = (sub: Omit<SubjectEntity, 'subject_id'>) => {
    const nextId = `SUB-${301 + db.subjects.length + Math.floor(Math.random() * 50)}`;
    const newSubject: SubjectEntity = {
      subject_id: nextId,
      ...sub,
    };
    setDb((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
    appendApiLog(
      'POST',
      '/api/v1/subjects',
      `INSERT INTO subject (subject_id, subject_name, subject_code, teacher_id, class_id) VALUES ('${nextId}', '${sub.subject_name}', '${sub.subject_code}', '${sub.teacher_id}', '${sub.class_id}');`,
      `Assigned subject ${sub.subject_code} (${sub.subject_name}) to ${sub.teacher_id}.`
    );
  };

  const handleDeleteSubject = (subjectId: string) => {
    setDb((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.subject_id !== subjectId),
      attendance: prev.attendance.filter((a) => a.subject_id !== subjectId),
    }));
    appendApiLog(
      'DELETE',
      `/api/v1/subjects/${subjectId}`,
      `DELETE FROM subject WHERE subject_id='${subjectId}';`,
      `Removed subject ${subjectId}.`
    );
  };

  const handleResetDatabase = () => {
    setDb(INITIAL_DB_STATE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DB_STATE));
    appendApiLog(
      'POST',
      '/api/v1/admin/reset-seed',
      'TRUNCATE TABLE attendance; SOURCE /docker-entrypoint-initdb.d/01-schema.sql;',
      'Restored initial CSE Mini Project relational database seed state.'
    );
  };

  const handleSimulateHealthCheck = () => {
    appendApiLog(
      'GET',
      '/api/v1/health',
      'SELECT 1 FROM DUAL; -- Spring Boot Actuator HealthCheck',
      'Spring Boot 3.2.5 Container & MySQL 8.0 Simulation Pool verified healthy.'
    );
  };

  const handleExportCsv = () => {
    const headers = [
      'attendance_id',
      'date',
      'student_id',
      'roll_no',
      'student_name',
      'class_id',
      'subject_id',
      'subject_code',
      'teacher_id',
      'status',
    ];
    const rows = db.attendance.map((a) => {
      const stu = db.students.find((s) => s.student_id === a.student_id);
      const sub = db.subjects.find((s) => s.subject_id === a.subject_id);
      return [
        a.attendance_id,
        a.date,
        a.student_id,
        stu?.roll_no || '',
        `"${stu?.name || ''}"`,
        a.class_id,
        a.subject_id,
        sub?.subject_code || '',
        a.teacher_id,
        a.status,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `online_attendance_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    appendApiLog(
      'GET',
      '/api/v1/attendance/export-csv',
      'SELECT a.*, s.roll_no, s.name, sub.subject_code FROM attendance a JOIN student s ON a.student_id = s.student_id JOIN subject sub ON a.subject_id = sub.subject_id;',
      `Exported ${db.attendance.length} attendance records to CSV.`
    );
  };

  const totalPresent = db.attendance.filter((a) => a.status === 'Present').length;
  const globalAttendancePct = calculateAttendancePercentage(
    totalPresent,
    db.attendance.length
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveModule('teacher');
            }}
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display"
          >
            &gt; AccentTrack
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveModule('teacher')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
                activeModule === 'teacher'
                  ? 'text-slate-900 border-b-2 border-[#A100FF] font-semibold'
                  : ''
              }`}
            >
              Teacher Module
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('admin')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
                activeModule === 'admin'
                  ? 'text-slate-900 border-b-2 border-[#A100FF] font-semibold'
                  : ''
              }`}
            >
              Admin Directory
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('student')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
                activeModule === 'student'
                  ? 'text-slate-900 border-b-2 border-[#A100FF] font-semibold'
                  : ''
              }`}
            >
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('reports')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
                activeModule === 'reports'
                  ? 'text-slate-900 border-b-2 border-[#A100FF] font-semibold'
                  : ''
              }`}
            >
              Attendance Reports
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('architecture')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
                activeModule === 'architecture'
                  ? 'text-slate-900 border-b-2 border-[#A100FF] font-semibold'
                  : ''
              }`}
            >
              Spring Boot &amp; Docker
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#A100FF] rounded-lg hover:bg-[#8800D8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Export CSV Report
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container (1440px Desktop Presence) */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8 space-y-6">
        {/* Institutional Hero & Role Switcher Banner */}
        <section className="bg-[#0F172A] text-white rounded-xl p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="text-[#C084FC] font-semibold">
                Online Attendance Management System
              </span>
              <span aria-hidden="true">·</span>
              <span>CSE Mini Project &amp; Academic Submission</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">Java Spring Boot + MySQL + Docker Compose</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display"
              style={{ textWrap: 'balance' }}
            >
              Digital Attendance Recording, Automated Percentage Engine &amp; ER Architecture
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Full-featured simulation of all 4 core modules (Admin, Teacher, Student, and Reports)
              backed by the 6-entity relational schema. Switch modules below to test marking
              attendance, managing records, or exporting Docker Compose &amp; Spring Boot code.
            </p>
          </div>

          {/* Global Telemetry Summary in Hero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-3">
              <div className="text-[11px] text-slate-400">Students</div>
              <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
                {db.students.length}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {db.classes.length} Classes
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-3">
              <div className="text-[11px] text-slate-400">Faculty</div>
              <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
                {db.teachers.length}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {db.subjects.length} Subjects
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-3">
              <div className="text-[11px] text-slate-400">DB Entries</div>
              <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
                {db.attendance.length}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">ATTENDANCE</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-3">
              <div className="text-[11px] text-slate-400">Mean Rate</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#C084FC] mt-0.5">
                {globalAttendancePct}%
              </div>
              <div className="text-[11px] text-slate-400 font-mono">Institutional</div>
            </div>
          </div>
        </section>

        {/* Mobile / Quick Workspace Module Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-2">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveModule('teacher')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'teacher'
                  ? 'bg-[#A100FF] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              01. Teacher Module (Mark Attendance)
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('admin')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'admin'
                  ? 'bg-[#A100FF] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              02. Admin Module (Manage Entities)
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('student')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'student'
                  ? 'bg-[#A100FF] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              03. Student Module (My Percentage)
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('reports')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'reports'
                  ? 'bg-[#A100FF] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              04. Attendance &amp; Report Module
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('architecture')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === 'architecture'
                  ? 'bg-[#A100FF] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              05. ER Diagram, Spring Boot &amp; Docker YAML
            </button>
          </div>

          <div className="px-3 text-xs text-slate-500 font-mono tabular-nums hidden xl:block">
            Formula: (Attended ÷ Held) × 100 · {apiLogs.length} SQL Queries Executed
          </div>
        </div>

        {/* Active Module Viewport */}
        {activeModule === 'teacher' && (
          <TeacherModuleView
            db={db}
            onSaveBatchAttendance={handleSaveBatchAttendance}
          />
        )}

        {activeModule === 'admin' && (
          <AdminModuleView
            db={db}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onAddTeacher={handleAddTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        )}

        {activeModule === 'student' && <StudentModuleView db={db} />}

        {activeModule === 'reports' && (
          <ReportsModuleView db={db} onExportCsv={handleExportCsv} />
        )}

        {activeModule === 'architecture' && (
          <SpringBootDockerView
            db={db}
            apiLogs={apiLogs}
            onResetDatabase={handleResetDatabase}
            onSimulateHealthCheck={handleSimulateHealthCheck}
          />
        )}
      </main>

      {/* Quiet Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            AccentTrack — Online Attendance Management System · CSE Mini Project &amp; Academic
            Submission
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveModule('architecture')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              View docker-compose.yml &amp; Spring Boot Code
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleResetDatabase}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
