import React, { useState, useEffect } from 'react';
import { Save, Trash2, FolderOpen, Plus, Check } from 'lucide-react';
import { CircuitGridState, SavedCircuit } from '../../types/circuit';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';

export interface SaveCircuitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCircuit: CircuitGridState;
  onLoadCircuit: (circuit: CircuitGridState) => void;
}

const STORAGE_KEY = 'quantumlearn_saved_circuits';

export const SaveCircuitModal: React.FC<SaveCircuitModalProps> = ({
  isOpen,
  onClose,
  currentCircuit,
  onLoadCircuit,
}) => {
  const [circuitName, setCircuitName] = useState('');
  const [savedCircuits, setSavedCircuits] = useState<SavedCircuit[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setSavedCircuits(JSON.parse(data));
      }
    } catch (e) {
      console.warn('Failed to parse saved circuits:', e);
    }
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!circuitName.trim()) return;

    const newCircuit: SavedCircuit = {
      id: `circuit_${Date.now()}`,
      name: circuitName.trim(),
      createdAt: new Date().toLocaleDateString(),
      circuitState: currentCircuit,
    };

    const updated = [newCircuit, ...savedCircuits];
    setSavedCircuits(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setCircuitName('');
    setSuccessMsg('Circuit saved successfully!');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleDelete = (id: string) => {
    const updated = savedCircuits.filter((c) => c.id !== id);
    setSavedCircuits(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save & Load Quantum Circuits" size="md">
      <div className="space-y-6">
        {/* Save Current Form */}
        <form onSubmit={handleSave} className="space-y-3 pb-5 border-b border-white/5">
          <Input
            label="Circuit Name"
            placeholder="e.g. 2-Qubit Bell State Prep"
            value={circuitName}
            onChange={(e) => setCircuitName(e.target.value)}
            required
          />

          <div className="flex items-center justify-between">
            {successMsg ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {successMsg}
              </span>
            ) : <div />}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Current Circuit
            </Button>
          </div>
        </form>

        {/* Saved Circuits List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Your Saved Circuits ({savedCircuits.length})
          </h4>

          {savedCircuits.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No saved circuits yet. Name and save your circuit above!
            </p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {savedCircuits.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h5 className="font-bold text-white">{item.name}</h5>
                    <p className="text-[11px] text-slate-400">
                      {item.circuitState.numQubits} Qubits • {item.circuitState.gates.length} Gates • {item.createdAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onLoadCircuit(item.circuitState);
                        onClose();
                      }}
                      leftIcon={<FolderOpen className="w-3 h-3" />}
                    >
                      Load
                    </Button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete saved circuit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SaveCircuitModal;
