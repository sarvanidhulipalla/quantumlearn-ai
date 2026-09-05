import React, { useState } from 'react';
import { Copy, Check, Download, X, Terminal, Code2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';

export interface QiskitCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qiskitCode: string;
}

export const QiskitCodeModal: React.FC<QiskitCodeModalProps> = ({
  isOpen,
  onClose,
  qiskitCode,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(qiskitCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([qiskitCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum_circuit.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generated IBM Qiskit Python Code"
      size="lg"
    >
      <div className="space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 font-sans text-xs">
          <span>Executable script corresponding to your interactive circuit:</span>
          <Badge variant="blue" size="xs">Qiskit 1.x Compatible</Badge>
        </div>

        {/* Code View Area */}
        <div className="relative p-4 rounded-xl bg-[#090d16] border border-slate-700/80 text-slate-200 overflow-x-auto max-h-96">
          <pre className="leading-relaxed whitespace-pre font-mono text-[11px]">{qiskitCode}</pre>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 font-sans">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download .py File
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QiskitCodeModal;
