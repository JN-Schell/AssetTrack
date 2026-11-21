import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, Upload, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface CsvImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; imported_count: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Please select a valid .csv file');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.importCsv(file);
      setResult(res);
      if (res.imported_count > 0) {
        setTimeout(() => {
          onSuccess();
        }, 1800);
      }
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bulk CSV Asset Import</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload hardware inventory records in standard CSV format
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Successfully imported <strong>{result.imported_count}</strong> assets!</span>
            </div>
            {result.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-xl bg-amber-50 p-2.5 text-[11px] text-amber-800 dark:bg-amber-950/50 dark:text-amber-200 border border-amber-200">
                <div className="font-semibold mb-1">Warnings / Skipped Rows:</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {result.errors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Upload dropzone */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-700 hover:border-blue-500 transition-colors">
          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {file ? file.name : 'Select or drag CSV file here'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Expected headers: Asset Tag, Name, Manufacturer, Model, Serial Number, Category, Purchase Cost, Purchase Date
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-300"
          />
        </div>

        {/* Modal actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Close
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Validating & Importing...' : 'Execute Import'}
          </button>
        </div>
      </div>
    </div>
  );
};
