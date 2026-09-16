import React from 'react';
import { Menu, LayoutDashboard, Layers, BrainCircuit, Search, ChevronLeft } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const pages = [
    { id: 'console', label: 'Trading Console', shortLabel: 'Chart', icon: LayoutDashboard },
    { id: 'positions', label: 'Positions & Slippage', shortLabel: 'Positions', icon: Layers },
    { id: 'scanner', label: 'Market Scanner', shortLabel: 'Scanner', icon: Search },
    { id: 'insights', label: 'AI Models', shortLabel: 'AI', icon: BrainCircuit }
  ];

  return (
    <aside className="binance-sidebar">
      {/* DESKTOP VIEW SIDEBAR CONTENT */}
      <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        <div>
          {/* Hamburger Menu Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: '2px', marginBottom: '8px' }}>
            <button 
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand Menu" : "Collapse Menu"}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--binance-yellow)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Desktop Navigation Pages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {pages.map((page) => {
              const Icon = page.icon;
              const isActive = activeTab === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => setActiveTab(page.id)}
                  title={page.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: collapsed ? 'center' : 'flex-start',
                    gap: '8px',
                    padding: '8px',
                    borderRadius: '4px',
                    border: isActive ? '1px solid rgba(240, 185, 11, 0.4)' : '1px solid transparent',
                    background: isActive ? 'var(--binance-card-hover)' : 'transparent',
                    color: isActive ? 'var(--binance-yellow)' : 'var(--binance-text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={16} color={isActive ? 'var(--binance-yellow)' : 'var(--binance-text-secondary)'} />
                  {!collapsed && <span>{page.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MOBILE (HP) STICKY BOTTOM BAR CONTENT */}
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-around', alignItems: 'center' }} className="show-on-mobile">
        {pages.map((page) => {
          const Icon = page.icon;
          const isActive = activeTab === page.id;
          return (
            <button
              key={page.id}
              onClick={() => setActiveTab(page.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justify: 'center',
                gap: '2px',
                height: '100%',
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--binance-yellow)' : 'var(--binance-text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.65rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--binance-yellow)' : 'var(--binance-text-secondary)'} />
              <span>{page.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
