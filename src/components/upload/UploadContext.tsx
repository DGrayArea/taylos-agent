"use client";

import React, { createContext, useContext, useState } from "react";

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  progress: number; // 0-100
  status: "uploading" | "processing" | "complete" | "error";
}

interface UploadContextValue {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  updateFile: (id: string, patch: Partial<UploadedFile>) => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const updateFile = (id: string, patch: Partial<UploadedFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );
  };

  return (
    <UploadContext.Provider value={{ files, setFiles, updateFile }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be used inside <UploadProvider>");
  return ctx;
}
