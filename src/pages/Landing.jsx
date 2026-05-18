import { useState, useEffect } from "react";
import emailjs from '@emailjs/browser';
import { useTheme } from '../context/ThemeContext';

const STEPS = [
  { n: "01", title: "Te înregistrezi gratuit", desc: "Completezi un formular simplu cu datele afacerii tale. Îți configurăm contul în mai puțin de 24 de ore." },
  { n: "02", title: "Configurezi serviciile", desc: "Adaugi angajații, serviciile oferite, programul de lucru și zilele libere — totul din dashboard, în câteva minute." },
  { n: "03", title: "Clienții rezervă online", desc: "Primești un link personalizat pe care îl pui pe site, în bio sau pe Google. Clienții rezervă în 60 de secunde." },
  { n: "04", title: "Gestionezi totul dintr-un loc", desc: "Vezi toate programările, anulările și istoricul direct din panoul de administrare, în timp real." },
];

const FEATURES = [
  { icon: "📅", title: "Calendar inteligent", desc: "Sloturi disponibile calculate automat în funcție de program, durata serviciilor și programările existente." },
  { icon: "✉️", title: "Emailuri automate", desc: "Clientul primește confirmare automată cu link de anulare și eveniment Google Calendar." },
  { icon: "🔒", title: "Anulare securizată", desc: "Fiecare programare are un token unic. Anularea e posibilă cu cel puțin 2 ore înainte." },
  { icon: "👥", title: "Mai mulți angajați", desc: "Gestionezi toată echipa dintr-un singur cont master, cu acces individual per angajat." },
  { icon: "📵", title: "Fără cont pentru client", desc: "Clienții rezervă fără cont, fără aplicație, fără bătăi de cap." },
  { icon: "📊", title: "Dashboard complet", desc: "Programări active, istoric, filtre per angajat — totul la un click distanță." },
];

export default function Landing() {
  const { T, isDark, toggleTheme } = useTheme();
  const [form, setForm] = useState({ afacere: "", nume: "", email: "", telefon: "", mesaj: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', T.bg);
    root.style.setProperty('--surface', T.surface);
    root.style.setProperty('--surface2', T.surface2);
    root.style.setProperty('--border', T.border);
    root.style.setProperty('--border-hover', T.borderHover);
    root.style.setProperty('--text', T.text);
    root.style.setProperty('--muted', T.muted);
    root.style.setProperty('--accent', T.accent);
    root.style.setProperty('--accent-dark', T.accentDark);
    root.style.setProperty('--accent-soft', T.accentSoft);
    root.style.setProperty('--danger', T.danger);
    root.style.setProperty('--shadow', T.shadow);
    root.style.setProperty('--shadow-hover', T.shadowHover);
  }, [T]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.afacere || !form.email) { setError("Te rugăm să completezi numele afacerii și emailul."); return; }
    setError(""); setLoading(true);
    try {
      await emailjs.send('service_cjhpwqf', 'template_lyffrha', {
        afacere: form.afacere, domeniu: form.mesaj,
        nume: form.nume, telefon: form.telefon, email: form.email,
      }, '-uTukwwl1zGidBW8S');
      setSubmitted(true);
    } catch (err) {
      setError("A apărut o eroare. Te rugăm să încerci din nou.");
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; transition: background 0.2s ease, color 0.2s ease; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    .fadeUp { animation: fadeUp 0.7s cubic-bezier(0.4,0,0.2,1) both; }
    .fadeUp-d1 { animation-delay: 0.1s; } .fadeUp-d2 { animation-delay: 0.2s; }
    .fadeUp-d3 { animation-delay: 0.3s; } .fadeUp-d4 { animation-delay: 0.4s; }
    .fadeUp-d5 { animation-delay: 0.5s; }

    .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 2rem; height: 64px; display: flex; align-items: center; justify-content: space-between; }
    .nav-logo { font-size: 1.25rem; font-weight: 600; color: var(--accent-dark); letter-spacing: -0.02em; text-decoration: none; }
    .nav-logo span { color: var(--accent); }
    .nav-right { display: flex; align-items: center; gap: 0.75rem; }
    .theme-toggle { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 6px 10px; cursor: pointer; font-size: 15px; transition: all 0.18s ease; color: var(--muted); }
    .theme-toggle:hover { border-color: var(--border-hover); }
    .nav-cta { background: var(--accent); color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.18s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; }
    .nav-cta:hover { background: var(--accent-dark); transform: translateY(-1px); box-shadow: var(--shadow); }

    .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 7rem 2rem 5rem; text-align: center; position: relative; overflow: hidden; }
    .hero::before { content: ''; position: absolute; top: -120px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; background: radial-gradient(circle, rgba(79,107,240,0.07) 0%, transparent 70%); pointer-events: none; }
    .hero-badge { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--accent-soft); border: 1px solid var(--border); color: var(--accent); font-size: 0.8rem; font-weight: 500; padding: 0.35rem 0.9rem; border-radius: 100px; margin-bottom: 1.75rem; letter-spacing: 0.02em; }
    .hero-badge-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
    .hero h1 { font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 600; letter-spacing: -0.03em; line-height: 1.15; color: var(--accent-dark); max-width: 720px; margin-bottom: 1.25rem; }
    .hero h1 em { font-style: normal; color: var(--accent); }
    .hero-sub { font-size: 1.1rem; color: var(--muted); max-width: 520px; margin-bottom: 2.5rem; font-weight: 400; line-height: 1.7; }
    .hero-actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; justify-content: center; }
    .btn-primary { background: var(--accent); color: white; border: none; padding: 0.85rem 2rem; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 500; cursor: pointer; transition: all 0.18s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 16px rgba(79,107,240,0.25); }
    .btn-primary:hover { background: var(--accent-dark); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,107,240,0.32); }
    .btn-secondary { background: transparent; color: var(--muted); border: 1px solid var(--border); padding: 0.85rem 2rem; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 400; cursor: pointer; transition: all 0.18s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-secondary:hover { border-color: var(--border-hover); color: var(--accent); background: var(--accent-soft); }

    .hero-preview { margin-top: 4rem; width: 100%; max-width: 760px; background: var(--surface); border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 20px 60px rgba(79,107,240,0.10); overflow: hidden; animation: float 6s ease-in-out infinite; }
    .preview-bar { background: var(--surface2); border-bottom: 1px solid var(--border); padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.4rem; }
    .preview-dot { width: 10px; height: 10px; border-radius: 50%; }
    .preview-content { padding: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .preview-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; }
    .preview-card-label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.5rem; }
    .preview-card-value { font-size: 1.4rem; font-weight: 600; color: var(--accent-dark); }
    .preview-slots { grid-column: span 2; display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .preview-slot { background: var(--accent-soft); border: 1px solid var(--border); color: var(--accent); font-size: 0.8rem; font-weight: 500; padding: 0.35rem 0.75rem; border-radius: 8px; }
    .preview-slot.selected { background: var(--accent); color: white; border-color: var(--accent); }

    .section { padding: 6rem 2rem; max-width: 1100px; margin: 0 auto; }
    .section-label { font-size: 0.78rem; font-weight: 500; color: var(--accent); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.75rem; }
    .section-title { font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 600; letter-spacing: -0.025em; color: var(--accent-dark); line-height: 1.2; max-width: 560px; margin-bottom: 1rem; }
    .section-sub { font-size: 1rem; color: var(--muted); max-width: 480px; line-height: 1.7; margin-bottom: 3.5rem; }

    .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
    .step-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; transition: all 0.18s ease; position: relative; overflow: hidden; }
    .step-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--accent); opacity: 0; transition: all 0.18s ease; }
    .step-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-hover); transform: translateY(-3px); }
    .step-card:hover::before { opacity: 1; }
    .step-number { width: 36px; height: 36px; background: var(--accent-soft); border: 1px solid var(--border); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 600; color: var(--accent); margin-bottom: 1.25rem; }
    .step-title { font-size: 1rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; letter-spacing: -0.01em; }
    .step-desc { font-size: 0.9rem; color: var(--muted); line-height: 1.65; }

    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
    .feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; transition: all 0.18s ease; }
    .feature-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow); }
    .feature-icon { font-size: 1.5rem; margin-bottom: 1rem; }
    .feature-title { font-size: 0.95rem; font-weight: 600; color: var(--text); margin-bottom: 0.4rem; }
    .feature-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }

    .divider { border: none; border-top: 1px solid var(--border); margin: 0; }

    .apply-section { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 6rem 2rem; }
    .apply-inner { max-width: 560px; margin: 0 auto; }
    .form-group { margin-bottom: 1rem; }
    .form-label { display: block; font-size: 0.85rem; font-weight: 500; color: var(--text); margin-bottom: 0.4rem; }
    .form-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; color: var(--text); background: var(--surface2); transition: all 0.18s ease; outline: none; }
    .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,107,240,0.08); }
    .form-input::placeholder { color: var(--muted); opacity: 0.7; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-success { text-align: center; padding: 2rem; animation: fadeUp 0.5s ease both; }
    .form-success-icon { width: 56px; height: 56px; background: rgba(34,197,94,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem; }

    .contact-section { padding: 6rem 2rem; max-width: 1100px; margin: 0 auto; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }
    .contact-item { display: flex; align-items: flex-start; gap: 0.875rem; margin-bottom: 1.5rem; }
    .contact-icon { width: 36px; height: 36px; background: var(--accent-soft); border: 1px solid var(--border); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; margin-top: 2px; }
    .contact-label { font-size: 0.8rem; color: var(--muted); margin-bottom: 0.15rem; }
    .contact-value { font-size: 0.95rem; color: var(--text); font-weight: 500; }

    .footer { background: var(--accent-dark); color: rgba(255,255,255,0.6); padding: 2.5rem 2rem; text-align: center; font-size: 0.85rem; }
    .footer-logo { font-size: 1.1rem; font-weight: 600; color: white; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
    .footer-logo span { color: rgba(79,107,240,0.8); }

    @media (max-width: 640px) {
      .contact-grid { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
      .preview-content { grid-template-columns: 1fr; }
      .preview-slots { grid-column: span 1; }
      .hero h1 { font-size: 2.2rem; }
      .nav { padding: 0 1rem; }
      .section { padding: 4rem 1.25rem; }
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">time<span>via</span></a>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Mod luminos' : 'Mod întunecat'}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <a href="/demo" className="nav-cta">Vezi demo →</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge fadeUp">
          <span className="hero-badge-dot" />
          Platformă de programări pentru orice afacere
        </div>
        <h1 className="fadeUp fadeUp-d1">
          Programări online pentru<br /><em>afacerea ta</em>, fără bătăi de cap
        </h1>
        <p className="hero-sub fadeUp fadeUp-d2">
          Timevia este platforma simplă prin care clienții îți rezervă online, indiferent de domeniu — și tu gestionezi totul dintr-un singur loc.
        </p>
        <div className="hero-actions fadeUp fadeUp-d3">
          <a href="#aplica" className="btn-primary">Aplică gratuit</a>
          <a href="/demo" className="btn-secondary">Încearcă demo-ul →</a>
        </div>
        <div className="hero-preview fadeUp fadeUp-d4">
          <div className="preview-bar">
            <div className="preview-dot" style={{ background: '#ef4444' }} />
            <div className="preview-dot" style={{ background: '#f59e0b' }} />
            <div className="preview-dot" style={{ background: '#22c55e' }} />
          </div>
          <div className="preview-content">
            <div className="preview-card">
              <div className="preview-card-label">Programări azi</div>
              <div className="preview-card-value">8</div>
            </div>
            <div className="preview-card">
              <div className="preview-card-label">Angajat activ</div>
              <div className="preview-card-value">Andrei</div>
            </div>
            <div className="preview-slots">
              {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00'].map((s, i) => (
                <div key={s} className={`preview-slot${i === 2 ? ' selected' : ''}`}>{s}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      <section className="section" id="cum-functioneaza">
        <div className="section-label fadeUp">Cum funcționează</div>
        <h2 className="section-title fadeUp fadeUp-d1">De la zero la programări online în 4 pași</h2>
        <p className="section-sub fadeUp fadeUp-d2">Nu ai nevoie de cunoștințe tehnice. Noi ne ocupăm de configurare, tu te ocupi de clienți.</p>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`step-card fadeUp fadeUp-d${i + 2}`}>
              <div className="step-number">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      <section className="section" id="servicii">
        <div className="section-label fadeUp">Ce primești</div>
        <h2 className="section-title fadeUp fadeUp-d1">Tot ce are nevoie o afacere modernă</h2>
        <p className="section-sub fadeUp fadeUp-d2">Fără abonamente complicate. Fără funcții inutile. Exact ce trebuie ca programările să funcționeze perfect.</p>
        <div className="features">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`feature-card fadeUp fadeUp-d${(i % 4) + 2}`}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      <section className="apply-section" id="aplica">
        <div className="apply-inner">
          <div className="section-label fadeUp" style={{ textAlign: 'center' }}>Aplică</div>
          <h2 className="section-title fadeUp fadeUp-d1" style={{ textAlign: 'center', maxWidth: '100%' }}>Vrei Timevia pentru afacerea ta?</h2>
          <p className="section-sub fadeUp fadeUp-d2" style={{ textAlign: 'center', maxWidth: '100%', marginBottom: '2.5rem' }}>
            Completează formularul și te contactăm în maxim 24 de ore pentru a configura totul împreună.
          </p>
          {submitted ? (
            <div className="form-success">
              <div className="form-success-icon">✓</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: T.text, marginBottom: '0.5rem' }}>Cerere trimisă cu succes!</h3>
              <p style={{ fontSize: '0.9rem', color: T.muted }}>Te contactăm în maxim 24 de ore la adresa <strong>{form.email}</strong>.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="fadeUp fadeUp-d3">
              <div className="form-group">
                <label className="form-label">Numele afacerii *</label>
                <input className="form-input" name="afacere" value={form.afacere} onChange={handleChange} placeholder="ex. Clinica Dr. Ionescu, Salon Beauty, Service Auto Rapid" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Numele tău</label>
                  <input className="form-input" name="nume" value={form.nume} onChange={handleChange} placeholder="Prenume Nume" />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input className="form-input" name="telefon" value={form.telefon} onChange={handleChange} placeholder="07XXXXXXXX" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="contact@afacerea.ro" required />
              </div>
              <div className="form-group">
                <label className="form-label">Domeniul afacerii tale</label>
                <input className="form-input" name="mesaj" value={form.mesaj} onChange={handleChange} placeholder="ex. Clinică privată, Salon, Service auto, Notariat..." />
              </div>
              {error && <p style={{ color: T.danger, fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? 'Se trimite...' : 'Trimite cererea →'}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-grid">
          <div>
            <div className="section-label fadeUp">Contact</div>
            <h2 className="section-title fadeUp fadeUp-d1">Ai întrebări?</h2>
            <p className="section-sub fadeUp fadeUp-d2">Suntem disponibili să răspundem oricând. Nu ezita să ne contactezi.</p>
            <div className="contact-item fadeUp fadeUp-d3">
              <div className="contact-icon">📧</div>
              <div><div className="contact-label">Email</div><div className="contact-value">contact@timevia.ro</div></div>
            </div>
            <div className="contact-item fadeUp fadeUp-d3">
              <div className="contact-icon">📱</div>
              <div><div className="contact-label">Telefon / WhatsApp</div><div className="contact-value">+40 721 921 530</div></div>
            </div>
            <div className="contact-item fadeUp fadeUp-d4">
              <div className="contact-icon">📍</div>
              <div><div className="contact-label">Locație</div><div className="contact-value">România</div></div>
            </div>
          </div>
        </div>
      </section>

     <footer className="footer">
  <div className="footer-logo">time<span>via</span></div>
  <div style={{ marginTop: '0.25rem' }}>
    © {new Date().getFullYear()} Timevia SRL. Toate drepturile rezervate.
  </div>
  <div style={{ marginTop: '0.5rem' }}>
    <a href="/politica-confidentialitate" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginRight: '1rem', textDecoration: 'none' }}>Politică de Confidențialitate</a>
    <a href="/termeni-conditii" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textDecoration: 'none' }}>Termeni și Condiții</a>
  </div>
</footer>
    </>
  );
}