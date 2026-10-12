import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, XCircle, Check, Users, Calendar, BookOpen, Save, Search } from 'lucide-react';
import {
  DatabaseState,
  AttendanceStatus,
  calculateAttendancePercentage,
} from '../data/attendanceStore';

interface TeacherModuleViewProps {
  db: DatabaseState;
  onSaveBatchAttendance: (payload: {
    classId: string;
    subjectId: string;
    teacherId: string;
    date: string;
    entries: { studentId: string; status: AttendanceStatus }[];
  }) => void;
}

export const TeacherModuleView: React.FC<TeacherModuleViewProps> = ({
  db,
  onSaveBatchAttendance,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    db.classes[0]?.class_id || 'CLS-01'
  );

  // Filter subjects for the selected class (fallback to all subjects if a newly created class has none yet)
  const availableSubjects = useMemo(() => {
    const classSubjects = db.subjects.filter((s) => s.class_id === selectedClassId);
    return classSubjects.length > 0 ? classSubjects : db.subjects;
  }, [db.subjects, selectedClassId]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    availableSubjects[0]?.subject_id || 'SUB-301'
  );
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-12');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [draftStatuses, setDraftStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Ensure selectedSubjectId stays valid when class changes
  useEffect(() => {
    if (!availableSubjects.some((s) => s.subject_id === selectedSubjectId)) {
      if (availableSubjects[0]) {
        setSelectedSubjectId(availableSubjects[0].subject_id);
      }
    }
  }, [availableSubjects, selectedSubjectId]);

  const activeSubject = db.subjects.find((s) => s.subject_id === selectedSubjectId);
  const activeTeacher = db.teachers.find(
    (t) => t.teacher_id === (activeSubject?.teacher_id || db.teachers[0]?.teacher_id)
  );
  const activeClass = db.classes.find((c) => c.class_id === selectedClassId);

  const studentsInClass = useMemo(
    () => db.students.filter((s) => s.class_id === selectedClassId),
    [db.students, selectedClassId]
  );

  // Sync draftStatuses from existing attendance entries for (selectedClassId, selectedSubjectId, selectedDate)
  useEffect(() => {
    const nextDraft: Record<string, AttendanceStatus> = {};
    studentsInClass.forEach((stu) => {
      const existing = db.attendance.find(
        (a) =>
          a.student_id === stu.student_id &&
          a.subject_id === selectedSubjectId &&
          a.date === selectedDate
      );
      nextDraft[stu.student_id] = existing ? existing.status : 'Present';
    });
    setDraftStatuses(nextDraft);
    setSaveBanner(null);
  }, [studentsInClass, selectedSubjectId, selectedDate, db.attendance]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDraftStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setSaveBanner(null);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    studentsInClass.forEach((stu) => {
      next[stu.student_id] = status;
    });
    setDraftStatuses(next);
    setSaveBanner(null);
  };

  const handleCommitAttendance = () => {
    if (!selectedClassId || !selectedSubjectId || !selectedDate) return;
    const entries = studentsInClass.map((stu) => ({
      studentId: stu.student_id,
      status: draftStatuses[stu.student_id] || 'Present',
    }));

    onSaveBatchAttendance({
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      teacherId: activeTeacher?.teacher_id || 'TCH-101',
      date: selectedDate,
      entries,
    });

    setSaveBanner(
      `Attendance committed for ${entries.length} students on ${selectedDate} (${activeSubject?.subject_code}).`
    );
  };

  const filteredStudents = studentsInClass.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const presentCount = studentsInClass.filter(
    (s) => (draftStatuses[s.student_id] || 'Present') === 'Present'
  ).length;
  const absentCount = studentsInClass.length - presentCount;
  const sessionRate = calculateAttendancePercentage(presentCount, studentsInClass.length);

  // Check if attendance for this exact date/subject/class is already persisted in DB
  const isAlreadyRecordedInDb = studentsInClass.some((stu) =>
    db.attendance.some(
      (a) =>
        a.student_id === stu.student_id &&
        a.subject_id === selectedSubjectId &&
        a.date === selectedDate
    )
  );

  return (
    <div className="space-y-6">
      {/* Control Strip: Class, Subject, Date, and Faculty Context */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="text-xs font-medium text-[#A100FF]">
              Section 3.2 · Teacher Module · Daily Roll Call & Validation
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Mark & Commit Class Attendance Register
            </h2>
            <p className="text-sm text-slate-600">
              Assigned Faculty:{' '}
              <span className="font-semibold text-slate-900">{activeTeacher?.name}</span> ·{' '}
              <span className="font-mono text-xs text-slate-500">{activeTeacher?.teacher_id}</span> ·{' '}
              <span>{activeTeacher?.department}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleMarkAll('Present')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('Absent')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Mark All Absent
            </button>
            <button
              type="button"
              onClick={handleCommitAttendance}
              disabled={studentsInClass.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#A100FF] hover:bg-[#8800D8] disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Attendance Register
            </button>
          </div>
        </div>

        {/* 3 Filter Controls: Class, Subject, Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Users className="w-3.5 h-3.5 text-[#A100FF]" />
              01. Select Class & Section
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:outline-none focus:border-[#A100FF]"
            >
              {db.classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name} — {cls.section} ({cls.class_id})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <BookOpen className="w-3.5 h-3.5 text-[#A100FF]" />
              02. Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:outline-none focus:border-[#A100FF]"
            >
              {availableSubjects.map((sub) => (
                <option key={sub.subject_id} value={sub.subject_id}>
                  {sub.subject_code} · {sub.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-[#A100FF]" />
              03. Select Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white font-mono text-slate-900 focus:outline-none focus:border-[#A100FF]"
            />
          </div>
        </div>

        {/* Save confirmation banner if triggered */}
        {saveBanner && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveBanner}</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700">
              POST /api/v1/attendance/mark-batch · 200 OK
            </span>
          </div>
        )}
      </div>

      {/* 4-Column Session KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Selected Class Roster</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {studentsInClass.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {activeClass?.class_name} · {activeClass?.section}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Marked Present</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {presentCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Status: Present · Verified
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Marked Absent</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-red-600">
            {absentCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Status: Absent · Flagged
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Session Attendance Percentage</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {sessionRate}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {isAlreadyRecordedInDb ? 'Saved in Database' : 'Unsaved Draft Register'}
          </div>
        </div>
      </div>

      {/* High-Density Student Attendance Register Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Student Roll Call — {activeSubject?.subject_code} ({selectedDate})
            </h3>
            <p className="text-xs text-slate-500">
              Toggle Present or Absent for each student and click Save Attendance Register.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roll no or student name..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#A100FF]"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="text-sm font-semibold text-slate-800">
              No students found in this class cohort
            </div>
            <p className="text-xs text-slate-500">
              Use the Admin Directory tab to enroll students into {selectedClassId}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Roll Number</th>
                  <th className="py-2.5 px-3">Student Name & Email</th>
                  <th className="py-2.5 px-3 text-right">Subject Historical %</th>
                  <th className="py-2.5 px-3 text-right">Mark Status ({selectedDate})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((stu) => {
                  const status = draftStatuses[stu.student_id] || 'Present';
                  // Calculate cumulative subject attendance for this student
                  const subjectRecords = db.attendance.filter(
                    (a) =>
                      a.student_id === stu.student_id && a.subject_id === selectedSubjectId
                  );
                  const attendedCount = subjectRecords.filter(
                    (a) => a.status === 'Present'
                  ).length;
                  const pct = calculateAttendancePercentage(
                    attendedCount,
                    subjectRecords.length
                  );

                  return (
                    <tr
                      key={stu.student_id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-500">
                        {stu.student_id}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums font-semibold text-slate-900">
                        {stu.roll_no}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900">{stu.name}</div>
                        <div className="text-[11px] text-slate-400">{stu.email}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        {subjectRecords.length > 0 ? (
                          <span
                            className={
                              pct < 75
                                ? 'text-amber-700 font-semibold'
                                : 'text-slate-700 font-medium'
                            }
                          >
                            {pct}% ({attendedCount}/{subjectRecords.length})
                          </span>
                        ) : (
                          <span className="text-slate-400">No prior classes</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(stu.student_id, 'Present')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                              status === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(stu.student_id, 'Absent')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                              status === 'Absent'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
