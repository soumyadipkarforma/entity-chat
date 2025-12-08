import React, { useState } from "react";

interface ModelSelectorModalProps {
  isOpen: boolean;
  models: string[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onClose: () => void;
}

const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  models,
  selectedModel,
  onSelectModel,
  onClose,
}) => {
  const [selected, setSelected] = useState(selectedModel);

  const handleSelect = (model: string) => {
    setSelected(model);
  };

  const handleSave = () => {
    onSelectModel(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div className="modal-content" style={{
        background: "#fff",
        borderRadius: 8,
        padding: 24,
        minWidth: 320,
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
      }}>
        <h2>Select Model</h2>
        <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 20 }}>
          {models.map((model) => (
            <div key={model} style={{ margin: "8px 0" }}>
              <label style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name="model"
                  value={model}
                  checked={selected === model}
                  onChange={() => handleSelect(model)}
                />
                {' '} {model}
              </label>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "8px 16px" }}>Cancel</button>
          <button
            onClick={handleSave}
            style={{ padding: "8px 16px", background: "#007bff", color: "#fff", border: "none", borderRadius: 4 }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelSelectorModal;
