import { useState } from "react";

const T = {
  bg: '#f0f2f8',
  surface: '#ffffff',
  surface2: '#f5f7ff',
  border: 'rgba(79,107,240,0.12)',
  borderHover: 'rgba(79,107,240,0.25)',
  text: '#0d0f1a',
  muted: '#6b7280',
  accent: '#4F6BF0',
  accentDark: '#1e2a6e',
  accentSoft: 'rgba(79,107,240,0.08)',
  danger: '#ef4444',
  success: '#22c55e',
  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
  shadow: '0 2px 12px rgba(79,107,240,0.10)',
  shadowHover: '0 6px 24px rgba(79,107,240,0.18)',
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: ${T.bg};
    color: ${T.text};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .fadeUp { animation: fadeUp 0.7s cubic-bezier(0.4,0,0.2,1) both; }
  .fadeUp-d1 { animation-delay: 0.1s; }
  .fadeUp-d2 { animation-delay: 0.2s; }
  .fadeUp-d3 { animation-delay: 0.3s; }
  .fadeUp-d4 { animation-delay: 0.4s; }
  .fadeUp-d5 { animation-delay: 0.5s; }

  .nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(240,242,248,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid ${T.border};
    padding: 0 2rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${T.accentDark};
    letter-spacing: -0.02em;
    text-decoration: none;
  }

  .nav-logo span {
    color: ${T.accent};
  }

  .nav-cta {
    background: ${T.accent};
    color: white;
    border: none;
    padding: 0.5rem 1.25rem;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: ${T.transition};
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .nav-cta:hover {
    background: ${T.accentDark};
    transform: translateY(-1px);
    box-shadow: ${T.shadow};
  }

  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 7rem 2rem 5rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: -120px; left: 50%;
    transform: translateX(-50%);
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(79,107,240,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: ${T.accentSoft};
    border: 1px solid ${T.border};
    color: ${T.accent};
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.35rem 0.9rem;
    border-radius: 100px;
    margin-bottom: 1.75rem;
    letter-spacing: 0.02em;
  }

  .hero-badge-dot {
    width: 6px; height: 6px;
    background: ${T.accent};
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  .hero h1 {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.15;
    color: ${T.accentDark};
    max-width: 720px;
    margin-bottom: 1.25rem;
  }

  .hero h1 em {
    font-style: normal;
    color: ${T.accent};
  }

  .hero-sub {
    font-size: 1.1rem;
    color: ${T.muted};
    max-width: 520px;
    margin-bottom: 2.5rem;
    font-weight: 400;
    line-height: 1.7;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-primary {
    background: ${T.accent};
    color: white;
    border: none;
    padding: 0.85rem 2rem;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: ${T.transition};
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 16px rgba(79,107,240,0.25);
  }

  .btn-primary:hover {
    background: ${T.accentDark};
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(79,107,240,0.32);
  }

  .btn-secondary {
    background: transparent;
    color: ${T.muted};
    border: 1px solid ${T.border};
    padding: 0.85rem 2rem;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    cursor: pointer;
    transition: ${T.transition};
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-secondary:hover {
    border-color: ${T.borderHover};
    color: ${T.accent};
    background: ${T.accentSoft};
  }

  .hero-preview {
    margin-top: 4rem;
    width: 100%;
    max-width: 760px;
    background: ${T.surface};
    border-radius: 20px;
    border: 1px solid ${T.border};
    box-shadow: 0 20px 60px rgba(79,107,240,0.10);
    overflow: hidden;
    animation: float 6s ease-in-out infinite;
  }

  .preview-bar {
    background: ${T.surface2};
    border-bottom: 1px solid ${T.border};
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .preview-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
  }

  .preview-content {
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .preview-card {
    background: ${T.surface2};
    border: 1px solid ${T.border};
    border-radius: 12px;
    padding: 1rem;
  }

  .preview-card-label {
    font-size: 0.7rem;
    color: ${T.muted};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.5rem;
  }

  .preview-card-value {
    font-size: 1.4rem;
    font-weight: 600;
    color: ${T.accentDark};
  }

  .preview-slots {
    grid-column: span 2;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .preview-slot {
    background: ${T.accentSoft};
    border: 1px solid ${T.border};
    color: ${T.accent};
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
  }

  .preview-slot.selected {
    background: ${T.accent};
    color: white;
    border-color: ${T.accent};
  }

  .section {
    padding: 6rem 2rem;
    max-width: 1100px;
    margin: 0 auto;
  }

  .section-label {
    font-size: 0.78rem;
    font-weight: 500;
    color: ${T.accent};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }

  .section-title {
    font-size: clamp(1.8rem, 3.5vw, 2.5rem);
    font-weight: 600;
    letter-spacing: -0.025em;
    color: ${T.accentDark};
    line-height: 1.2;
    max-width: 560px;
    margin-bottom: 1rem;
  }

  .section-sub {
    font-size: 1rem;
    color: ${T.muted};
    max-width: 480px;
    line-height: 1.7;
    margin-bottom: 3.5rem;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  .step-card {
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: 16px;
    padding: 1.75rem;
    transition: ${T.transition};
    position: relative;
    overflow: hidden;
  }

  .step-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: ${T.accent};
    opacity: 0;
    transition: ${T.transition};
  }

  .step-card:hover {
    border-color: ${T.borderHover};
    box-shadow: ${T.shadowHover};
    transform: translateY(-3px);
  }

  .step-card:hover::before {
    opacity: 1;
  }

  .step-number {
    width: 36px; height: 36px;
    background: ${T.accentSoft};
    border: 1px solid ${T.border};
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: ${T.accent};
    margin-bottom: 1.25rem;
  }

  .step-title {
    font-size: 1rem;
    font-weight: 600;
    color: ${T.text};
    margin-bottom: 0.5rem;
    letter-spacing: -0.01em;
  }

  .step-desc {
    font-size: 0.9rem;
    color: ${T.muted};
    line-height: 1.65;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  .feature-card {
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: 16px;
    padding: 1.75rem;
    transition: ${T.transition};
  }

  .feature-card:hover {
    border-color: ${T.borderHover};
    box-shadow: ${T.shadow};
  }

  .feature-icon {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .feature-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: ${T.text};
    margin-bottom: 0.4rem;
  }

  .feature-desc {
    font-size: 0.875rem;
    color: ${T.muted};
    line-height: 1.65;
  }

  .divider {
    border: none;
    border-top: 1px solid ${T.border};
    margin: 0;
  }

  .apply-section {
    background: ${T.surface};
    border-top: 1px solid ${T.border};
    border-bottom: 1px solid ${T.border};
    padding: 6rem 2rem;
  }

  .apply-inner {
    max-width: 560px;
    margin: 0 auto;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    color: ${T.text};
    margin-bottom: 0.4rem;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid ${T.border};
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    color: ${T.text};
    background: ${T.surface2};
    transition: ${T.transition};
    outline: none;
  }

  .form-input:focus {
    border-color: ${T.accent};
    background: white;
    box-shadow: 0 0 0 3px rgba(79,107,240,0.08);
  }

  .form-input::placeholder {
    color: #b0b7c3;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-success {
    text-align: center;
    padding: 2rem;
    animation: fadeUp 0.5s ease both;
  }

  .form-success-icon {
    width: 56px; height: 56px;
    background: rgba(34,197,94,0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    font-size: 1.5rem;
  }

  .contact-section {
    padding: 6rem 2rem;
    max-width: 1100px;
    margin: 0 auto;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: start;
  }

  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    margin-bottom: 1.5rem;
  }

  .contact-icon {
    width: 36px; height: 36px;
    background: ${T.accentSoft};
    border: 1px solid ${T.border};
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .contact-label {
    font-size: 0.8rem;
    color: ${T.muted};
    margin-bottom: 0.15rem;
  }

  .contact-value {
    font-size: 0.95rem;
    color: ${T.text};
    font-weight: 500;
  }

  .map-placeholder {
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: 16px;
    height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: ${T.muted};
    font-size: 0.875rem;
  }

  .footer {
    background: ${T.accentDark};
    color: rgba(255,255,255,0.6);
    padding: 2.5rem 2rem;
    text-align: center;
    font-size: 0.85rem;
  }

  .footer-logo {
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .footer-logo span {
    color: rgba(79,107,240,0.8);
  }

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

const STEPS = [
  {
    n: "01",
    title: "Te înregistrezi gratuit",
    desc: "Completezi un formular simplu cu datele salonului tău. Îți configurăm contul în mai puțin de 24 de ore.",
  },
  {
    n: "02",
    title: "Configurezi serviciile",
    desc: "Adaugi frizerii, serviciile oferite, programul de lucru și zilele libere — totul din dashboard.",
  },
  {
    n: "03",
    title: "Clienții rezervă online",
    desc: "Primești un link personalizat pe care îl pui în bio, pe Instagram sau pe Google. Clienții rezervă în 60 de secunde.",
  },
  {
    n: "04",
    title: "Gestionezi totul dintr-un loc",
    desc: "Vezi toate programările, anulările și istoricul direct din panoul de administrare, în timp real.",
  },
];

const FEATURES = [
  { icon: "📅", title: "Calendar inteligent", desc: "Sloturi disponibile calculate automat în funcție de program, durata serviciilor și programările existente." },
  { icon: "✉️", title: "Emailuri automate", desc: "Clientul primește confirmare automată cu link de anulare și eveniment Google Calendar." },
  { icon: "🔒", title: "Anulare securizată", desc: "Fiecare programare are un token unic. Anularea e posibilă cu cel puțin 2 ore înainte." },
  { icon: "👥", title: "Mai mulți frizeri", desc: "Gestionezi toată echipa dintr-un singur cont master, cu acces individual per frizer." },
  { icon: "📵", title: "Fără cont pentru client", desc: "Clienții rezervă fără cont, fără aplicație, fără bătăi de cap." },
  { icon: "📊", title: "Dashboard complet", desc: "Programări active, istoric, filtre per frizer — totul la un click distanță." },
];

export default function Landing() {
  const [form, setForm] = useState({ salon: "", nume: "", email: "", telefon: "", mesaj: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.salon || !form.email) {
      setError("Te rugăm să completezi numele salonului și emailul.");
      return;
    }
    setError("");
    setLoading(true);
    // Simulăm trimitere (înlocuiește cu EmailJS sau Supabase insert)
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo">time<span>via</span></a>
        <a href="/demo" className="nav-cta">
          Vezi demo →
        </a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge fadeUp">
          <span className="hero-badge-dot" />
          Platformă de programări pentru saloane
        </div>
        <h1 className="fadeUp fadeUp-d1">
          Programări online pentru<br /><em>salonul tău</em>, fără bătăi de cap
        </h1>
        <p className="hero-sub fadeUp fadeUp-d2">
          Timevia este platforma simplă prin care clienții îți rezervă online, iar tu gestionezi totul dintr-un singur loc.
        </p>
        <div className="hero-actions fadeUp fadeUp-d3">
          <a href="#aplica" className="btn-primary">Aplică gratuit</a>
          <a href="/demo" className="btn-secondary">Încearcă demo-ul →</a>
        </div>

        {/* Preview mock */}
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
              <div className="preview-card-label">Frizer activ</div>
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

      {/* CUM FUNCTIONEAZA */}
      <section className="section" id="cum-functioneaza">
        <div className="section-label fadeUp">Cum funcționează</div>
        <h2 className="section-title fadeUp fadeUp-d1">De la zero la programări online în 4 pași</h2>
        <p className="section-sub fadeUp fadeUp-d2">
          Nu ai nevoie de cunoștințe tehnice. Noi ne ocupăm de configurare, tu te ocupi de clienți.
        </p>
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

      {/* SERVICII / FEATURES */}
      <section className="section" id="servicii">
        <div className="section-label fadeUp">Ce primești</div>
        <h2 className="section-title fadeUp fadeUp-d1">Tot ce are nevoie un salon modern</h2>
        <p className="section-sub fadeUp fadeUp-d2">
          Fără abonamente complicate. Fără funcții inutile. Exact ce trebuie ca programările să funcționeze perfect.
        </p>
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

      {/* APLICA */}
      <section className="apply-section" id="aplica">
        <div className="apply-inner">
          <div className="section-label fadeUp" style={{ textAlign: 'center' }}>Aplică</div>
          <h2 className="section-title fadeUp fadeUp-d1" style={{ textAlign: 'center', maxWidth: '100%' }}>
            Vrei Timevia pentru salonul tău?
          </h2>
          <p className="section-sub fadeUp fadeUp-d2" style={{ textAlign: 'center', maxWidth: '100%', marginBottom: '2.5rem' }}>
            Completează formularul și te contactăm în maxim 24 de ore pentru a configura totul împreună.
          </p>

          {submitted ? (
            <div className="form-success">
              <div className="form-success-icon">✓</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: T.text, marginBottom: '0.5rem' }}>
                Cerere trimisă cu succes!
              </h3>
              <p style={{ fontSize: '0.9rem', color: T.muted }}>
                Te contactăm în maxim 24 de ore la adresa <strong>{form.email}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="fadeUp fadeUp-d3">
              <div className="form-group">
                <label className="form-label">Numele salonului *</label>
                <input
                  className="form-input"
                  name="salon"
                  value={form.salon}
                  onChange={handleChange}
                  placeholder="ex. Barber Shop Andrei"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Numele tău</label>
                  <input
                    className="form-input"
                    name="nume"
                    value={form.nume}
                    onChange={handleChange}
                    placeholder="Prenume Nume"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input
                    className="form-input"
                    name="telefon"
                    value={form.telefon}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  className="form-input"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="salon@email.ro"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Câți frizeri aveți în salon?</label>
                <input
                  className="form-input"
                  name="mesaj"
                  value={form.mesaj}
                  onChange={handleChange}
                  placeholder="ex. 3"
                />
              </div>
              {error && (
                <p style={{ color: T.danger, fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>
              )}
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'Se trimite...' : 'Trimite cererea →'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section" id="contact">
        <div className="contact-grid">
          <div>
            <div className="section-label fadeUp">Contact</div>
            <h2 className="section-title fadeUp fadeUp-d1">Ai întrebări?</h2>
            <p className="section-sub fadeUp fadeUp-d2">
              Suntem disponibili să răspundem oricând. Nu ezita să ne contactezi.
            </p>

            <div className="contact-item fadeUp fadeUp-d3">
              <div className="contact-icon">📧</div>
              <div>
                <div className="contact-label">Email</div>
                <div className="contact-value">contact@timevia.ro</div>
              </div>
            </div>
            <div className="contact-item fadeUp fadeUp-d3">
              <div className="contact-icon">📱</div>
              <div>
                <div className="contact-label">Telefon / WhatsApp</div>
                <div className="contact-value">+40 7XX XXX XXX</div>
              </div>
            </div>
            <div className="contact-item fadeUp fadeUp-d4">
              <div className="contact-icon">📍</div>
              <div>
                <div className="contact-label">Locație</div>
                <div className="contact-value">România</div>
              </div>
            </div>
          </div>

          <div className="map-placeholder fadeUp fadeUp-d3">
            <span style={{ fontSize: '2rem' }}>🗺️</span>
            <span>Hartă — adaugă locația salonului</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">time<span>via</span></div>
        <div style={{ marginTop: '0.25rem' }}>
          © {new Date().getFullYear()} Timevia. Toate drepturile rezervate.
        </div>
      </footer>
    </>
  );
}