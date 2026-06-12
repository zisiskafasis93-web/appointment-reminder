"use client";

import { useState } from "react";

type ExportFormat = "backup-json" | "clients-csv" | "appointments-csv";

const exportOptions: {
  format: ExportFormat;
  label: string;
}[] = [
  {
    format: "backup-json",
    label: "Backup JSON",
  },
  {
    format: "clients-csv",
    label: "Πελάτες CSV",
  },
  {
    format: "appointments-csv",
    label: "Ραντεβού CSV",
  },
];

function getFallbackFilename(format: ExportFormat) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  if (format === "clients-csv") {
    return `remindmeup-clients-${timestamp}.csv`;
  }

  if (format === "appointments-csv") {
    return `remindmeup-appointments-${timestamp}.csv`;
  }

  return `remindmeup-backup-${timestamp}.json`;
}

export function BackupDownloadButtons() {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(
    null
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        {exportOptions.map((option) => {
          const isSelected = selectedFormat === option.format;

          return (
            <a
              key={option.format}
              href={`/api/export?format=${option.format}`}
              target="_blank"
              rel="noopener noreferrer"
              download={getFallbackFilename(option.format)}
              onClick={() => setSelectedFormat(option.format)}
              className={`inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium transition focus:border-emerald-500 focus:bg-emerald-600 focus:text-white focus:outline-none ${
                isSelected
                  ? "border border-emerald-500 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                  : option.format === "backup-json"
                    ? "primary-action"
                    : "secondary-action"
              }`}
            >
              {option.label}
            </a>
          );
        })}
      </div>

      {selectedFormat ? (
        <p className="text-sm text-emerald-700">
          Άνοιξε η λήψη. Αν ο browser ζητήσει επιβεβαίωση, επίλεξε αποθήκευση.
        </p>
      ) : null}
    </div>
  );
}
