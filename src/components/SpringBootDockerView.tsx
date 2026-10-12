import React, { useState } from 'react';
import { Copy, Check, Download, Database, Server, Terminal, RotateCcw } from 'lucide-react';
import { DatabaseState, ApiTransactionLog } from '../data/attendanceStore';
import { SPRING_BOOT_DOCKER_BLUEPRINTS } from '../data/backendBlueprints';

interface SpringBootDockerViewProps {
  db: DatabaseState;
  apiLogs: ApiTransactionLog[];
  onResetDatabase: () => void;
  onSimulateHealthCheck: () => void;
}

export const SpringBootDockerView: React.FC<SpringBootDockerViewProps> = ({
  db,
  apiLogs,
  onResetDatabase,
  onSimulateHealthCheck,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('docker-compose');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('ATTENDANCE');

  const activeFile =
    SPRING_BOOT_DOCKER_BLUEPRINTS.find((f) => f.id === selectedFileId) ||
    SPRING_BOOT_DOCKER_BLUEPRINTS[0];

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const entityDetails: Record<
    string,
    {
      title: string;
      purpose: string;
      pk: string;
      fks: string;
      relationships: string;
      count: number;
    }
  > = {
    ADMIN: {
      title: 'ADMIN Entity',
      purpose: 'Manages system information, teacher accounts, and student records.',
      pk: 'admin_id (PK)',
      fks: 'None',
      relationships: 'manages 1:N TEACHER · manages 1:N STUDENT',
      count: db.admins.length,
    },
    TEACHER: {
      title: 'TEACHER Entity',
      purpose: 'Logs in, marks daily attendance, and teaches assigned subjects.',
      pk: 'teacher_id (PK)',
      fks: 'admin_id (FK)',
      relationships: 'teaches 1:N SUBJECT · marks 1:N ATTENDANCE',
      count: db.teachers.length,
    },
    SUBJECT: {
      title: 'SUBJECT Entity',
      purpose: 'Stores subject details, course codes, and teacher/class assignment.',
      pk: 'subject_id (PK)',
      fks: 'teacher_id (FK) · class_id (FK)',
      relationships: 'assigned to 1 CLASS · recorded in 1:N ATTENDANCE',
      count: db.subjects.length,
    },
    STUDENT: {
      title: 'STUDENT Entity',
      purpose: 'Stores student profile, roll number, and class membership.',
      pk: 'student_id (PK)',
      fks: 'class_id (FK)',
      relationships: 'belongs to 1 CLASS · records 1:N ATTENDANCE',
      count: db.students.length,
    },
    ATTENDANCE: {
      title: 'ATTENDANCE Entity',
      purpose: 'Stores each student attendance status (Present / Absent) for a date and subject.',
      pk: 'attendance_id (PK)',
      fks: 'student_id (FK) · subject_id (FK) · teacher_id (FK) · class_id (FK)',
      relationships: 'links STUDENT, SUBJECT, TEACHER, and CLASS by date',
      count: db.attendance.length,
    },
    CLASS: {
      title: 'CLASS Entity',
      purpose: 'Stores academic class name and section division.',
      pk: 'class_id (PK)',
      fks: 'None',
      relationships: 'contains 1:N STUDENT · has 1:N SUBJECT',
      count: db.classes.length,
    },
  };

  const currentEntity = entityDetails[selectedEntity];

  return (
    <div className="space-y-8">
      {/* Top Architecture Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1.5 max-w-3xl">
          <div className="text-xs font-medium text-[#A100FF] tracking-tight">
            Section 4 & Docker Container Architecture · In-Browser Spring Boot Simulation
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Java Spring Boot 3.2, Docker Compose & ER Relational Engine
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Because cloud free tiers restrict multi-container Java + MySQL Docker deployments, all
            Spring Boot REST controllers, JPA foreign-key constraints, and MySQL queries execute
            directly in your browser with full persistence—while providing the complete{' '}
            <span className="font-mono text-xs text-slate-800">docker-compose.yml</span> and Spring
            Boot source files ready for submission.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onSimulateHealthCheck}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Server className="w-3.5 h-3.5 text-[#A100FF]" />
            Ping Spring Boot API
          </button>
          <button
            onClick={onResetDatabase}
            className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Seed Database
          </button>
        </div>
      </div>

      {/* Section 4: Interactive Entity-Relationship (ER) Diagram (Matching Page 5 of PDF) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              01. Interactive Entity–Relationship (ER) Diagram
            </h3>
            <p className="text-xs text-slate-500">
              Click any of the 6 core entities from Page 5 of the specification to inspect attributes,
              keys, and live row counts.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            PK = Primary Key · FK = Foreign Key · 1:N = One-to-Many
          </div>
        </div>

        {/* 3x2 Interactive ER Grid with Relationship Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Row 1: ADMIN -> manages 1:N -> TEACHER -> teaches 1:N -> SUBJECT */}
          <button
            type="button"
            onClick={() => setSelectedEntity('ADMIN')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              selectedEntity === 'ADMIN'
                ? 'border-[#A100FF] bg-[#A100FF]/[0.03]'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-display">ADMIN</span>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {db.admins.length} row
              </span>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-700">admin_id (PK)</div>
            <div className="text-xs text-slate-500 mt-0.5">name · email</div>
            <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] font-mono text-[#A100FF]">
              manages 1:N → TEACHER, STUDENT
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedEntity('TEACHER')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              selectedEntity === 'TEACHER'
                ? 'border-[#A100FF] bg-[#A100FF]/[0.03]'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-display">TEACHER</span>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {db.teachers.length} rows
              </span>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-700">teacher_id (PK)</div>
            <div className="text-xs text-slate-500 mt-0.5">name · email · department</div>
            <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] font-mono text-[#A100FF]">
              teaches 1:N → SUBJECT · marks 1:N → ATTENDANCE
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedEntity('SUBJECT')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              selectedEntity === 'SUBJECT'
                ? 'border-[#A100FF] bg-[#A100FF]/[0.03]'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-display">SUBJECT</span>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {db.subjects.length} rows
              </span>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-700">subject_id (PK)</div>
            <div className="text-xs text-slate-500 mt-0.5">
              subject_name · teacher_id (FK) · class_id (FK)
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] font-mono text-[#A100FF]">
              class has subjects · 1:N → ATTENDANCE
            </div>
          </button>

          {/* Row 2: STUDENT -> records 1:N -> ATTENDANCE <- for class <- CLASS */}
          <button
            type="button"
            onClick={() => setSelectedEntity('STUDENT')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              selectedEntity === 'STUDENT'
                ? 'border-[#A100FF] bg-[#A100FF]/[0.03]'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-display">STUDENT</span>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {db.students.length} rows
              </span>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-700">student_id (PK)</div>
            <div className="text-xs text-slate-500 mt-0.5">
              roll_no · name · email · class_id (FK)
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] font-mono text-[#A100FF]">
              records 1:N → ATTENDANCE
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedEntity('ATTENDANCE')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              selectedEntity === 'ATTENDANCE'
                ? 'border-[#A100FF] bg-[#A100FF]/[0.03]'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-display">ATTENDANCE</span>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {db.attendance.length} rows
              </span>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-700">attendance_id (PK)</div>
            <div className="text-xs text-slate-500 mt-0.5">
              student_id (FK) · date · subject_id · teacher_id · status
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] font-mono text-[#A100FF]">
              Central Fact Table · Present / Absent
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedEntity('CLASS')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              selectedEntity === 'CLASS'
                ? 'border-[#A100FF] bg-[#A100FF]/[0.03]'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-display">CLASS</span>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {db.classes.length} rows
              </span>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-700">class_id (PK)</div>
            <div className="text-xs text-slate-500 mt-0.5">class_name · section</div>
            <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] font-mono text-[#A100FF]">
              1:N → STUDENT · 1:N → SUBJECT
            </div>
          </button>
        </div>

        {/* Selected Entity Detail Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-bold text-slate-900">
              {currentEntity.title}{' '}
              <span className="text-xs font-normal text-slate-500">
                · {currentEntity.purpose}
              </span>
            </div>
            <div className="text-xs text-slate-600 font-mono">
              Primary Key: {currentEntity.pk} · Foreign Keys: {currentEntity.fks} · Cardinality:{' '}
              {currentEntity.relationships}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-500">Active In-Memory Records</div>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
              {currentEntity.count}
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Split: Docker Compose & Spring Boot Source Files + Live Spring Boot Request Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Code & Docker Compose YAML Viewer */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  02. Docker Compose & Java Spring Boot Source Files
                </h3>
                <p className="text-xs text-slate-500">
                  Production-ready files included in project repository for academic submission.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(activeFile.content, activeFile.id)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedId === activeFile.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy File
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownload(activeFile.filename, activeFile.content)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#A100FF] hover:bg-[#8800D8] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download {activeFile.filename}
                </button>
              </div>
            </div>

            {/* File Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              {SPRING_BOOT_DOCKER_BLUEPRINTS.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedFileId === file.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {file.filename}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500">
              <span className="font-mono text-slate-700">{activeFile.path}</span> ·{' '}
              {activeFile.description}
            </div>

            <pre className="bg-[#0F172A] text-slate-100 p-4 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed max-h-[420px] overflow-y-auto">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>

        {/* Right 5 Columns: Live Simulated Spring Boot REST & SQL Log */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  03. Spring Boot JPA & REST Console
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time log of simulated REST controller & SQL statements triggered by UI actions.
                </p>
              </div>
              <Terminal className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            <div className="space-y-3 max-h-[470px] overflow-y-auto pr-1">
              {apiLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="font-semibold text-slate-900">
                      {log.method} {log.endpoint}
                    </span>
                    <span className="text-emerald-700">
                      HTTP {log.status} · {log.durationMs}ms
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">{log.summary}</div>
                  <div className="bg-slate-900 text-slate-200 px-3 py-2 rounded text-[11px] font-mono overflow-x-auto">
                    {log.sqlPreview}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                    Timestamp: {log.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#A100FF]" />
              Browser LocalStorage + In-Memory JPA Engine
            </span>
            <span className="font-mono tabular-nums">{apiLogs.length} transactions logged</span>
          </div>
        </div>
      </div>
    </div>
  );
};
