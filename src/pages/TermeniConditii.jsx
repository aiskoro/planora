{/* GDPR checkbox */}
<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
  <input
    type="checkbox"
    id="gdpr"
    checked={gdprAcceptat}
    onChange={e => { setGdprAcceptat(e.target.checked); setEroareGenerala(null) }}
    style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: T.accent, cursor: 'pointer', flexShrink: 0 }}
  />
  <label htmlFor="gdpr" style={{ fontSize: '13px', color: T.muted, lineHeight: '1.5', cursor: 'pointer' }}>
    Am citit și sunt de acord cu{' '}
    <a href="/politica-confidentialitate" target="_blank" style={{ color: T.accent, textDecoration: 'none', fontWeight: '500' }}>
      Politica de Confidențialitate
    </a>
    . Înțeleg că datele mele vor fi folosite exclusiv pentru gestionarea programării.
  </label>
</div>