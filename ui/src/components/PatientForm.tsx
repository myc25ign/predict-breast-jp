import type { ReactNode } from 'react';
import type { FormState } from '../lib/predict';

interface Props {
  form: FormState;
  onChange: (form: FormState) => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  );
}

export function PatientForm({ form, onChange }: Props) {
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    onChange({ ...form, [key]: value });

  return (
    <section className="card patient-form">
      <h2 className="card__title">患者・腫瘍情報</h2>

      <div className="form-grid">
        <Field label="年齢（歳）">
          <input
            type="number"
            min={25}
            max={120}
            value={form.age}
            onChange={(e) => set('age', Number(e.target.value))}
          />
        </Field>

        <Field label="腫瘍サイズ（mm）">
          <input
            type="number"
            min={1}
            max={200}
            value={form.size}
            onChange={(e) => set('size', Number(e.target.value))}
          />
        </Field>

        <Field label="リンパ節転移数">
          <input
            type="number"
            min={0}
            max={99}
            value={form.nodes}
            onChange={(e) => set('nodes', Number(e.target.value))}
          />
        </Field>

        <Field label="グレード">
          <select
            value={form.grade}
            onChange={(e) => set('grade', e.target.value as FormState['grade'])}
          >
            <option value="grade1">Grade 1</option>
            <option value="grade2">Grade 2</option>
            <option value="grade3">Grade 3</option>
            <option value="unknown">不明</option>
          </select>
        </Field>

        <Field label="ER状態">
          <select
            value={form.erStatus}
            onChange={(e) => set('erStatus', e.target.value as FormState['erStatus'])}
          >
            <option value="yes">陽性</option>
            <option value="no">陰性</option>
          </select>
        </Field>

        <Field label="HER2">
          <select
            value={form.her2Status}
            onChange={(e) => set('her2Status', e.target.value as FormState['her2Status'])}
          >
            <option value="yes">陽性</option>
            <option value="no">陰性</option>
            <option value="unknown">不明</option>
          </select>
        </Field>

        <Field label="Ki-67">
          <select
            value={form.ki67Status}
            onChange={(e) => set('ki67Status', e.target.value as FormState['ki67Status'])}
          >
            <option value="yes">高発現</option>
            <option value="no">低発現</option>
            <option value="unknown">不明</option>
          </select>
        </Field>

        <Field label="検出方法">
          <select
            value={form.mode}
            onChange={(e) => set('mode', e.target.value as FormState['mode'])}
          >
            <option value="screen">スクリーニング</option>
            <option value="symptomatic">症状あり</option>
            <option value="unknown">不明</option>
          </select>
        </Field>
      </div>

      <h3 className="card__subtitle">治療選択</h3>
      <div className="form-grid">
        <Field label="ホルモン療法">
          <select
            value={form.horm}
            onChange={(e) => set('horm', e.target.value as FormState['horm'])}
            disabled={form.erStatus === 'no'}
          >
            <option value="none">なし</option>
            <option value="h5">5年間</option>
            <option value="h10">10年間</option>
          </select>
        </Field>

        <Field label="化学療法">
          <select
            value={form.chemo}
            onChange={(e) => set('chemo', e.target.value as FormState['chemo'])}
          >
            <option value="none">なし</option>
            <option value="2nd">第2世代</option>
            <option value="3rd">第3世代</option>
          </select>
        </Field>

        <Field label="トラスツズマブ">
          <input
            type="checkbox"
            checked={form.tra}
            onChange={(e) => set('tra', e.target.checked)}
            disabled={form.her2Status !== 'yes'}
          />
        </Field>

        <Field label="ビスホスホネート">
          <input
            type="checkbox"
            checked={form.bis}
            onChange={(e) => set('bis', e.target.checked)}
          />
        </Field>

        <Field label="放射線療法">
          <input
            type="checkbox"
            checked={form.radio}
            onChange={(e) => set('radio', e.target.checked)}
          />
        </Field>
      </div>
    </section>
  );
}
