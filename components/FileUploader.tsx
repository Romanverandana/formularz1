'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { FileWithProgress } from '../lib/types';

// --- Helper Functions and Icons ---

function uid() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {}
  return Math.random().toString(36).slice(2);
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

const PaperclipIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M21.44 11.05l-8.49 8.49a6 6 0 01-8.49-8.49l8.49-8.49a4 4 0 015.66 5.66L10.6 16.73a2 2 0 11-2.83-2.83l7.07-7.07"
      stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const DocIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7l-5-5z"
      stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v5h5" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 13h6M9 17h6M9 9h2" stroke="#111" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);


// --- Main Component ---

type Props = {
  files: FileWithProgress[];
  onFilesChange: React.Dispatch<React.SetStateAction<FileWithProgress[]>>;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  note?: string;
  buttonLabel?: string;
};

export default function FileUploader({
  files,
  onFilesChange,
  accept = "image/jpeg, image/png, image/webp, application/pdf",
  multiple = true,
  maxSizeMB = 5,
  title = "Dodaj zdjęcia lub plany",
  note,
  buttonLabel = "Wybierz pliki",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const acceptLabel = useMemo(() => {
    if (accept.includes("image") && accept.includes("pdf"))
      return "obrazy (PNG/JPG/WebP) i PDF";
    if (accept.includes("image")) return "obrazy (PNG/JPG/WebP)";
    if (accept.includes("pdf")) return "PDF";
    return accept || "pliki";
  }, [accept]);

  const onChooseClick = () => inputRef.current?.click();

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const selected = Array.from(fileList);
      const withIds: FileWithProgress[] = selected.map((f) => {
        if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) {
          return {
            id: uid(),
            file: f,
            progress: 0,
            error: `Plik przekracza ${maxSizeMB} MB`,
          };
        }
        return { id: uid(), file: f, progress: 0 };
      });

      onFilesChange((prev) => [...prev, ...withIds]);

      withIds.forEach((fw) => {
        if (fw.error || !fw.file.type.startsWith("image/")) {
            onFilesChange(prev => prev.map(item => item.id === fw.id ? { ...item, progress: 100 } : item));
            return;
        };
        const reader = new FileReader();

        reader.onload = (e) => {
          const result = e.target?.result;
          const preview = typeof result === "string" ? result : undefined;
          onFilesChange((prev) =>
            prev.map((item) =>
              item.id === fw.id ? { ...item, preview, progress: 100 } : item
            )
          );
        };

        reader.onprogress = (ev) => {
          if (!ev.lengthComputable) return;
          const progressPct = Math.min(99, Math.round((ev.loaded / ev.total) * 100));
          onFilesChange((prev) =>
            prev.map((item) =>
              item.id === fw.id ? { ...item, progress: progressPct } : item
            )
          );
        };

        reader.onerror = () => {
          onFilesChange((prev) =>
            prev.map((item) =>
              item.id === fw.id
                ? { ...item, error: "Nie udało się wczytać podglądu" }
                : item
            )
          );
        };

        reader.readAsDataURL(fw.file);
      });
    },
    [maxSizeMB, onFilesChange]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    onFilesChange((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => onFilesChange([]);

  return (
    <div className="uploader">
      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onClick={onChooseClick}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); }}
        onDrop={onDrop}
        role="button"
        aria-label="Dodaj pliki"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChooseClick();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hiddenInput"
          accept={accept}
          multiple={multiple}
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="iconWrap" aria-hidden="true">{PaperclipIcon}</div>
        <div className="copy">
          <div className="title">{title}</div>
          <div className="meta">
            Obsługiwane: <b>{acceptLabel}</b> · Limit: <b>{maxSizeMB} MB</b> / plik
            {note ? <> · {note}</> : null}
          </div>
          <div className="actions">
            <button type="button" className="btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChooseClick(); }}>
              {buttonLabel}
            </button>
            <span className="hint">lub upuść tutaj</span>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="listWrap">
          <div className="listHead">
            <div className="listTitle">Wybrane pliki ({files.length})</div>
            <button type="button" className="linkBtn" onClick={clearAll}>
              Wyczyść wszystkie
            </button>
          </div>
          <ul className="fileList">
            {files.map((f) => (
              <li key={f.id} className={`fileItem ${f.error ? "isError" : ""}`}>
                <div className="thumb">
                  {f.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.preview} alt={f.file.name} />
                  ) : (
                    <div className="thumbIcon" aria-hidden="true">{DocIcon}</div>
                  )}
                </div>
                <div className="fileInfo">
                  <div className="fileName" title={f.file.name}>{f.file.name}</div>
                  <div className="fileMeta">{formatSize(f.file.size)} · {f.file.type || "brak typu"}</div>
                  {f.error ? (
                    <div className="errorText">{f.error}</div>
                  ) : (
                    <div className="progress" aria-label={`Postęp ${f.progress}%`}>
                      <div className="bar" style={{ width: `${f.progress}%` }} />
                    </div>
                  )}
                </div>
                <div className="fileActions">
                  <button type="button" className="linkBtn" onClick={() => removeFile(f.id)} aria-label={`Usuń ${f.file.name}`}>
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .uploader { display: flex; flex-direction: column; gap: 16px; font-family: inherit; }
        .dropzone { border: 1px dashed #cbd5e1; background: #fafafa; border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 16px; transition: all 0.2s ease; cursor: pointer; }
        .dropzone:hover { border-color: #3b82f6; background: #f7f7f7; }
        .dropzone.dragging { border-color: #3b82f6; background: #f0f0f0; box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08); transform: translateY(-1px); }
        .hiddenInput { display: none; }
        .iconWrap { width: 44px; height: 44px; border-radius: 12px; background: white; border: 1px solid #e2e8f0; display: grid; place-items: center; flex-shrink: 0; }
        .copy { display: grid; gap: 4px; text-align: left; }
        .title { font-size: 15px; font-weight: 600; color: #1e293b; }
        .meta { font-size: 13px; color: #64748b; }
        .actions { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
        .btn { border: 1px solid #e2e8f0; background: #fff; color: #334155; font-size: 13px; padding: 8px 12px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn:hover { background: #f8fafc; }
        .hint { font-size: 12px; color: #94a3b8; }
        .listWrap { border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; }
        .listHead { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid #f1f5f9; }
        .listTitle { font-size: 14px; font-weight: 600; color: #1e293b; }
        .linkBtn { background: transparent; border: none; color: #3b82f6; font-size: 13px; font-weight: 600; cursor: pointer; padding: 4px; }
        .fileList { list-style: none; margin: 0; padding: 8px; display: grid; gap: 8px; }
        .fileItem { display: grid; grid-template-columns: 48px 1fr auto; gap: 12px; align-items: center; padding: 8px; border-radius: 10px; }
        .fileItem.isError { border: 1px solid #fecaca; background: #fef2f2; }
        .thumb { width: 48px; height: 48px; border-radius: 8px; overflow: hidden; background: #f1f5f9; display: grid; place-items: center; flex-shrink: 0; }
        .thumb img { width: 100%; height: 100%; object-fit: cover; }
        .thumbIcon { width: 22px; height: 22px; opacity: 0.7; }
        .fileInfo { display: grid; gap: 4px; min-width: 0; }
        .fileName { font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fileMeta { font-size: 12px; color: #64748b; }
        .errorText { font-size: 12px; color: #dc2626; font-weight: 500; }
        .progress { width: 100%; height: 6px; border-radius: 8px; background: #e2e8f0; overflow: hidden; }
        .bar { height: 100%; background: #e88c7d; width: 0%; border-radius: 8px; transition: width 160ms ease; }
        .fileActions { padding-left: 8px; }
      `}</style>
    </div>
  );
}