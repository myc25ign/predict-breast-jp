import type { EngineMode } from '../lib/engines';
import { ENGINE_LABELS } from '../lib/engines';

interface Props {
  mode: EngineMode;
  onChange: (mode: EngineMode) => void;
}

export function EngineToggle({ mode, onChange }: Props) {
  return (
    <div className="engine-toggle">
      <span className="engine-toggle__label">競合リスクモデル</span>
      <div className="engine-toggle__buttons">
        {(['uk', 'japan'] as EngineMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={`engine-toggle__btn ${mode === m ? 'engine-toggle__btn--active' : ''}`}
            onClick={() => onChange(m)}
          >
            {ENGINE_LABELS[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
