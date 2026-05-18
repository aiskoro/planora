import { useTheme } from '../context/ThemeContext'

export default function PoliticaConfidentialitate() {
  const { T } = useTheme()

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: ${T.bg}; color: ${T.text}; }
    .legal-nav { position: sticky; top: 0; background: ${T.surface}; border-bottom: 1px solid ${T.border}; padding: 0 2rem; height: 56px; display: flex; align-items: center; justify-content: space-between; z-index: 10; }
    .legal-nav a { text-decoration: none; font-size: 0.9rem; color: ${T.muted}; transition: color 0.18s; }
    .legal-nav a:hover { color: ${T.accent}; }
    .legal-logo { font-size: 1.1rem; font-weight: 600; color: ${T.accent}; text-decoration: none !important; }
    .legal-wrap { max-width: 720px; margin: 0 auto; padding: 3rem 2rem 6rem; }
    .legal-badge { display: inline-block; background: ${T.accentSoft}; color: ${T.accent}; border: 1px solid ${T.border}; border-radius: 100px; font-size: 0.75rem; font-weight: 500; padding: 0.3rem 0.8rem; margin-bottom: 1.25rem; letter-spacing: 0.04em; }
    h1 { font-size: 2rem; font-weight: 600; color: ${T.text}; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
    .legal-meta { font-size: 0.875rem; color: ${T.muted}; margin-bottom: 2.5rem; }
    h2 { font-size: 1.1rem; font-weight: 600; color: ${T.text}; margin: 2rem 0 0.75rem; }
    p { font-size: 0.95rem; color: ${T.muted}; line-height: 1.75; margin-bottom: 0.75rem; }
    ul { padding-left: 1.25rem; margin-bottom: 0.75rem; }
    li { font-size: 0.95rem; color: ${T.muted}; line-height: 1.75; margin-bottom: 0.3rem; }
    a { color: ${T.accent}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    hr { border: none; border-top: 1px solid ${T.border}; margin: 2.5rem 0; }
    .footer { background: ${T.surface}; border-top: 1px solid ${T.border}; padding: 1.5rem 2rem; text-align: center; font-size: 0.8rem; color: ${T.muted}; }
  `

  return (
    <>
      <style>{styles}</style>

      <nav className="legal-nav">
        <a href="/" className="legal-logo">timevia</a>
        <a href="/">← Înapoi la site</a>
      </nav>

      <div className="legal-wrap">
        <div className="legal-badge">GDPR · Politică de Confidențialitate</div>
        <h1>Politica de Confidențialitate</h1>
        <p className="legal-meta">Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <p>Timevia SRL ("noi", "ne", "nostru") se angajează să protejeze datele personale ale utilizatorilor săi. Această politică descrie ce date colectăm, cum le folosim și ce drepturi aveți în baza Regulamentului (UE) 2016/679 (GDPR).</p>

        <hr />

        <h2>1. Cine suntem</h2>
        <p>Operator de date: <strong>Timevia SRL</strong></p>
        <p>Contact: <a href="mailto:contact@timevia.ro">contact@timevia.ro</a></p>

        <h2>2. Ce date colectăm</h2>
        <p>În funcție de acțiunile dvs. pe platformă, colectăm:</p>
        <ul>
          <li><strong>Date de identificare:</strong> nume și prenume</li>
          <li><strong>Date de contact:</strong> număr de telefon, adresă de email (opțional)</li>
          <li><strong>Date despre programare:</strong> data, ora, serviciile selectate, frizerul ales</li>
          <li><strong>Date tehnice:</strong> adresă IP (prin Cloudflare Turnstile, pentru prevenirea spam-ului)</li>
        </ul>

        <h2>3. Scopurile și temeiul legal al prelucrării</h2>
        <ul>
          <li><strong>Gestionarea programării</strong> — executarea contractului (art. 6 alin. 1 lit. b GDPR)</li>
          <li><strong>Trimiterea confirmării și linkului de anulare</strong> — executarea contractului</li>
          <li><strong>Prevenirea abuzurilor (captcha)</strong> — interes legitim (art. 6 alin. 1 lit. f GDPR)</li>
          <li><strong>Gestionarea anulărilor și auditului intern</strong> — interes legitim</li>
        </ul>

        <h2>4. Cât timp păstrăm datele</h2>
        <p>Datele aferente programărilor sunt păstrate timp de <strong>12 luni</strong> de la data programării, după care sunt șterse automat sau la cerere. Datele din jurnalele de audit sunt păstrate maximum 24 de luni.</p>

        <h2>5. Cui transmitem datele</h2>
        <p>Nu vindem și nu transmitem datele dvs. unor terți în scopuri comerciale. Datele pot fi accesate de:</p>
        <ul>
          <li><strong>Supabase Inc.</strong> — furnizor de bază de date și autentificare (SUA, clauze contractuale standard UE)</li>
          <li><strong>EmailJS</strong> — serviciu de trimitere emailuri (UE)</li>
          <li><strong>Cloudflare Inc.</strong> — protecție captcha și CDN (SUA, Privacy Shield / SCCs)</li>
        </ul>

        <h2>6. Drepturile dvs.</h2>
        <p>În baza GDPR, aveți următoarele drepturi:</p>
        <ul>
          <li><strong>Dreptul de acces</strong> — puteți solicita o copie a datelor dvs.</li>
          <li><strong>Dreptul la rectificare</strong> — puteți solicita corectarea datelor incorecte</li>
          <li><strong>Dreptul la ștergere</strong> — puteți solicita ștergerea datelor ("dreptul de a fi uitat")</li>
          <li><strong>Dreptul la restricționarea prelucrării</strong></li>
          <li><strong>Dreptul la portabilitatea datelor</strong></li>
          <li><strong>Dreptul de a vă opune prelucrării</strong> bazate pe interesul legitim</li>
        </ul>
        <p>Pentru exercitarea acestor drepturi, contactați-ne la <a href="mailto:contact@timevia.ro">contact@timevia.ro</a>. Vom răspunde în maximum 30 de zile.</p>

        <h2>7. Dreptul de a depune plângere</h2>
        <p>Dacă considerați că datele dvs. sunt prelucrate ilegal, puteți depune o plângere la <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong> — <a href="https://www.dataprotection.ro" target="_blank" rel="noreferrer">www.dataprotection.ro</a>.</p>

        <h2>8. Cookie-uri</h2>
        <p>Platforma Timevia nu folosește cookie-uri de tracking sau publicitate. Folosim exclusiv date stocate local (localStorage) pentru preferințele de interfață (ex. tema vizuală).</p>

        <h2>9. Securitate</h2>
        <p>Datele sunt stocate criptat, accesul este restricționat prin autentificare și toate comunicațiile se realizează prin conexiuni HTTPS securizate.</p>

        <h2>10. Modificări ale politicii</h2>
        <p>Ne rezervăm dreptul de a actualiza această politică. Orice modificare semnificativă va fi comunicată prin email sau prin afișare prominentă pe platformă.</p>
      </div>

      <div className="footer">
        © {new Date().getFullYear()} Timevia SRL · <a href="/termeni-conditii">Termeni și Condiții</a> · <a href="/politica-confidentialitate">Politică de Confidențialitate</a>
      </div>
    </>
  )
}