import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { X, Download, Printer, Copy, Check } from 'lucide-react';

interface AssetQrModalProps {
  assetId: string;
  onClose: () => void;
}

export const AssetQrModal: React.FC<AssetQrModalProps> = ({ assetId, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [assetTag, setAssetTag] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQr();
  }, [assetId]);

  const loadQr = async () => {
    setLoading(true);
    try {
      const res = await api.getAssetQrCode(assetId);
      setQrDataUrl(res.qr_data_url);
      setAssetTag(res.asset_tag);
    } catch (err) {
      console.error('Failed to load QR code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/assets/${assetId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=400,height=400');
    if (printWindow && qrDataUrl) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Asset Tag - ${assetTag}</title>
            <style>
              body { font-family: monospace; text-align: center; padding: 20px; }
              img { width: 220px; height: 220px; }
              h2 { margin: 8px 0 4px 0; font-size: 18px; }
              p { margin: 0; color: #555; font-size: 12px; }
            </style>
          </head>
          <body>
            <h2>${assetTag}</h2>
            <img src="${qrDataUrl}" />
            <p>AssetTrack Inventory System</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Physical Asset Tag
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Scan to retrieve instant equipment metadata & warranty state
        </p>

        <div className="my-6 flex justify-center">
          {loading || !qrDataUrl ? (
            <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-inner dark:border-slate-700 dark:bg-white">
              <img src={qrDataUrl} alt={`QR Code for ${assetTag}`} className="h-48 w-48 mx-auto" />
              <div className="mt-2 text-center font-mono text-xs font-bold text-slate-900">
                {assetTag}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`${assetTag}-qr.png`}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PNG</span>
            </a>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Label</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 shadow-sm"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
