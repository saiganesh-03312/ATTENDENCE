import React, { useState, useMemo } from 'react';
import { GraduationCap, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Calendar } from 'lucide-react';
import {
  DatabaseState,
  calculateAttendancePercentage,
} from '../data/attendanceStore';

interface StudentModuleViewProps {
  db: DatabaseState;
}

export const StudentModuleView: React.FC<StudentModuleViewProps> = ({ db }) => {
  // Default to STU-203 (25EG505R03) if present, otherwise first student
  const defaultStudent =
    db.students.find((s) => s.roll_no === '25EG505R03') || db.students[0];

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    defaultStudent?.student_id || 'STU-203'
  );
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');

  const activeStudent =
    db.students.find((s) => s.student_id === selectedStudentId) || db.students[0];

  const activeClass = db.classes.find((c) => c.class_id === activeStudent?.class_id);

  // All attendance records for this student
  const studentAttendance = useMemo(() => {
    if (!activeStudent) return [];
    return db.attendance
      .filter((a) => a.student_id === activeStudent.student_id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [db.attendance, activeStudent]);

  const totalHeld = studentAttendance.length;
  const totalAttended = studentAttendance.filter((a) => a.status === 'Present').length;
  const totalMissed = totalHeld - totalAttended;
  const overallPercentage = calculateAttendancePercentage(totalAttended, totalHeld);

  // Subject-wise summary for this student
  const subjectBreakdown = useMemo(() => {
    if (!activeStudent) return [];
    const classSubjects = db.subjects.filter(
      (sub) =>
        sub.class_id === activeStudent.class_id ||
        studentAttendance.some((a) => a.subject_id === sub.subject_id)
    );
    return classSubjects.map((sub) => {
      const records = studentAttendance.filter((a) => a.subject_id === sub.subject_id);
      const attended = records.filter((a) => a.status === 'Present').length;
      const held = records.length;
      const missed = held - attended;
      const percentage = calculateAttendancePercentage(attended, held);
      const teacher = db.teachers.find((t) => t.teacher_id === sub.teacher_id);
      return {
        subject: sub,
        teacherName: teacher?.name || sub.teacher_id,
        held,
        attended,
        missed,
        percentage,
      };
    });
  }, [activeStudent, db.subjects, db.teachers, studentAttendance]);

  const filteredHistory =
    subjectFilter === 'ALL'
      ? studentAttendance
      : studentAttendance.filter((a) => a.subject_id === subjectFilter);

  return (
    <div className="space-y-6">
      {/* Header & Student Account Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-[#A100FF]">
            Section 3.3 · Student Module · Read-Only Personal Attendance Ledger
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {activeStudent?.name} ({activeStudent?.roll_no})
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-mono text-slate-700">{activeStudent?.student_id}</span>
            <span aria-hidden="true">·</span>
            <span>{activeStudent?.email}</span>
            <span aria-hidden="true">·</span>
            <span>
              {activeClass?.class_name} ({activeClass?.section})
            </span>
            <span aria-hidden="true">·</span>
            <span>Read-Only Access Enforced</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 whitespace-nowrap">
            <GraduationCap className="w-4 h-4 text-[#A100FF]" />
            Switch Student Session:
          </label>
          <select
            value={activeStudent?.student_id || ''}
            onChange={(e) => {
              setSelectedStudentId(e.target.value);
              setSubjectFilter('ALL');
            }}
            className="px-3.5 py-2 text-xs font-mono font-medium border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-[#A100FF]"
          >
            {db.students.map((stu) => (
              <option key={stu.student_id} value={stu.student_id}>
                {stu.roll_no} — {stu.name} ({stu.student_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4-Column Required Student Metrics Strip (Total Held, Attended, Missed, Percentage) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Total Classes Held</div>
          <div className="mt-1.5 text-3xl font-bold font-mono tabular-nums text-slate-900">
            {totalHeld}
          </div>
          <div className="mt-1.5 text-xs text-slate-500">
            Across {subjectBreakdown.length} enrolled subjects
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Classes Attended</div>
          <div className="mt-1.5 text-3xl font-bold font-mono tabular-nums text-emerald-700">
            {totalAttended}
          </div>
          <div className="mt-1.5 text-xs text-slate-500">
            Verified Present entries
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Classes Missed</div>
          <div className="mt-1.5 text-3xl font-bold font-mono tabular-nums text-red-600">
            {totalMissed}
          </div>
          <div className="mt-1.5 text-xs text-slate-500">
            Recorded Absent entries
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500">Attendance Percentage</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold font-mono tabular-nums ${
                overallPercentage >= 75 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {overallPercentage}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({totalAttended} ÷ {totalHeld}) × 100
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            {overallPercentage >= 75 ? (
              <span className="text-emerald-700 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Eligible (≥ 75% Academic Norm)
              </span>
            ) : (
              <span className="text-amber-700 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Below 75% Threshold Alert
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Split: Subject-wise Percentage Table + Chronological Attendance History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 6 Cols: Subject-wise Attendance Breakdown */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Subject-Wise Attendance Summary
            </h3>
            <p className="text-xs text-slate-500">
              Formula: Attendance Percentage = (Classes Attended ÷ Total Classes Held) × 100
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 text-right">Held</th>
                  <th className="py-2.5 px-3 text-right">Attended</th>
                  <th className="py-2.5 px-3 text-right">Missed</th>
                  <th className="py-2.5 px-3 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {subjectBreakdown.map((item) => (
                  <tr
                    key={item.subject.subject_id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">
                        {item.subject.subject_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <span className="font-mono">{item.subject.subject_code}</span> ·{' '}
                        {item.teacherName}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {item.held}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-medium">
                      {item.attended}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-red-600">
                      {item.missed}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                      <span
                        className={
                          item.percentage >= 75 || item.held === 0
                            ? 'text-slate-900'
                            : 'text-amber-700'
                        }
                      >
                        {item.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 6 Cols: Chronological Attendance Log */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Personal Attendance History Log
              </h3>
              <p className="text-xs text-slate-500">
                Chronological date-wise attendance records (Read-Only).
              </p>
            </div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-[#A100FF]"
            >
              <option value="ALL">All Subjects ({studentAttendance.length})</option>
              {subjectBreakdown.map((b) => (
                <option key={b.subject.subject_id} value={b.subject.subject_id}>
                  {b.subject.subject_code} — {b.subject.subject_name}
                </option>
              ))}
            </select>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No attendance entries recorded yet for this selection.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Entry ID</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredHistory.map((rec) => {
                    const sub = db.subjects.find((s) => s.subject_id === rec.subject_id);
                    return (
                      <tr key={rec.attendance_id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono tabular-nums text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {rec.date}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-slate-900">
                            {sub?.subject_name || rec.subject_id}
                          </span>{' '}
                          <span className="font-mono text-slate-400">
                            · {sub?.subject_code}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-slate-400">
                          {rec.attendance_id}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold">
                          {rec.status === 'Present' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <XCircle className="w-3.5 h-3.5" />
                              Absent
                            </span>
                          )}
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
    </div>
  );
};
