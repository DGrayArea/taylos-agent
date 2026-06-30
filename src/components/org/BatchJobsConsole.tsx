"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  UploadCloud,
  FileText,
  Trash2,
  X,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BatchJobItem {
  id: string;
  files_count: number;
  status: "Queued" | "Processing" | "Complete" | "Failed";
  submitted_at: string;
  progress: number; // 0 to 100
}

interface BatchJobsConsoleProps {
  orgId: string;
  orgName: string;
}

const INITIAL_JOBS: BatchJobItem[] = [
  {
    id: "JOB-4821",
    files_count: 8,
    status: "Complete",
    submitted_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    progress: 100
  },
  {
    id: "JOB-0912",
    files_count: 14,
    status: "Complete",
    submitted_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    progress: 100
  },
  {
    id: "JOB-3102",
    files_count: 5,
    status: "Failed",
    submitted_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    progress: 40
  }
];

export function BatchJobsConsole({ orgId, orgName }: BatchJobsConsoleProps) {
  const [jobs, setJobs] = useState<BatchJobItem[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  
  // New Job Modal states
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize
  useEffect(() => {
    const saved = localStorage.getItem(`taylos_batches_${orgId}`);
    if (saved) {
      setJobs(JSON.parse(saved));
    } else {
      setJobs(INITIAL_JOBS);
      localStorage.setItem(`taylos_batches_${orgId}`, JSON.stringify(INITIAL_JOBS));
    }
  }, [orgId]);

  const saveJobs = (updated: BatchJobItem[]) => {
    setJobs(updated);
    localStorage.setItem(`taylos_batches_${orgId}`, JSON.stringify(updated));
  };

  // Simulate active job progression
  useEffect(() => {
    const active = jobs.some(j => j.status === "Queued" || j.status === "Processing");
    if (!active) return;

    const timer = setInterval(() => {
      const updated = jobs.map(j => {
        if (j.status === "Queued") {
          return { ...j, status: "Processing" as const, progress: 10 };
        }
        if (j.status === "Processing") {
          const nextProgress = j.progress + Math.floor(Math.random() * 25) + 5;
          if (nextProgress >= 100) {
            return { ...j, status: "Complete" as const, progress: 100 };
          }
          return { ...j, progress: nextProgress };
        }
        return j;
      });
      saveJobs(updated);
    }, 3000);

    return () => clearInterval(timer);
  }, [jobs]);

  // Modal handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).map(f => f.name);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(f => f.name);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    if (selectedFiles.length === 0) return;
    setModalStep(2);
  };

  const handleCancelJob = (id: string) => {
    const updated = jobs.map(j => j.id === id ? { ...j, status: "Failed" as const } : j);
    saveJobs(updated);
  };

  const handleSubmitBatch = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newJob: BatchJobItem = {
        id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
        files_count: selectedFiles.length,
        status: "Queued",
        submitted_at: new Date().toISOString(),
        progress: 0
      };

      saveJobs([newJob, ...jobs]);
      setIsSubmitting(false);
      setShowNewModal(false);
      // Reset Modal state
      setSelectedFiles([]);
      setModalStep(1);
    }, 1000);
  };

  const activeJobs = jobs.filter(j => j.status === "Queued" || j.status === "Processing");
  const completedJobs = jobs.filter(j => j.status === "Complete" || j.status === "Failed");

  const getStatusBadge = (status: BatchJobItem["status"]) => {
    if (status === "Queued") return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (status === "Processing") return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    if (status === "Complete") return "bg-emerald-500/10 text-emerald-455 border border-emerald-500/20";
    return "bg-rose-500/10 text-rose-450 border border-rose-500/20";
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 text-[13px] text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-[var(--color-gold-light)] uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            WORKSPACE: DISCIPLES BANK
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Batch Jobs
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Submit multiple documents for simultaneous processing
          </p>
        </div>

        <button
          onClick={() => {
            setModalStep(1);
            setSelectedFiles([]);
            setShowNewModal(true);
          }}
          className="px-4 py-2 bg-[var(--color-gold)] text-[var(--color-navy)] hover:opacity-90 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          New Batch Job
        </button>
      </div>

      {/* ACTIVE BATCH JOBS */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Batch Jobs</h3>
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] text-gray-450 font-bold uppercase tracking-wider border-b border-white/5">
                <th className="py-3.5 px-4 font-mono">Job ID</th>
                <th className="py-3.5 px-4">Files Submitted</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 w-44">Progress</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No active batch jobs running.
                  </td>
                </tr>
              ) : (
                activeJobs.map(job => (
                  <tr key={job.id} className="hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4 font-mono text-gray-300">{job.id}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{job.files_count} documents</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadge(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {new Date(job.submitted_at).toLocaleTimeString("en-GB")}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-gold)] transition-all duration-500"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono text-right">{job.progress}%</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {job.status === "Queued" && (
                        <button
                          onClick={() => handleCancelJob(job.id)}
                          className="px-2 py-1 rounded border border-rose-500/25 hover:border-rose-500/50 hover:bg-rose-550/10 text-rose-455 font-semibold text-[10px] transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPLETED BATCH JOBS */}
      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Completed Batch Jobs</h3>
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] text-gray-450 font-bold uppercase tracking-wider border-b border-white/5">
                <th className="py-3.5 px-4 font-mono">Job ID</th>
                <th className="py-3.5 px-4">Files Submitted</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 w-44">Progress</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {completedJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No completed batch jobs found.
                  </td>
                </tr>
              ) : (
                completedJobs.map(job => (
                  <tr key={job.id} className="hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4 font-mono text-gray-300">{job.id}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{job.files_count} documents</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadge(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-450">
                      {new Date(job.submitted_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${job.status === "Complete" ? "bg-emerald-500" : "bg-rose-500"} transition-all`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {job.status === "Complete" ? (
                        <>
                          <button className="px-2.5 py-1 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold text-[10px] transition-all cursor-pointer">
                            View Report
                          </button>
                          <button className="px-2.5 py-1 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold text-[10px] transition-all cursor-pointer">
                            Export CSV
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500 text-[10px]">Processing Failed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW BATCH MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0d12] border border-white/15 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setShowNewModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-indigo-400" />
              New Batch Job Submission
            </h2>

            {/* Stepper indicators */}
            <div className="flex gap-2 mb-6">
              <div className={`h-1 flex-1 rounded ${modalStep >= 1 ? "bg-[var(--color-gold)]" : "bg-white/5"}`} />
              <div className={`h-1 flex-1 rounded ${modalStep >= 2 ? "bg-[var(--color-gold)]" : "bg-white/5"}`} />
            </div>

            {/* STEP 1: UPLOAD FILES */}
            {modalStep === 1 && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-white/10 hover:border-[var(--color-gold)]/40 rounded-2xl p-8 text-center transition-all bg-white/[0.01] relative cursor-pointer group"
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-10 h-10 text-gray-500 group-hover:text-[var(--color-gold-light)] mx-auto mb-3 transition-colors" />
                  <p className="text-gray-300 font-semibold text-xs">Drag and drop multiple documents here</p>
                  <p className="text-[10px] text-gray-550 mt-1">Accepts PDF, Excel sheets, CSV or JSON logs</p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Uploaded Files ({selectedFiles.length})</div>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                          <span className="truncate max-w-[280px] text-gray-300 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[var(--color-gold)] shrink-0" />
                            {file}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(i)}
                            className="text-gray-550 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={selectedFiles.length === 0}
                    onClick={handleNextStep}
                    className="flex-1 py-2 bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-xs rounded-xl disabled:opacity-50"
                  >
                    Confirm Submission
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CONFIRM SUBMISSION */}
            {modalStep === 2 && (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Total documents selected:</span>
                    <span className="font-bold text-white">{selectedFiles.length} files</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Estimated processing time:</span>
                    <span className="font-bold text-[var(--color-gold-light)]">~{selectedFiles.length * 12} seconds</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed pt-2 border-t border-white/5">
                    💡 Simulataneous batching runs audits in parallel. Anomaly reviews and risk charts will compile automatically upon job completion.
                  </p>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalStep(1)}
                    className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitBatch}
                    className="flex-1 py-2 bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Batch"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
