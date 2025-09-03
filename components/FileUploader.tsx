// components/FileUploader.tsx
'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { FileWithProgress } from '../app/page';
import styles from './FileUploader.module.css';

// --- Helper Functions and Icons ---
function uid() {
  return Math.random().toString(36).slice(2);
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

const PaperclipIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-8.49 8.49a6 6 0 01-8.49-8.49l8.49-8.49a4 4 0 015.66 5.66L10.6 16.73a2 2 0 11-2.83-2.83l7.07-7.07" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const DocIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7l-5-5z" stroke="#4B5563" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 2v5h5" stroke="#4B5563" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 13h6M9 17h6M9 9h2" stroke="#4B5563" strokeWidth="1.4" strokeLinecap="round" /></svg>;

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
  accept = "image/jpeg, image/png, image/webp, image/heic, image/heif, application/pdf", // Dodano HEIC/HEIF
  multiple = true,
  maxSizeMB = 5,
  title = "Przeciągnij pliki tutaj lub kliknij, aby wybrać", // Zmieniony domyślny tytuł
  note,
  buttonLabel = "Wybierz pliki",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const acceptLabel = useMemo(() => {
    const parts = [];
    if (accept.includes("image/jpeg") || accept.includes("image/png") || accept.includes("image/webp") || accept.includes("image/heic")) {
      parts.push("obrazy (JPG/PNG/WebP/HEIC)"); // Zaktualizowano opis
    }
    if (accept.includes("application/pdf")) {
      parts.push("PDF");
    }
    return parts.length > 0 ? parts.join(" i ") : "pliki";
  }, [accept]);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const withIds: FileWithProgress[] = Array.from(fileList).map(file => ({
      id: uid(),
      file,
      progress: 0,
      ...(maxSizeMB && file.size > maxSizeMB * 1024 * 1024 && { error: `Plik przekracza ${maxSizeMB} MB` }),
    }));

    onFilesChange(prev => [...prev, ...withIds]);

    withIds.forEach(fw => {
      if (fw.error || !fw.file.type.startsWith("image/")) {
        onFilesChange(prev => prev.map(item => item.id === fw.id ? { ...item, progress: 100 } : item));
        return;
      }
      const reader = new FileReader();
      reader.onload = e => onFilesChange(prev => prev.map(item => item.id === fw.id ? { ...item, preview: e.target?.result as string, progress: 100 } : item));
      reader.onprogress = e => e.lengthComputable && onFilesChange(prev => prev.map(item => item.id === fw.id ? { ...item, progress: Math.min(99, Math.round((e.loaded / e.total) * 100)) } : item));
      reader.onerror = () => onFilesChange(prev => prev.map(item => item.id === fw.id ? { ...item, error: "Błąd wczytywania podglądu" } : item));
      reader.readAsDataURL(fw.file);
    });
  }, [maxSizeMB, onFilesChange]);

  const removeFile = (id: string) => onFilesChange(prev => prev.filter(f => f.id !== id));
  const clearAll = () => onFilesChange([]);

  return (
    <div className={styles.uploader}>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        role="button" tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" className={styles.hiddenInput} accept={accept} multiple={multiple} onChange={(e) => addFiles(e.target.files)} />
        <div className={styles.iconWrap} aria-hidden="true">{PaperclipIcon}</div>
        <div className={styles.copy}>
          <div className={styles.title}>{title}</div>
          <div className={styles.meta}>Obsługiwane: <b>{acceptLabel}</b> · Limit: <b>{maxSizeMB} MB</b> / plik{note && ` · ${note}`}</div>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>{buttonLabel}</button>
            <span className={styles.hint}>lub upuść tutaj</span>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className={styles.listWrap}>
          <div className={styles.listHead}>
            <div className={styles.listTitle}>Wybrane pliki ({files.length})</div>
            <button type="button" className={styles.linkBtn} onClick={clearAll}>Wyczyść wszystkie</button>
          </div>
          <ul className={styles.fileList}>
            {files.map(f => (
              <li key={f.id} className={`${styles.fileItem} ${f.error ? styles.isError : ""}`}>
                <div className={styles.thumb}>{f.preview ? <img src={f.preview} alt={f.file.name} /> : <div className={styles.thumbIcon} aria-hidden="true">{DocIcon}</div>}</div>
                <div className={styles.fileInfo}>
                  <div className={styles.fileName} title={f.file.name}>{f.file.name}</div>
                  <div className={styles.fileMeta}>{formatSize(f.file.size)}</div>
                  {f.error ? <div className={styles.errorText}>{f.error}</div> : <div className={styles.progress}><div className={styles.bar} style={{ width: `${f.progress}%` }} /></div>}
                </div>
                <div className={styles.fileActions}>
                  <button type="button" className={styles.removeBtn} onClick={() => removeFile(f.id)} aria-label={`Usuń ${f.file.name}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}