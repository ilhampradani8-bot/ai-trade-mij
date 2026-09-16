import React from 'react';
import { BrainCircuit, Cpu, ShieldCheck, Activity, BarChart2, Layers } from 'lucide-react';

export default function AiInsightsTab({ winRate }) {
  const features = [
    { name: '%-rsi-period_14', importance: 0.28, type: 'Technical Indicator' },
    { name: '%-ema_ratio-period_50', importance: 0.24, type: 'Trend Ratio' },
    { name: '%-bb_width-period_20', importance: 0.19, type: 'Volatility' },
    { name: '%-atr_ratio-period_14', importance: 0.16, type: 'Risk Volatility' },
    { name: '%-mfi-period_14', importance: 0.13, type: 'Volume Flow' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="desktop-grid">
      {/* SB3 Model Specs */}
      <div className="binance-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BrainCircuit size={18} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Stable-Baselines3 Reinforcement Learning Specs</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#12161c', borderRadius: '6px' }}>
            <span style={{ color: 'var(--binance-text-secondary)' }}>RL Algorithm</span>
            <span className="mono" style={{ fontWeight: 700, color: 'var(--binance-yellow)' }}>PPO (Proximal Policy Optimization)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#12161c', borderRadius: '6px' }}>
            <span style={{ color: 'var(--binance-text-secondary)' }}>Policy Architecture</span>
            <span className="mono" style={{ fontWeight: 600 }}>MlpPolicy [128, 128]</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#12161c', borderRadius: '6px' }}>
            <span style={{ color: 'var(--binance-text-secondary)' }}>CPU Cores Allocated</span>
            <span className="badge-binance badge-green">2 Cores Max Count</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#12161c', borderRadius: '6px' }}>
            <span style={{ color: 'var(--binance-text-secondary)' }}>Fee & Slippage Penalty</span>
            <span className="mono" style={{ color: 'var(--binance-green)' }}>Enabled (0.075% fee + 0.05% slip)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#12161c', borderRadius: '6px' }}>
            <span style={{ color: 'var(--binance-text-secondary)' }}>Training Days</span>
            <span className="mono">15 Days Historical Data</span>
          </div>
        </div>
      </div>

      {/* Feature Importance & Model Accuracy */}
      <div className="binance-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BarChart2 size={18} color="var(--binance-yellow)" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Top Feature Importance Weights</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {features.map((feat, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span className="mono" style={{ color: 'var(--binance-text)' }}>{feat.name}</span>
                <span className="mono" style={{ color: 'var(--binance-yellow)', fontWeight: 600 }}>{(feat.importance * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', background: '#12161c', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${feat.importance * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--binance-yellow), var(--binance-green))' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
