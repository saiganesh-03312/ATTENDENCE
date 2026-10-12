import React, { useState, useMemo } from 'react';
import { Download, Filter, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  DatabaseState,
  calculateAttendancePercentage,
} from '../data/attendanceStore';

interface ReportsModuleViewProps {
  db: DatabaseState;
  onExportCsv: () => void;
}

export const ReportsModuleView: React.FC<ReportsModuleViewProps> = ({
  db,
  onExportCsv,
}) => {
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Present' | 'Absent'>('ALL');

  const uniqueDates = useMemo(() => {
    const set = new Set<string>(db.attendance.map((a) => a.date));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [db.attendance]);

  const filteredEntries = useMemo(() => {
    return db.attendance
      .filter((entry) => {
        if (classFilter !== 'ALL' && entry.class_id !== classFilter) return false;
        if (subjectFilter !== 'ALL' && entry.subject_id !== subjectFilter) return false;
        if (dateFilter !== 'ALL' && entry.date !== dateFilter) return false;
        if (statusFilter !== 'ALL' && entry.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [db.attendance, classFilter, subjectFilter, dateFilter, statusFilter]);

  // Student-wise aggregated report based on selected Class and Subject filters
  const studentSummaryRows = useMemo(() => {
    const targetStudents =
      classFilter === 'ALL'
        ? db.students
        : db.students.filter((s) => s.class_id === classFilter);

    return targetStudents.map((stu) => {
      const records = db.attendance.filter((a) => {
        if (a.student_id !== stu.student_id) return false;
        if (subjectFilter !== 'ALL' && a.subject_id !== subjectFilter) return false;
        if (dateFilter !== 'ALL' && a.date !== dateFilter) return false;
        return true;
      });
      const held = records.length;
      const attended = records.filter((r) => r.status === 'Present').length;
      const missed = held - attended;
      const percentage = calculateAttendancePercentage(attended, held);
      const cls = db.classes.find((c) => c.class_id === stu.class_id);

      return {
        student: stu,
        className: cls ? `${cls.class_name} · ${cls.section}` : stu.class_id,
        held,
        attended,
        missed,
        percentage,
      };
    });
  }, [db.students, db.attendance, db.classes, classFilter, subjectFilter, dateFilter]);

  const totalPresentInFilter = filteredEntries.filter((e) => e.status === 'Present').length;
  const totalAbsentInFilter = filteredEntries.length - totalPresentInFilter;
  const filteredAggregatePct = calculateAttendancePercentage(
    totalPresentInFilter,
    filteredEntries.length
  );

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="text-xs font-medium text-[#A100FF]">
              Section 3.4 · Attendance and Report Module · Automated Percentage Analytics
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Daily & Subject-Wise Attendance Reports
            </h2>
            <p className="text-sm text-slate-600">
              Filter records by class, subject, date, or status. Calculates percentage automatically:{' '}
              <span className="font-mono text-xs text-slate-800">
                (Classes Attended ÷ Total Classes Held) × 100
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setClassFilter('ALL');
                setSubjectFilter('ALL');
                setDateFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={onExportCsv}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#A100FF] hover:bg-[#8800D8] rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Report
            </button>
          </div>
        </div>

        {/* 4 Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-[#A100FF]" />
              Class Cohort
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:outline-none focus:border-[#A100FF]"
            >
              <option value="ALL">All Classes ({db.classes.length})</option>
              {db.classes.map((c) => (
                <option key={c.class_id} value={c.class_id}>
                  {c.class_name} · {c.section}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:outline-none focus:border-[#A100FF]"
            >
              <option value="ALL">All Subjects ({db.subjects.length})</option>
              {db.subjects.map((s) => (
                <option key={s.subject_id} value={s.subject_id}>
                  {s.subject_code} — {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Date</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-mono text-slate-900 focus:outline-none focus:border-[#A100FF]"
            >
              <option value="ALL">All Recorded Dates ({uniqueDates.length})</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Attendance Status
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['ALL', 'Present', 'Absent'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Filtered Attendance Entries</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {filteredEntries.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">Total records matching query</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Present Count</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {totalPresentInFilter}
          </div>
          <div className="mt-1 text-xs text-slate-500">Verified Present sessions</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Absent Count</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-red-600">
            {totalAbsentInFilter}
          </div>
          <div className="mt-1 text-xs text-slate-500">Recorded absences</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Aggregate Attendance Rate</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {filteredAggregatePct}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            ({totalPresentInFilter} ÷ {filteredEntries.length}) × 100
          </div>
        </div>
      </div>

      {/* Student Percentage Summary Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              01. Student-Wise Attendance Percentage Summary
            </h3>
            <p className="text-xs text-slate-500">
              Automatic percentage calculation and 75% academic threshold compliance check.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Showing {studentSummaryRows.length} students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Class & Section</th>
                <th className="py-2.5 px-3 text-right">Classes Held</th>
                <th className="py-2.5 px-3 text-right">Attended</th>
                <th className="py-2.5 px-3 text-right">Missed</th>
                <th className="py-2.5 px-3 text-right">Percentage</th>
                <th className="py-2.5 px-3 text-right">Academic Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {studentSummaryRows.map((row) => (
                <tr key={row.student.student_id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-mono tabular-nums text-slate-500">
                    {row.student.student_id}
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums font-semibold text-slate-900">
                    {row.student.roll_no}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900">{row.student.name}</td>
                  <td className="py-3 px-3 text-slate-600">{row.className}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    {row.held}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-medium">
                    {row.attended}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-red-600">
                    {row.missed}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                    {row.percentage}%
                  </td>
                  <td className="py-3 px-3 text-right">
                    {row.held === 0 ? (
                      <span className="text-slate-400">No Sessions</span>
                    ) : row.percentage >= 75 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Good Standing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Low Attendance (&lt;75%)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Relational Attendance Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              02. Relational Attendance Database Entries (ATTENDANCE Entity)
            </h3>
            <p className="text-xs text-slate-500">
              Complete foreign-key linked records across Student, Subject, Teacher, and Class.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {filteredEntries.length} rows
          </span>
        </div>

        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-3">Attendance ID (PK)</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Student (FK)</th>
                <th className="py-2.5 px-3">Subject (FK)</th>
                <th className="py-2.5 px-3">Teacher (FK)</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEntries.map((item) => {
                const stu = db.students.find((s) => s.student_id === item.student_id);
                const sub = db.subjects.find((s) => s.subject_id === item.subject_id);
                const tch = db.teachers.find((t) => t.teacher_id === item.teacher_id);
                return (
                  <tr key={item.attendance_id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500">
                      {item.attendance_id}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-800">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-900">
                        {stu?.name || item.student_id}
                      </span>{' '}
                      <span className="font-mono text-slate-400">· {stu?.roll_no}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-800">{sub?.subject_name}</span>{' '}
                      <span className="font-mono text-slate-400">· {sub?.subject_code}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {tch?.name || item.teacher_id}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      {item.status === 'Present' ? (
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
      </div>
    </div>
  );
};
