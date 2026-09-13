import { useTheme } from '../context/ThemeContext'
import { Helmet } from 'react-helmet-async'

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
<Helmet>
  <title>Politica de Confidențialitate — Timevia</title>
  <meta name="description" content="Politica de confidențialitate Timevia. Aflați cum colectăm și procesăm datele dumneavoastră." />
  <link rel="canonical" href="https://timevia.ro/politica-confidentialitate" />
</Helmet>
      <nav className="legal-nav">
        <a href="/" className="legal-logo">timevia</a>
        <a href="/">← Înapoi la site</a>
      </nav>

      <div className="legal-wrap">
        <div className="legal-badge">GDPR · Politică de Confidențialitate</div>
        <h1>Politica de Confidențialitate</h1>
        <p className="legal-meta">Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <p>Timevia SRL ("noi", "ne", "nostru") se angajează să protejeze datele personale ale utilizatorilor săi. Această politică descrie ce date colectăm, cum le folosim, cui le transmitem și ce drepturi aveți în baza Regulamentului (UE) 2016/679 (GDPR).</p>

        <hr />

        <h2>1. Cine suntem</h2>
        <p>Operator de date: <strong>Timevia SRL</strong></p>
        <p>Contact: <a href="mailto:contact@timevia.ro">contact@timevia.ro</a></p>

        <h2>2. Rolurile noastre: operator și persoană împuternicită</h2>
        <p>Timevia este o platformă folosită de afaceri partenere (frizerii, saloane, cabinete etc. — „Afacerea") pentru a-și gestiona programările cu proprii clienți.</p>
        <ul>
          <li>Pentru datele afacerilor partenere care folosesc platforma (conturi, angajați) și pentru datele persoanelor care aplică să devină clienți Timevia prin formularul de pe site, <strong>Timevia SRL este operator de date</strong>.</li>
          <li>Pentru datele clienților finali care fac o programare la o Afacere parteneră (nume, telefon, email, detalii programare), <strong>Afacerea parteneră este operator de date</strong>, iar Timevia SRL acționează ca <strong>persoană împuternicită de operator</strong> (procesator), prelucrând aceste date exclusiv pentru a furniza serviciul de programări către Afacere.</li>
        </ul>
        <p>Dacă sunteți clientul unei Afaceri partenere și aveți întrebări despre datele dvs., vă recomandăm să contactați direct Afacerea la care ați făcut programarea. Puteți contacta și Timevia la <a href="mailto:contact@timevia.ro">contact@timevia.ro</a> — vom transmite sau vom rezolva solicitarea, după caz, în coordonare cu Afacerea respectivă.</p>

        <h2>3. Ce date colectăm</h2>
        <p><strong>(a) Date colectate la efectuarea unei programări (client final):</strong></p>
        <ul>
          <li><strong>Date de identificare:</strong> nume și prenume</li>
          <li><strong>Date de contact:</strong> număr de telefon, adresă de email (opțional)</li>
          <li><strong>Date despre programare:</strong> data, ora, serviciile selectate, angajatul ales, eventuale comentarii adăugate voluntar de client</li>
        </ul>
        <p><strong>(b) Date ale conturilor din platformă:</strong> nume și email, pentru conturile de angajat/administrator ale Afacerilor partenere.</p>
        <p><strong>(c) Date colectate prin formularul de aplicare de pe site (persoane/afaceri interesate să devină clienți Timevia):</strong> numele afacerii, domeniul de activitate, nume, telefon, email.</p>
        <p><strong>(d) Date tehnice:</strong> adresă IP și alte date de jurnalizare (logs), colectate automat de infrastructura de găzduire și de securitate (Cloudflare, Vercel) pentru orice vizitator al site-ului, indiferent de acțiunile efectuate.</p>

        <h2>4. Scopurile și temeiul legal al prelucrării</h2>
        <ul>
          <li><strong>Gestionarea programării</strong> (date de la punctul 3a) — executarea contractului dintre client și Afacere, pentru care Timevia acționează ca persoană împuternicită (art. 6 alin. 1 lit. b GDPR)</li>
          <li><strong>Trimiterea confirmării, reminderului și linkului de anulare</strong> — executarea contractului</li>
          <li><strong>Administrarea conturilor din platformă</strong> (date de la punctul 3b) — executarea contractului dintre Timevia și Afacere</li>
          <li><strong>Răspunsul la cererile de aplicare</strong> (date de la punctul 3c) — demersuri precontractuale la cererea persoanei interesate (art. 6 alin. 1 lit. b) și interesul legitim al Timevia de a evalua și răspunde solicitării</li>
          <li><strong>Prevenirea abuzurilor și securitatea platformei</strong> (inclusiv date tehnice de la punctul 3d) — interes legitim (art. 6 alin. 1 lit. f GDPR)</li>
          <li><strong>Gestionarea anulărilor și auditului intern</strong> — interes legitim</li>
        </ul>
        <p>Bifa de pe formularul de programare confirmă faptul că ați citit și sunteți de acord cu prezenta politică — nu reprezintă temeiul legal al prelucrării, care este executarea contractului, conform celor de mai sus.</p>

        <h2>5. Cât timp păstrăm datele</h2>
        <p>Datele aferente programărilor sunt păstrate cât timp Afacerea parteneră are un cont activ pe platformă, dar nu mai mult de <strong>24 de luni</strong> de la data programării, sau până la o cerere de ștergere — oricare intervine mai întâi. Datele din jurnalele de audit (folosite pentru a reconstitui cine și când a anulat o programare) sunt păstrate maximum 24 de luni. Ștergerea sau anonimizarea se face manual, la cerere sau la încetarea contractului cu Afacerea; nu folosim în prezent un mecanism automat de ștergere periodică.</p>

        <h2>6. Cui transmitem datele</h2>
        <p>Nu vindem datele dvs. și nu le transmitem unor terți în scopuri comerciale. Datele sunt accesate, în limitele necesare furnizării serviciului, de următorii subprocesatori:</p>
        <ul>
          <li><strong>Supabase Inc.</strong> — furnizor de bază de date și autentificare (SUA — transfer în baza Clauzelor Contractuale Standard UE)</li>
          <li><strong>Vercel Inc.</strong> — găzduirea aplicației și a funcțiilor server care procesează programările (SUA — transfer în baza Clauzelor Contractuale Standard UE)</li>
          <li><strong>Brevo (Sendinblue SAS)</strong> — trimiterea emailurilor de confirmare și reminder pentru programări (UE)</li>
          <li><strong>EmailJS</strong> — trimiterea răspunsurilor la formularul de aplicare de pe site (date de la punctul 3c; nu este folosit pentru datele clienților finali ai unei Afaceri)</li>
          <li><strong>Cloudflare Inc.</strong> — protecție anti-abuz (captcha), rețea de livrare a conținutului (CDN) și DNS (SUA — transfer în baza Clauzelor Contractuale Standard UE și/sau al participării la EU-U.S. Data Privacy Framework)</li>
        </ul>

        <h2>7. Drepturile dvs.</h2>
        <p>În baza GDPR, aveți următoarele drepturi:</p>
        <ul>
          <li><strong>Dreptul de acces</strong> — puteți solicita o copie a datelor dvs.</li>
          <li><strong>Dreptul la rectificare</strong> — puteți solicita corectarea datelor incorecte</li>
          <li><strong>Dreptul la ștergere</strong> — puteți solicita ștergerea datelor ("dreptul de a fi uitat")</li>
          <li><strong>Dreptul la restricționarea prelucrării</strong></li>
          <li><strong>Dreptul la portabilitatea datelor</strong></li>
          <li><strong>Dreptul de a vă opune prelucrării</strong> bazate pe interesul legitim</li>
        </ul>
        <p>Pentru exercitarea acestor drepturi, contactați-ne la <a href="mailto:contact@timevia.ro">contact@timevia.ro</a>. Vom răspunde în maximum 30 de zile. Dacă solicitarea privește datele dvs. ca și client al unei Afaceri partenere, o vom soluționa în coordonare cu Afacerea respectivă, conform rolurilor descrise la secțiunea 2.</p>

        <h2>8. Dreptul de a depune plângere</h2>
        <p>Dacă considerați că datele dvs. sunt prelucrate ilegal, puteți depune o plângere la <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong> — <a href="https://www.dataprotection.ro" target="_blank" rel="noreferrer">www.dataprotection.ro</a>.</p>

        <h2>9. Cookie-uri</h2>
        <p>Platforma Timevia nu folosește cookie-uri de tracking sau publicitate. Folosim exclusiv date stocate local (localStorage) pentru preferințele de interfață (ex. tema vizuală).</p>

        <h2>10. Securitate</h2>
        <p>Datele sunt stocate criptat, accesul este restricționat prin autentificare și reguli stricte la nivel de bază de date, iar toate comunicațiile se realizează prin conexiuni HTTPS securizate.</p>

        <h2>11. Modificări ale politicii</h2>
        <p>Ne rezervăm dreptul de a actualiza această politică. Orice modificare semnificativă va fi comunicată prin email sau prin afișare prominentă pe platformă.</p>
      </div>

      <div className="footer">
        © {new Date().getFullYear()} Timevia SRL · <a href="/termeni-conditii">Termeni și Condiții</a> · <a href="/politica-confidentialitate">Politică de Confidențialitate</a>
      </div>
    </>
  )
}