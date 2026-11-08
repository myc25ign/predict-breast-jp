import { useMemo, useState } from 'react';
import type { EngineMode } from './lib/engines';
import { DEFAULT_FORM, runPrediction, type FormState } from './lib/predict';
import { EngineToggle } from './components/EngineToggle';
import { PatientForm } from './components/PatientForm';
import { ResultsChart } from './components/ResultsChart';
import { ResultsTable } from './components/ResultsTable';
import { ComparePanel } from './components/ComparePanel';
import { LocalizationLandscape } from './components/LocalizationLandscape';
import { AgeDeltaProfile } from './components/AgeDeltaProfile';
import { UncertaintyCone } from './components/UncertaintyCone';
import { ENGINE_LABELS } from './lib/engines';
import { computeLocalizationLandscape } from './lib/localization-landscape';
import './App.css';

function App() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [engineMode, setEngineMode] = useState<EngineMode>('japan');

  const ukResult = useMemo(() => runPrediction(form, 'uk'), [form]);
  const japanResult = useMemo(() => runPrediction(form, 'japan'), [form]);
  const activeResult = engineMode === 'japan' ? japanResult : ukResult;

  const landscape = useMemo(
    () => computeLocalizationLandscape(form, { ageMin: 28, ageMax: 72, ageStep: 1 }),
    [form]
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header__inner">
          <div>
            <p className="header__badge">PREDICT Breast — 日本ローカライズ版</p>
            <h1 className="header__title">乳がん予後予測デモ</h1>
            <p className="header__sub">
              ケンブリッジ大学 PREDICT アルゴリズム + 日本生命表競合リスク
            </p>
          </div>
          <EngineToggle mode={engineMode} onChange={setEngineMode} />
        </div>
      </header>

      <main className="main">
        <div className="layout">
          <aside className="layout__side">
            <PatientForm form={form} onChange={setForm} />
          </aside>

          <div className="layout__main">
            <div className="active-engine-banner">
              表示中: <strong>{engineMode === 'japan' ? '日本版エンジン' : 'イギリス版エンジン'}</strong>
              <span className="active-engine-banner__meta">
                · 地形図スイープ {landscape.simulationCount.toLocaleString()} シミュレーション（ブラウザ内）
              </span>
            </div>
            <ResultsChart data={activeResult} />
            <ResultsTable data={activeResult} />
            <ComparePanel uk={ukResult} japan={japanResult} />
            <LocalizationLandscape landscape={landscape} patientAge={form.age} />
            <AgeDeltaProfile profiles={landscape.profiles} patientAge={form.age} />
            <UncertaintyCone
              data={activeResult}
              engineLabel={ENGINE_LABELS[engineMode]}
            />
            <UncertaintyCone
              data={engineMode === 'japan' ? ukResult : japanResult}
              engineLabel={ENGINE_LABELS[engineMode === 'japan' ? 'uk' : 'japan']}
            />
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>
          研究・プレゼンテーション用デモ。臨床判断の代替ではありません。
          コアエンジンはブラウザ内で直接実行（サーバー不要）。
        </p>
      </footer>
    </div>
  );
}

export default App;
