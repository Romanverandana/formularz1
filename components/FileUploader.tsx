"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import type { FileWithProgress } from "../lib/types";

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
  accept = "image/*",
  multiple = true,
  maxSizeMB = 20,
  title = "Przeciągnij i upuść pliki tutaj",
  note,
  buttonLabel = "Wybierz pliki",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const acceptLabel = useMemo(() => {
    if (accept.includes("image/*") && accept.includes("pdf"))
      return "obrazy (PNG/JPG/WebP) i PDF";
    if (accept.includes("image/*")) return "obrazy (PNG/JPG/WebP)";
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
        if (!fw.file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          const preview = typeof result === "string" ? result : undefined;
          onFilesChange((prev) =>
            prev.map((p) =>
              p.id === fw.id ? { ...p, preview, progress: 100 } : p
            )
          );
        };
        reader.onprogress = (ev) => {
          if (!ev.lengthComputable) return;
          const p = Math.min(99, Math.round((ev.loaded / ev.total) * 100));
          onFilesChange((prev) =>
            prev.map((p) => (p.id === fw.id ? { ...p, progress: p } : p))
          );
        };
        reader.onerror = () => {
          onFilesChange((prev) =>
            prev.map((p) =>
              p.id === fw.id
                ? { ...p, error: "Nie udało się wczytać podglądu" }
                : p
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
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
        }}
        onDrop={onDrop}
        role="button"
        aria-label="Dodaj pliki"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          className="hiddenInput"
          accept={accept}
          multiple={multiple}
          onChange={(e) => addFiles(e.target.files)}
        />

        <div className="iconWrap" aria-hidden="true">
          {PaperclipIcon}
        </div>

        <div className="copy">
          <div className="title">{title}</div>
          <div className="meta">
            Obsługiwane: <b>{acceptLabel}</b> · Limit: <b>{maxSizeMB} MB</b> / plik
            {note ? <> · {note}</> : null}
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChooseClick();
              }}
            >
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
                    <div className="thumbIcon" aria-hidden="true">
                      {DocIcon}
                    </div>
                  )}
                </div>

                <div className="fileInfo">
                  <div className="fileName" title={f.file.name}>
                    {f.file.name}
                  </div>
                  <div className="fileMeta">
                    {formatSize(f.file.size)} · {f.file.type || "brak typu"}
                  </div>

                  {f.error ? (
                    <div className="errorText">{f.error}</div>
                  ) : (
                    <div className="progress" aria-label={`Postęp ${f.progress}%`}>
                      <div className="bar" style={{ width: `${f.progress}%` }} />
                    </div>
                  )}
                </div>

                <div className="fileActions">
                  <button
                    type="button"
                    className="linkBtn"
                    onClick={() => removeFile(f.id)}
                    aria-label={`Usuń ${f.file.name}`}
                  >
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .uploader {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .dropzone {
          border: 1px dashed rgba(17, 17, 17, 0.25);
          background: #fafafa;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .dropzone:hover {
          border-color: rgba(17, 17, 17, 0.45);
          background: #f7f7f7;
        }
        .dropzone.dragging {
          border-color: rgba(17, 17, 17, 0.8);
          background: #f0f0f0;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }
        .hiddenInput {
          display: none;
        }
        .iconWrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: white;
          border: 1px solid rgba(17, 17, 17, 0.08);
          display: grid;
          place-items: center;
        }
        .copy {
          display: grid;
          gap: 6px;
        }
        .title {
          font-size: 15px;
          font-weight: 600;
          color: #111;
        }
        .meta {
          font-size: 13px;
          color: #6d6d6d;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }
        .btn {
          border: 1px solid rgba(17, 17, 17, 0.15);
          background: #111;
          color: white;
          font-size: 13px;
          padding: 8px 12px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn:hover {
          background: #222;
        }
        .hint {
          font-size: 12px;
          color: #6d6d6d;
        }
        .listWrap {
          border: 1px solid rgba(17, 17, 17, 0.08);
          border-radius: 14px;
          background: #fff;
        }
        .listHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          border-bottom: 1px solid rgba(17, 17, 17, 0.06);
        }
        .listTitle {
          font-size: 14px;
          font-weight: 600;
          color: #111;
        }
        .linkBtn {
          background: transparent;
          border: none;
          color: #0b5fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .fileList {
          list-style: none;
          margin: 0;
          padding: 8px;
          display: grid;
          gap: 8px;
        }
        .fileItem {
          display: grid;
          grid-template-columns: 56px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 8px;
          border-radius: 12px;
          border: 1px solid rgba(17, 17, 17, 0.06);
          background: #fafafa;
        }
        .fileItem.isError {
          border-color: rgba(200, 30, 30, 0.25);
          background: #fff6f6;
        }
        .thumb {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          overflow: hidden;
          background: #f0f0f0;
          display: grid;
          place-items: center;
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .fileInfo {
          display: grid;
          gap: 6px;
        }
        .fileName {
          font-size: 13px;
          font-weight: 600;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fileMeta {
          font-size: 12px;
          color: #6d6d6d;
        }
        .errorText {
          font-size: 12px;
          color: #b21616;
          font-weight: 600;
        }
        .progress {
          width: 100%;
          height: 6px;
          border-radius: 8px;
          background: rgba(17, 17, 17, 0.06);
          overflow: hidden;
        }
        .bar {
          height: 100%;
          background: #FA8072; /* ŁOSOSIOWY */
          width: 0%;
          border-radius: 8px;
          transition: width 160ms ease;
        }
      `}</style>
    </div>
  );
}

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
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
      stroke="#111"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7l-5-5z"
      stroke="#111"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2v5h5"
      stroke="#111"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 13h6M9 17h6M9 9h2"
      stroke="#111"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
