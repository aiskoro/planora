import { useTheme } from '../context/ThemeContext'
import { Helmet } from 'react-helmet-async'

export default function TermeniConditii() {
  
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
  <title>Termeni și Condiții — Timevia</title>
  <meta name="description" content="Termenii și condițiile de utilizare ale platformei Timevia." />
  <link rel="canonical" href="https://timevia.ro/termeni-conditii" />
</Helmet>
      <nav className="legal-nav">
        <a href="/" className="legal-logo">timevia</a>
        <a href="/">← Înapoi la site</a>
      </nav>

      <div className="legal-wrap">
        <div className="legal-badge">Termeni și Condiții</div>
        <h1>Termeni și Condiții</h1>
        <p className="legal-meta">Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <p>Prin utilizarea platformei Timevia, accesibilă la <a href="https://timevia.ro">timevia.ro</a> și <a href="https://demo.timevia.ro">demo.timevia.ro</a>, acceptați în totalitate termenii și condițiile de mai jos.</p>

        <hr />

        <h2>1. Definiții</h2>
        <ul>
          <li><strong>Platformă</strong> — serviciul online Timevia, operat de Timevia SRL</li>
          <li><strong>Afacere</strong> — entitatea (persoană fizică sau juridică) care utilizează Timevia pentru gestionarea programărilor</li>
          <li><strong>Client</strong> — persoana care efectuează o programare prin intermediul platformei</li>
          <li><strong>Programare</strong> — rezervarea unui interval orar pentru un serviciu oferit de o Afacere</li>
        </ul>

        <h2>2. Descrierea serviciului</h2>
        <p>Timevia este o platformă de programări online care permite Clienților să rezerve servicii oferite de Afaceri partenere, fără a fi necesară crearea unui cont. Platforma facilitează comunicarea între Client și Afacere, fără a fi parte în relația contractuală dintre aceștia.</p>

        <h2>3. Efectuarea unei programări</h2>
        <ul>
          <li>Clientul selectează serviciul, data și ora dorite, completează datele de contact și confirmă programarea.</li>
          <li>La confirmare, Clientul primește un email de confirmare (dacă a furnizat adresa de email) cu detaliile programării și un link de anulare.</li>
          <li>Programarea este considerată confirmată în momentul trimiterii formularului.</li>
        </ul>

        <h2>4. Anularea programării</h2>
        <ul>
          <li>Clientul poate anula o programare exclusiv prin linkul unic primit pe email.</li>
          <li>Anularea este posibilă doar cu cel puțin <strong>2 ore înainte</strong> de ora programată.</li>
          <li>Timevia nu este responsabilă pentru situațiile în care Clientul nu poate anula din cauza depășirii termenului.</li>
          <li>Afacerea își rezervă dreptul de a anula programări din motive operaționale, caz în care Clientul va fi notificat.</li>
        </ul>

        <h2>5. Responsabilitățile Clientului</h2>
        <ul>
          <li>Furnizarea de date corecte și complete la efectuarea programării</li>
          <li>Prezentarea la ora programată sau anularea în timp util</li>
          <li>Utilizarea platformei conform prezentelor termeni și în conformitate cu legea</li>
        </ul>

        <h2>6. Responsabilitățile Timevia</h2>
        <p>Timevia se obligă să:</p>
        <ul>
          <li>Mențină platforma funcțională în condiții normale de operare</li>
          <li>Protejeze datele personale conform Politicii de Confidențialitate</li>
          <li>Notifice utilizatorii cu privire la modificări importante ale serviciului</li>
        </ul>
        <p>Timevia nu garantează disponibilitatea neîntreruptă a platformei și nu răspunde pentru prejudicii cauzate de întreruperi tehnice.</p>

        <h2>7. Limitarea răspunderii</h2>
        <p>Timevia acționează exclusiv ca intermediar tehnic. Nu suntem responsabili pentru calitatea serviciilor oferite de Afacerile partenere, pentru neprezentarea Clientului sau pentru orice litigiu între Client și Afacere.</p>

        <h2>8. Proprietate intelectuală</h2>
        <p>Toate elementele platformei Timevia (design, cod, logo, texte) sunt proprietatea Timevia SRL și sunt protejate de legislația privind drepturile de autor. Este interzisă reproducerea sau utilizarea lor fără acordul scris al Timevia SRL.</p>

        <h2>9. Modificarea termenilor</h2>
        <p>Timevia SRL își rezervă dreptul de a modifica prezentele condiții în orice moment. Continuarea utilizării platformei după publicarea modificărilor constituie acceptul acestora.</p>

        <h2>10. Legea aplicabilă</h2>
        <p>Prezentele condiții sunt guvernate de legislația română. Orice litigiu va fi soluționat pe cale amiabilă sau, în caz contrar, de instanțele competente din România.</p>

        <h2>11. Contact</h2>
        <p>Pentru întrebări legate de acești termeni: <a href="mailto:contact@timevia.ro">contact@timevia.ro</a></p>
      </div>

      <div className="footer">
        © {new Date().getFullYear()} Timevia SRL · <a href="/termeni-conditii">Termeni și Condiții</a> · <a href="/politica-confidentialitate">Politică de Confidențialitate</a>
      </div>
    </>
  )
}