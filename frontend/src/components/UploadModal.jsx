import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadFile, onUploadText, isUploading }) {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'text'
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [contractTitle, setContractTitle] = useState('');
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!contractTitle) {
        setContractTitle(e.target.files[0].name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      if (!contractTitle) {
        setContractTitle(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'file' && selectedFile) {
      onUploadFile(selectedFile, contractTitle);
    } else if (activeTab === 'text' && rawText.trim()) {
      onUploadText(rawText, contractTitle || 'Custom Agreement');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-100">Upload Legal Contract</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('file')}
            className={`py-2.5 text-center transition-colors ${
              activeTab === 'file'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            PDF / DOCX File
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`py-2.5 text-center transition-colors ${
              activeTab === 'text'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Paste Raw Text
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Document Title */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Agreement Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Commercial Office Lease or SaaS Vendor MSA"
              value={contractTitle}
              onChange={(e) => setContractTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {activeTab === 'file' ? (
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Select Contract File (.pdf, .docx, .txt)
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  dragOver
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                }`}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2 opacity-80" />
                {selectedFile ? (
                  <div>
                    <div className="font-semibold text-slate-200">{selectedFile.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium text-slate-300">
                      Drop contract here or <span className="text-blue-400 underline">browse</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      PDF, DOCX, TXT up to 25MB
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Paste Agreement Text
              </label>
              <textarea
                rows={7}
                placeholder="Paste contract clauses, articles, or full agreement text..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-serif leading-relaxed"
              />
            </div>
          )}

          {/* Safe Harbor Notice */}
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-start gap-2 text-[11px] text-slate-400">
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>HIPAA Safe Harbor Protected:</strong> SSNs, names, phone numbers, and dates are scrubbed client-side and in-memory prior to vector indexing.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || (activeTab === 'file' ? !selectedFile : !rawText.trim())}
              className="px-4 py-1.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-md transition-all"
            >
              {isUploading ? 'Processing SAC Chunks...' : 'Process Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
