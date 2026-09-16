import React from 'react';
import { Play, Pause, RefreshCw, PlusCircle, ShieldAlert } from 'lucide-react';

export default function ControlPanel({ botRunning, onToggleBot, onReloadConfig, onForceBuy }) {
  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="#00f2fe" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Bot Control Center</h3>
        </div>
        <span className="badge badge-cyan">
          Freqtrade REST Server v2026.8
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <button 
          className={`btn ${botRunning ? 'btn-danger' : 'btn-primary'}`}
          onClick={onToggleBot}
        >
          {botRunning ? (
            <>
              <Pause size={16} /> Pause FreqAI Bot
            </>
          ) : (
            <>
              <Play size={16} /> Start FreqAI Bot
            </>
          )}
        </button>

        <button className="btn" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff', border: '1px solid var(--border-color)' }} onClick={onReloadConfig}>
          <RefreshCw size={16} /> Reload Strategy / Config
        </button>

        <button className="btn" style={{ background: 'rgba(0, 230, 118, 0.15)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.3)' }} onClick={onForceBuy}>
          <PlusCircle size={16} /> Simulate Force Entry (Test Trade)
        </button>
      </div>
    </div>
  );
}
