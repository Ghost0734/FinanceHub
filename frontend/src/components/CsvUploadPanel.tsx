import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { UploadResponse } from "@/lib/types";
import { formatInteger, joinClassNames } from "@/lib/format";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { UploadIcon } from "./icons";
import { ErrorPanel } from "./StatePanel";

interface CsvUploadPanelProps {
  /** The dataset currently held by the backend session. */
  currentSource?: string;
  currentRows?: number;
  /** Called after a successful upload so the report can refetch. */
  onUploaded: (result: UploadResponse) => void;
}

/**
 * The CSV upload control.
 *
 * It reports exactly what the backend returned — rows ingested, flagged count,
 * and the session's new source label — and it warns before replacing the
 * dataset in memory, because the service has no reset endpoint and the previous
 * data cannot be recovered without restarting it.
 */
export function CsvUploadPanel({ currentSource, currentRows, onUploaded }: CsvUploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null);
  const handledResult = useRef<UploadResponse | null>(null);

  const upload = useAsyncAction(() => {
    if (file === null) {
      throw new Error("Choose a CSV file first.");
    }
    return api.uploadCsv(file);
  });

  // Hand each successful result to the page once, so it can refresh its data.
  useEffect(() => {
    if (upload.result !== null && upload.result !== handledResult.current) {
      handledResult.current = upload.result;
      setLastUpload(upload.result);
      setFile(null);
      onUploaded(upload.result);
    }
  }, [upload.result, onUploaded]);

  const acceptFile = (candidate: File | null | undefined) => {
    if (!candidate) return;
    if (!candidate.name.toLowerCase().endsWith(".csv")) {
      setFieldError("That file is not a .csv. Export your expenses as CSV and try again.");
      return;
    }
    setFieldError(null);
    setFile(candidate);
  };

  const isBusy = upload.isPending;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="mono-label">Analyze your own expense data</h3>
        {currentRows === undefined ? null : (
          <span className="font-mono text-micro uppercase text-muted">
            Session holds {formatInteger(currentRows)} rows
          </span>
        )}
      </div>

      <div className="mt-3 grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div>
          <p className="max-w-measure font-serif text-body leading-relaxed text-ink-soft">
            Upload a CSV export from your expense or card platform. Required columns are{" "}
            <code className="font-mono text-mono text-ink">date</code>,{" "}
            <code className="font-mono text-mono text-ink">merchant</code>,{" "}
            <code className="font-mono text-mono text-ink">category</code> and{" "}
            <code className="font-mono text-mono text-ink">amount</code>; common alternatives such as{" "}
            <code className="font-mono text-mono text-ink">vendor</code> and{" "}
            <code className="font-mono text-mono text-ink">transaction_amount</code> are recognised.
            At least ten valid rows are required.
          </p>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              acceptFile(event.dataTransfer.files.item(0));
            }}
            className={joinClassNames(
              "mt-5 border border-dashed px-5 py-6 transition-colors duration-quick",
              isDragging ? "border-crimson bg-crimson-wash" : "border-line-strong bg-paper-white",
            )}
          >
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                disabled={isBusy}
                onChange={(event) => acceptFile(event.target.files?.item(0))}
                className="sr-only"
              />
              <label
                htmlFor="csv-file"
                className={joinClassNames(
                  "inline-flex cursor-pointer items-center gap-2.5 border px-4 py-2.5 font-mono text-label uppercase tracking-[0.14em] transition-colors duration-quick",
                  isBusy
                    ? "border-line text-muted"
                    : "border-navy bg-navy text-paper-white hover:bg-navy-deep",
                )}
              >
                <UploadIcon />
                Choose CSV file
              </label>

              <span className="min-w-0 font-mono text-mono text-ink-soft">
                {file === null ? "No file selected" : file.name}
              </span>
            </div>

            <p className="mt-3 font-serif text-caption italic leading-relaxed text-muted">
              Or drop a .csv onto this panel. The file is parsed and scored on this machine; it is
              never sent to an external service.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => {
                  void upload.run();
                }}
                disabled={file === null || isBusy}
                className={joinClassNames(
                  "inline-flex items-center gap-2.5 border px-4 py-2.5 font-mono text-label uppercase tracking-[0.14em] transition-colors duration-quick",
                  file === null || isBusy
                    ? "border-line bg-paper-deep text-muted"
                    : "border-crimson bg-crimson text-paper-white hover:bg-crimson-deep",
                )}
              >
                {isBusy ? "Analyzing…" : "Analyze upload"}
              </button>

              {file !== null && !isBusy ? (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFieldError(null);
                  }}
                  className="editorial-link text-muted"
                >
                  Clear selection
                </button>
              ) : null}
            </div>
          </div>

          {fieldError ? (
            <p className="mt-3 border-l-2 border-l-crimson bg-crimson-wash px-3 py-2 font-mono text-mono text-ink">
              {fieldError}
            </p>
          ) : null}

          {upload.error ? (
            <div className="mt-4">
              <ErrorPanel
                title="The upload was rejected"
                message={upload.error}
                hint="The service reports why the file could not be used. Fix the CSV and submit it again — the current session data is untouched."
              />
            </div>
          ) : null}

          {lastUpload ? (
            <div
              className="mt-4 border border-line border-l-2 border-l-navy bg-paper-white px-4 py-3"
              role="status"
            >
              <p className="mono-label">Upload accepted</p>
              <p className="mt-2 font-mono text-mono leading-relaxed text-ink">
                {lastUpload.message} · {formatInteger(lastUpload.rows)} rows ·{" "}
                {formatInteger(lastUpload.flagged_transactions)} flagged
              </p>
              <p className="mt-1 font-mono text-micro uppercase text-muted">
                Session source is now {lastUpload.source}
              </p>
            </div>
          ) : null}
        </div>

        <aside className="border-t border-line pt-4 lg:border-t-0 lg:border-l lg:border-l-line lg:pl-6">
          <h4 className="mono-label">Before you replace the data</h4>
          <ul className="mt-3 list-none space-y-3 p-0">
            <li className="font-serif text-caption leading-relaxed text-ink-soft">
              The session currently holds{" "}
              <strong className="font-semibold text-ink">{currentSource ?? "no dataset"}</strong>
              {currentRows === undefined ? "" : ` (${formatInteger(currentRows)} rows)`}.
            </li>
            <li className="font-serif text-caption leading-relaxed text-ink-soft">
              Uploading replaces it in memory. The analysis service exposes no reset endpoint, so the
              previous dataset cannot be restored from the interface — only by restarting the
              backend.
            </li>
            <li className="font-serif text-caption leading-relaxed text-ink-soft">
              Every figure elsewhere in this report is recalculated from the new file as soon as the
              upload is accepted.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
