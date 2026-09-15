import { useState, useEffect, useRef } from "react";
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { Helmet } from 'react-helmet-async'

/* ---------- Iconițe SVG line-art (brand book §6) ----------
   pathLength="1" normalizează lungimea traseului la 1 => putem anima
   stroke-dashoffset de la 1 la 0 fără să știm lungimea reală a fiecărui path. */
const I = {
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" pathLength="1" /><path d="M8 3v4M16 3v4M3 10h18" pathLength="1" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" pathLength="1" /><path d="m3 7 9 6 9-6" pathLength="1" /></>,
  lock: <><rect x="3" y="11" width="18" height="10" rx="2" pathLength="1" /><path d="M7 11V7a5 5 0 0 1 10 0v4" pathLength="1" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" pathLength="1" /><circle cx="9" cy="7" r="4" pathLength="1" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" pathLength="1" /></>,
  phoneOff: <><rect x="6" y="2" width="12" height="20" rx="2" pathLength="1" /><path d="M10 18h4" pathLength="1" /><path d="M3 3l18 18" pathLength="1" /></>,
  chart: <><path d="M3 3v18h18" pathLength="1" /><path d="m7 15 3.5-4 3 3L20 8" pathLength="1" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L8.1 9.7a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2z" pathLength="1" />,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0" pathLength="1" /><circle cx="12" cy="10" r="3" pathLength="1" /></>,
  check: <path d="m4 12 5 5L20 6" pathLength="1" />,
};

const Icon = ({ name, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {I[name]}
  </svg>
);

/* Titlu cu dezvăluire cuvânt cu cuvânt (kinetic typography).
   Fiecare cuvânt stă într-o mască cu overflow:hidden și urcă din ea, cu stagger.
   padding/margin pe .w compensează descenderii diacriticelor (ț, ș, ă). */
const SplitTitle = ({ text, className, style, id }) => (
  <h2 className={className} style={style} id={id} data-reveal="words">
    {text.split(' ').map((word, i) => (
      <span className="w" key={`${word}-${i}`}>
        <span className="w-in" style={{ '--i': i }}>{word}</span>
      </span>
    ))}
  </h2>
);

const STEPS = [
  { n: "01", title: "Te înregistrezi gratuit", desc: "Completezi un formular simplu cu datele afacerii tale. Îți configurăm contul în mai puțin de 24 de ore." },
  { n: "02", title: "Configurezi serviciile", desc: "Adaugi angajații, serviciile oferite, programul de lucru și zilele libere — totul din dashboard, în câteva minute." },
  { n: "03", title: "Clienții rezervă online", desc: "Primești un link personalizat pe care îl pui pe site, în bio sau pe Google. Clienții rezervă în 60 de secunde." },
  { n: "04", title: "Gestionezi totul dintr-un loc", desc: "Vezi toate programările, anulările și istoricul direct din panoul de administrare, în timp real." },
];

const FEATURES = [
  { icon: "calendar", title: "Calendar inteligent", desc: "Sloturi disponibile calculate automat în funcție de program, durata serviciilor și programările existente." },
  { icon: "mail", title: "Emailuri automate", desc: "Clientul primește confirmare automată cu link de anulare și eveniment Google Calendar." },
  { icon: "lock", title: "Anulare securizată", desc: "Fiecare programare are un token unic. Anularea e posibilă cu cel puțin 2 ore înainte." },
  { icon: "users", title: "Mai mulți angajați", desc: "Gestionezi toată echipa dintr-un singur cont master, cu acces individual per angajat." },
  { icon: "phoneOff", title: "Fără cont pentru client", desc: "Clienții rezervă fără cont, fără aplicație, fără bătăi de cap." },
  { icon: "chart", title: "Dashboard complet", desc: "Programări active, istoric, filtre per angajat — totul la un click distanță." },
];

const PRICING = [
  { title: "Abonament lunar", desc: "Un preț fix pe lună, pe care îl știi de la început. Nu se schimbă când ai o lună bună." },
  { title: "Implementare o singură dată", desc: "Îți configurăm noi contul: servicii, angajați, program de lucru și linkul tău de rezervare." },
  { title: "Zero comision", desc: "Nu luăm nimic din ce încasezi. Câte programări primești nu schimbă factura." },
];

const AFTER = [
  { when: "În aceeași zi", desc: "Îți răspundem pe email sau telefon și stabilim exact ce are nevoie afacerea ta." },
  { when: "În maxim 24 de ore", desc: "Contul tău e configurat: servicii, angajați, program de lucru, zile libere." },
  { when: "Din ziua următoare", desc: "Primești linkul de rezervare și începi să iei programări online." },
];

const FAQ = [
  { q: "Cât durează până pot lua programări?", a: "Îți configurăm contul în mai puțin de 24 de ore din momentul în care primim datele afacerii tale. Din ziua următoare poți da linkul clienților." },
  { q: "Clienții mei trebuie să își facă cont?", a: "Nu. Rezervă direct din link, în 60 de secunde. Fără cont, fără aplicație de instalat." },
  { q: "Luați comision din programări?", a: "Nu. Plătești un abonament lunar fix și o taxă de implementare, o singură dată. Atât." },
  { q: "Am nevoie de cunoștințe tehnice?", a: "Nu. Noi configurăm serviciile, angajații și programul. Tu primești linkul și dashboard-ul gata făcute." },
  { q: "Pot lucra cu mai mulți angajați?", a: "Da. Gestionezi toată echipa dintr-un singur cont master, cu acces individual per angajat." },
];

const PROMISES = [
  { title: "Fără cont pentru client", desc: "Rezervă direct din link, în 60 de secunde." },
  { title: "Fără comision", desc: "Preț fix lunar, indiferent câte programări primești." },
  { title: "Configurat în 24 de ore", desc: "Îți setăm noi contul, de la zero." },
];

export default function Landing() {
  const { T, isDark, toggleTheme } = useTheme();
  const [form, setForm] = useState({ afacere: "", nume: "", email: "", telefon: "", mesaj: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);

  const navSlotRef = useRef(null);
  const navRef = useRef(null);
  const flyRef = useRef(null);
  const spacerRef = useRef(null);
  const progressRef = useRef(null);

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

  /* ---- Un singur rAF loop: logo zburător + bara de progres + starea navbar ----
     Logo: animăm font-size (text vectorial, clar la orice mărime), NU transform: scale()
     — scale rasterizează textul o dată la mărimea de bază și apoi întinde bitmap-ul.
     transform rămâne doar pentru translație: fără blur, rulează pe GPU.
     Parallax-ul de pe cardul din hero a fost scos intenționat: mai multe mișcări
     simultane la viteze diferite obosesc și pot declanșa rău de mișcare. */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) { setReducedMotion(true); return; }

    let raf = 0;
    let metrics = null;

    const measure = () => {
      const slot = navSlotRef.current;
      const fly = flyRef.current;
      const spacer = spacerRef.current;
      if (!slot || !fly || !spacer) return;

      const r = slot.getBoundingClientRect();
      const wNav = r.width;
      const hNav = r.height;
      if (!wNav || !hNav) return;

      const fNav = parseFloat(getComputedStyle(slot).fontSize) || 20;
      const vw = window.innerWidth;
      const maxW = Math.min(vw * 0.84, 720);
      const ratio = Math.max(1.8, Math.min(maxW / wNav, 5.5));

      spacer.style.height = `${Math.round(hNav * ratio + 28)}px`;

      const sr = spacer.getBoundingClientRect();
      metrics = {
        fNav,
        fBig: fNav * ratio,
        startX: (vw - wNav * ratio) / 2,
        startY: sr.top + window.scrollY,
        endX: r.left,
        endY: r.top,
      };
    };

    const render = () => {
      raf = 0;
      const y = window.scrollY;

      const fly = flyRef.current;
      if (metrics && fly) {
        const range = Math.max(240, window.innerHeight * 0.45);
        const p = Math.min(1, Math.max(0, y / range));
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

        const f = metrics.fBig + (metrics.fNav - metrics.fBig) * e;
        const x = metrics.startX + (metrics.endX - metrics.startX) * e;
        const ty = metrics.startY + (metrics.endY - metrics.startY) * e;

        fly.style.fontSize = `${f.toFixed(2)}px`;
        fly.style.transform = `translate3d(${x.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
        fly.classList.add('is-ready');
      }

      if (navRef.current) navRef.current.classList.toggle('is-scrolled', y > 24);

      if (progressRef.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const prog = max > 0 ? Math.min(1, y / max) : 0;
        progressRef.current.style.transform = `scaleX(${prog.toFixed(4)})`;
      }
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(render); };
    const onResize = () => { measure(); render(); };

    measure();
    render();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const t = setTimeout(onResize, 350);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize).catch(() => {});

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* ---- Reveal la scroll + count-up ----
     Se animează DOAR ce dirijează atenția: antetele de secțiune, pașii,
     iconițele din grilă, cifra din preview. Corpul de text, formularul,
     FAQ-ul, datele de contact și cardul de preț rămân statice. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches || !('IntersectionObserver' in window)) return;

    const root = document.documentElement;
    root.classList.add('has-reveal');

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

    const frames = [];
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        cio.unobserve(el);
        const target = parseInt(el.dataset.count, 10);
        if (Number.isNaN(target)) return;
        const dur = 900;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * e));
          if (p < 1) frames.push(requestAnimationFrame(tick));
        };
        frames.push(requestAnimationFrame(tick));
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));

    return () => {
      io.disconnect();
      cio.disconnect();
      frames.forEach((id) => cancelAnimationFrame(id));
      root.classList.remove('has-reveal');
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.afacere || !form.email) { setError("Te rugăm să completezi numele afacerii și emailul."); return; }
    setError(""); setLoading(true);
    try {
      const { error: fnError } = await supabase.functions.invoke('send-application', {
        body: {
          afacere: form.afacere,
          domeniu: form.mesaj,
          nume: form.nume,
          telefon: form.telefon,
          email: form.email,
        },
      });
      if (fnError) throw fnError;
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

    :root {
      /* expo-out: pornire rapidă, aterizare lungă — dă senzația de „scump" */
      --e-expo: cubic-bezier(0.16, 1, 0.3, 1);
      /* back-out: depășește ținta și revine — pentru elemente care „pocnesc" */
      --e-back: cubic-bezier(0.34, 1.56, 0.64, 1);
      /* permite tranziția către height:auto la <details> (Chrome 129+) */
      interpolate-size: allow-keywords;
    }

    html { scroll-behavior: smooth; }
    /* navbar-ul fix are 64px; fără asta ancora #aplica aterizează sub el */
    section[id] { scroll-margin-top: 80px; }
    body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); font-size: 16px; line-height: 1.6; -webkit-font-smoothing: antialiased; transition: background 0.2s ease, color 0.2s ease; }

    /* ===== Intrare la încărcare (hero) — blur + urcare, nu fade plat ===== */
    @keyframes riseIn { from { opacity: 0; transform: translateY(16px); filter: blur(10px); } to { opacity: 1; transform: none; filter: blur(0); } }
    @keyframes fadeInLogo { from { opacity: 0; } to { opacity: 1; } }
    .rise { animation: riseIn 0.9s var(--e-expo) both; }
    .rise-d1 { animation-delay: 0.08s; } .rise-d2 { animation-delay: 0.16s; }
    .rise-d3 { animation-delay: 0.24s; } .rise-d4 { animation-delay: 0.34s; }

    /* ===== Reveal la scroll =====
       Starea ascunsă se aplică DOAR dacă JS a pornit observerul (html.has-reveal),
       ca fără JS pagina să rămână complet vizibilă și lizibilă. */

    /* rise — blur + urcare scurtă. Pentru eyebrow-uri și carduri. */
    [data-reveal="rise"] { transition: opacity 0.7s var(--e-expo), transform 0.7s var(--e-expo), filter 0.7s var(--e-expo); transition-delay: var(--d, 0ms); }
    .has-reveal [data-reveal="rise"] { opacity: 0; transform: translateY(12px); filter: blur(8px); }
    [data-reveal="rise"].is-in { opacity: 1; transform: none; filter: blur(0); }

    /* words — titlul se sparge în cuvinte, fiecare urcă din masca lui */
    .w { display: inline-block; overflow: hidden; vertical-align: bottom; margin-right: 0.26em; padding-bottom: 0.14em; margin-bottom: -0.14em; }
    .w-in { display: inline-block; transition: transform 0.75s var(--e-expo); transition-delay: calc(var(--d, 0ms) + var(--i) * 45ms); }
    .has-reveal [data-reveal="words"] .w-in { transform: translateY(105%); }
    [data-reveal="words"].is-in .w-in { transform: none; }

    /* line — linia se trage de la stânga la dreapta */
    [data-reveal="line"] { transform-origin: left center; transition: transform 0.7s var(--e-expo); transition-delay: var(--d, 0ms); }
    .has-reveal [data-reveal="line"] { transform: scaleX(0); }
    [data-reveal="line"].is-in { transform: none; }

    /* roll — cifra se rostogolește din mască, cu depășire */
    .roll { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: 0.1em; margin-bottom: -0.1em; }
    .roll-in { display: inline-block; transition: transform 0.8s var(--e-back); transition-delay: var(--d, 0ms); }
    .has-reveal [data-reveal="roll"] .roll-in { transform: translateY(110%); }
    [data-reveal="roll"].is-in .roll-in { transform: none; }

    /* mark — nu ascunde nimic, doar marchează intrarea (bare + iconițe desenate) */

    /* ===== Navbar ===== */
    .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid transparent; padding: 0 2rem; height: 64px; display: flex; align-items: center; justify-content: space-between; transition: border-color 0.3s ease; }
    .nav.is-scrolled { border-bottom-color: var(--border); }
    .nav-progress { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--accent); transform: scaleX(0); transform-origin: left center; will-change: transform; }
    .nav-logo { font-size: 1.25rem; font-weight: 600; color: var(--accent-dark); letter-spacing: -0.02em; text-decoration: none; line-height: 1.2; white-space: nowrap; }
    .nav-logo span { color: var(--accent); }
    .nav-right { display: flex; align-items: center; gap: 0.75rem; }
    .theme-toggle { background: transparent; border: 1px solid var(--border); border-radius: 10px; padding: 7px 11px; cursor: pointer; font-size: 15px; transition: all 0.18s ease; color: var(--muted); line-height: 1; }
    .theme-toggle:hover { border-color: var(--border-hover); background: var(--surface2); }
    /* accent-dark, nu accent: text alb de 14.4px pe #4F6BF0 dă 4.47:1 și pică AA (brand book 3.6) */
    /* Contur, nu fill: „Vezi demo" e acțiune alternativă. Un singur buton plin
       pe primul ecran, și acela e „Aplică gratuit". */
    .nav-cta { background: transparent; color: var(--accent-dark); border: 1px solid var(--border); padding: 0.5rem 1.1rem; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 0.925rem; font-weight: 500; cursor: pointer; transition: all 0.18s ease; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; }
    .nav-cta:hover { border-color: var(--accent); background: var(--surface2); }
    .nav-cta:focus-visible { outline: 2px solid var(--accent-dark); outline-offset: 2px; }

    .nav-logo-slot { opacity: 0; }
    .nav-logo-slot.is-static { opacity: 1; }

    .logo-fly { position: fixed; top: 0; left: 0; z-index: 101; pointer-events: none; opacity: 0; will-change: transform; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    .logo-fly.is-ready { animation: fadeInLogo 0.9s ease both; }

    .hero-logo-spacer { width: 100%; }
    .hero-logo-static { font-size: clamp(2.6rem, 11vw, 5rem); font-weight: 600; letter-spacing: -0.03em; line-height: 1.05; color: var(--accent-dark); margin-bottom: 1.5rem; }
    .hero-logo-static span { color: var(--accent); }

    /* ===== Hero ===== (fundal culoare plată — brand book 3.5.6) */
    .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6rem 2rem 2rem; text-align: center; position: relative; }

    /* eyebrow: 12.8px, +8%, uppercase — brand book 4.1 */
    .hero-badge { display: inline-flex; align-items: center; gap: 0.75rem; color: var(--muted); font-size: 0.8rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; line-height: 1.2; margin-bottom: 1rem; }
    .hero-badge-dot { width: 26px; height: 1px; background: var(--accent); flex-shrink: 0; }

    .hero h1 { font-size: clamp(2.25rem, 6vw, 4rem); font-weight: 600; letter-spacing: -0.03em; line-height: 1.05; color: var(--accent-dark); max-width: 780px; margin-bottom: 1rem; }
    .hero h1 em { font-style: normal; color: var(--accent); }
    .hero-sub { font-size: 1.25rem; color: var(--muted); max-width: 600px; margin-bottom: 2rem; font-weight: 400; line-height: 1.65; }
    .hero-actions { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; justify-content: center; }

    /* Primar: singurul buton plin de pe ecran. 600 e ce cere brand book 3.6
       ca albul pe #4F6BF0 să treacă AA; tot el îi dă și greutatea vizuală. */
    .btn-primary { background: var(--accent); color: white; border: none; min-height: 52px; padding: 0.9rem 2.25rem; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 1.05rem; font-weight: 600; letter-spacing: -0.01em; cursor: pointer; transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 2px 4px rgba(79,107,240,0.20), 0 8px 24px rgba(79,107,240,0.28); }
    .btn-primary:hover { background: var(--accent-dark); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(79,107,240,0.24), 0 14px 32px rgba(79,107,240,0.34); }
    .btn-primary:active { transform: scale(0.96); }
    .btn-primary:focus-visible { outline: 2px solid var(--accent-dark); outline-offset: 3px; }
    /* Secundar: aliniat ca înălțime cu primarul, dar fără fill și fără umbră.
       Diferența de greutate e ce face primarul să iasă, nu culoarea. */
    .btn-secondary { background: transparent; color: var(--accent-dark); border: 1px solid var(--border); min-height: 52px; padding: 0.9rem 1.75rem; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 500; cursor: pointer; transition: all 0.18s ease; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .btn-secondary:hover { border-color: var(--border-hover); background: var(--surface2); }
    .btn-secondary:active { transform: scale(0.96); }
    .btn-secondary:focus-visible { outline: 2px solid var(--accent-dark); outline-offset: 3px; }

    /* ===== Preview ===== */
    .hero-preview-wrap { margin-top: 3rem; width: 100%; max-width: 760px; }
    .hero-preview { width: 100%; background: var(--surface); border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 20px 60px rgba(79,107,240,0.10); overflow: hidden; }
    .preview-bar { background: var(--surface2); border-bottom: 1px solid var(--border); padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.35rem; }
    .preview-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-hover); opacity: 0.55; }
    .preview-content { padding: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .preview-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; }
    .preview-card-label { font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem; }
    .preview-card-value { font-size: 1.75rem; font-weight: 600; color: var(--accent-dark); font-variant-numeric: tabular-nums; line-height: 1.2; }
    .preview-slots { grid-column: span 2; display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .preview-slot { background: transparent; border: 1px solid var(--border); color: var(--muted); font-size: 0.9rem; font-weight: 500; padding: 0.35rem 0.85rem; border-radius: 999px; transition: all 0.25s ease; }
    /* accent-dark pentru contrast AA la text mic alb (brand book 3.6) */
    .preview-slot.selected { background: var(--accent-dark); color: white; border-color: var(--accent-dark); }

    /* ===== Secțiuni ===== */
    .section { padding: 3rem 2rem; max-width: 1100px; margin: 0 auto; }
    .section-label { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; font-weight: 500; color: var(--accent-dark); letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.2; margin-bottom: 0.75rem; }
    .section-label::before { content: ''; width: 26px; height: 1px; background: var(--accent); flex-shrink: 0; }
    .section-label.is-center { justify-content: center; }
    .section-title { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 600; letter-spacing: -0.025em; color: var(--accent-dark); line-height: 1.15; max-width: 640px; margin-bottom: 0.75rem; }
    .section-sub { font-size: 1.125rem; color: var(--muted); max-width: 580px; line-height: 1.7; margin-bottom: 1.5rem; }

    /* ===== Pași ===== */
    .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
    .step-card { position: relative; padding-top: 1rem; }
    .step-rule { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: var(--accent); }
    .step-number { font-size: 3rem; font-weight: 300; letter-spacing: -0.04em; color: var(--accent); line-height: 1; margin-bottom: 0.75rem; font-variant-numeric: tabular-nums; }
    .step-title { font-size: 1.25rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; letter-spacing: -0.015em; line-height: 1.3; }
    .step-desc { font-size: 1rem; color: var(--muted); line-height: 1.65; }

    /* ===== Features ===== */
    .features { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--border); border-left: 1px solid var(--border); }
    .feature-card { position: relative; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 1.5rem; transition: background 0.25s ease; }
    .feature-card::after { content: ''; position: absolute; left: -1px; top: -1px; width: 0; height: 2px; background: var(--accent); transition: width 0.6s var(--e-expo); transition-delay: var(--d, 0ms); }
    .feature-card.is-in::after, html:not(.has-reveal) .feature-card::after { width: calc(100% + 1px); }
    .feature-card:hover { background: var(--surface); }
    .feature-icon { color: var(--accent); margin-bottom: 0.75rem; display: flex; }
    .feature-icon svg > * { stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke-dashoffset 0.8s var(--e-expo); transition-delay: calc(var(--d, 0ms) + 180ms); }
    .has-reveal .feature-card:not(.is-in) .feature-icon svg > * { stroke-dashoffset: 1; }
    .feature-title { font-size: 1.25rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; letter-spacing: -0.015em; line-height: 1.3; }
    .feature-desc { font-size: 1rem; color: var(--muted); line-height: 1.65; }

    .divider { border: none; border-top: 1px solid var(--border); margin: 0; }

    /* ===== Preț (static — tabelele de preț nu se animează) ===== */
    .pricing-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; display: grid; grid-template-columns: repeat(3, 1fr); overflow: hidden; }
    .pricing-item { padding: 1.5rem; border-right: 1px solid var(--border); }
    .pricing-item:last-child { border-right: none; }
    .pricing-check { color: var(--accent); margin-bottom: 0.75rem; display: flex; }
    .pricing-title { font-size: 1.25rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; letter-spacing: -0.015em; }
    .pricing-desc { font-size: 1rem; color: var(--muted); line-height: 1.65; }
    .pricing-cta { display: flex; justify-content: center; margin-top: 2rem; }

    /* ===== Formular (static) ===== */
    .apply-section { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 3rem 2rem; }
    .apply-inner { max-width: 600px; margin: 0 auto; }
    .form-group { margin-bottom: 1rem; }
    .form-label { display: block; font-size: 1rem; font-weight: 500; color: var(--text); margin-bottom: 0.5rem; }
    .form-input { width: 100%; padding: 0.85rem 1rem; border: 1px solid var(--border); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 1rem; color: var(--text); background: var(--bg); transition: border-color 0.18s ease, box-shadow 0.18s ease; outline: none; }
    .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,107,240,0.12); }
    .form-input::placeholder { color: var(--muted); opacity: 0.6; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-success { text-align: center; padding: 1.5rem; animation: riseIn 0.6s var(--e-expo) both; }
    .form-success-icon { width: 56px; height: 56px; border: 1px solid rgba(34,197,94,0.35); color: #15803D; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }

    /* ===== Ce se întâmplă după ce aplici (static) ===== */
    .after-apply { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
    .after-title { font-size: 0.8rem; font-weight: 500; color: var(--accent-dark); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem; text-align: center; }
    .after-item { display: grid; grid-template-columns: 180px 1fr; gap: 1.5rem; padding: 0.75rem 0; border-top: 1px solid var(--border); align-items: baseline; }
    .after-item:first-of-type { border-top: none; }
    .after-when { font-size: 1rem; font-weight: 600; color: var(--accent); letter-spacing: -0.01em; }
    .after-desc { font-size: 1rem; color: var(--muted); line-height: 1.65; }

    /* ===== FAQ (static la scroll; se animează doar deschiderea) ===== */
    .faq-list { border-top: 1px solid var(--border); max-width: 800px; }
    .faq-item { border-bottom: 1px solid var(--border); }
    .faq-item summary { list-style: none; cursor: pointer; padding: 1rem 0; display: flex; justify-content: space-between; align-items: center; gap: 2rem; font-size: 1.15rem; font-weight: 500; color: var(--text); letter-spacing: -0.01em; transition: color 0.2s ease; }
    .faq-item summary::-webkit-details-marker { display: none; }
    .faq-item summary:hover { color: var(--accent-dark); }
    .faq-sign { position: relative; width: 16px; height: 16px; flex-shrink: 0; color: var(--accent); }
    .faq-sign::before, .faq-sign::after { content: ''; position: absolute; left: 50%; top: 50%; background: currentColor; }
    .faq-sign::before { width: 14px; height: 1.5px; transform: translate(-50%, -50%); }
    .faq-sign::after { width: 1.5px; height: 14px; transform: translate(-50%, -50%); transition: transform 0.3s var(--e-expo), opacity 0.3s ease; }
    .faq-item[open] .faq-sign::after { transform: translate(-50%, -50%) rotate(90deg); opacity: 0; }
    /* deschidere animată nativă; browserele fără suport doar sar direct la deschis */
    .faq-item::details-content { block-size: 0; overflow: hidden; transition: block-size 0.35s var(--e-expo), content-visibility 0.35s allow-discrete; }
    .faq-item[open]::details-content { block-size: auto; }
    .faq-answer { font-size: 1rem; color: var(--muted); line-height: 1.7; padding: 0 3rem 1rem 0; max-width: 640px; }

    /* ===== Contact (static) ===== */
    .contact-section { padding: 3rem 2rem; max-width: 1100px; margin: 0 auto; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
    .contact-item { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
    .contact-icon { width: 40px; height: 40px; border: 1px solid var(--border); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent); flex-shrink: 0; transition: border-color 0.2s ease; }
    .contact-item:hover .contact-icon { border-color: var(--accent); }
    .contact-label { font-size: 0.9rem; color: var(--muted); margin-bottom: 0.15rem; }
    .contact-value { font-size: 1.1rem; color: var(--text); font-weight: 500; }

    .promises { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 1.5rem; box-shadow: 0 20px 60px rgba(79,107,240,0.10); }
    .promise-item { display: flex; gap: 1rem; padding: 0.75rem 0; border-top: 1px solid var(--border); }
    .promise-item:first-child { border-top: none; padding-top: 0; }
    .promise-item:last-child { padding-bottom: 0; }
    .promise-check { color: var(--accent); flex-shrink: 0; margin-top: 2px; display: flex; }
    .promise-check svg > * { stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke-dashoffset 0.7s var(--e-expo); transition-delay: calc(var(--i) * 120ms); }
    .has-reveal .promises:not(.is-in) .promise-check svg > * { stroke-dashoffset: 1; }
    .promise-title { font-size: 1.1rem; font-weight: 600; color: var(--text); margin-bottom: 0.2rem; letter-spacing: -0.01em; }
    .promise-desc { font-size: 1rem; color: var(--muted); line-height: 1.6; }

    .footer { background: var(--accent-dark); color: rgba(255,255,255,0.72); padding: 2rem; text-align: center; font-size: 0.95rem; }
    .footer-logo { font-size: 1.25rem; font-weight: 600; color: white; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
    .footer-logo span { color: #A0B0FF; }
    .footer a { color: rgba(255,255,255,0.72); text-decoration: none; }
    .footer a:hover { color: white; }

    @media (max-width: 900px) {
      .steps { grid-template-columns: repeat(2, 1fr); }
      .features { grid-template-columns: repeat(2, 1fr); }
      .pricing-card { grid-template-columns: 1fr; }
      .pricing-item { border-right: none; border-bottom: 1px solid var(--border); }
      .pricing-item:last-child { border-bottom: none; }
      .contact-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; }
      .preview-content { grid-template-columns: 1fr; }
      .preview-slots { grid-column: span 1; }
      .steps { grid-template-columns: 1fr; }
      .features { grid-template-columns: 1fr; }
      .after-item { grid-template-columns: 1fr; gap: 0.25rem; }
      .faq-answer { padding-right: 0; }
      .hero h1 { font-size: 2.25rem; }
      .hero-sub { font-size: 1.125rem; }
      .nav { padding: 0 1rem; }
      .section, .contact-section, .apply-section { padding: 2rem 1.25rem; }
    }

    /* Plasă de siguranță: dacă utilizatorul cere mai puțină mișcare, totul e static. */
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <Helmet>
        <title>Timevia — Programări online pentru orice afacere</title>
        <meta name="description" content="Timevia este platforma simplă prin care clienții îți rezervă online, iar tu gestionezi totul dintr-un singur loc." />
      </Helmet>

      <nav className="nav" ref={navRef}>
        <a
          href="/"
          ref={navSlotRef}
          className={`nav-logo nav-logo-slot${reducedMotion ? ' is-static' : ''}`}
          aria-label="Timevia — acasă"
        >
          time<span>via</span>
        </a>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title={isDark ? 'Mod luminos' : 'Mod întunecat'}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <a href="/demo" className="nav-cta">Vezi demo →</a>
        </div>
        <div className="nav-progress" ref={progressRef} aria-hidden="true" />
      </nav>

      {!reducedMotion && (
        <div ref={flyRef} className="nav-logo logo-fly" aria-hidden="true">
          time<span>via</span>
        </div>
      )}

      <section className="hero">
        {reducedMotion ? (
          <div className="hero-logo-static">time<span>via</span></div>
        ) : (
          <div ref={spacerRef} className="hero-logo-spacer" aria-hidden="true" />
        )}

        <div className="hero-badge rise">
          <span className="hero-badge-dot" />
          Platformă de programări pentru orice afacere
        </div>
        <h1 className="rise rise-d1">
          Programări online pentru<br /><em>afacerea ta</em>, fără bătăi de cap
        </h1>
        <p className="hero-sub rise rise-d2">
          Timevia este platforma simplă prin care clienții îți rezervă online, indiferent de domeniu — și tu gestionezi totul dintr-un singur loc.
        </p>
        <div className="hero-actions rise rise-d3">
          <a href="#aplica" className="btn-primary">Aplică gratuit</a>
          <a href="/demo" className="btn-secondary">Încearcă demo-ul →</a>
        </div>

        <div className="hero-preview-wrap rise rise-d4">
          <div className="hero-preview">
            <div className="preview-bar">
              <div className="preview-dot" />
              <div className="preview-dot" />
              <div className="preview-dot" />
            </div>
            <div className="preview-content">
              <div className="preview-card">
                <div className="preview-card-label">Programări azi</div>
                <div className="preview-card-value" data-count="8">0</div>
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
        </div>
      </section>

      <hr className="divider" />

      <section className="section" id="cum-functioneaza">
        <div className="section-label" data-reveal="rise">Cum funcționează</div>
        <SplitTitle className="section-title" text="De la zero la programări online în 4 pași" />
        <p className="section-sub">Nu ai nevoie de cunoștințe tehnice. Noi ne ocupăm de configurare, tu te ocupi de clienți.</p>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className="step-card">
              <span className="step-rule" data-reveal="line" style={{ '--d': `${i * 130}ms` }} />
              <div className="step-number" data-reveal="roll">
                <span className="roll"><span className="roll-in" style={{ '--d': `${i * 130 + 110}ms` }}>{s.n}</span></span>
              </div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      <section className="section" id="servicii">
        <div className="section-label" data-reveal="rise">Ce primești</div>
        <SplitTitle className="section-title" text="Tot ce are nevoie o afacere modernă" />
        <p className="section-sub">Fără abonamente complicate. Fără funcții inutile. Exact ce trebuie ca programările să funcționeze perfect.</p>
        <div className="features">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card" data-reveal="mark" style={{ '--d': `${i * 90}ms` }}>
              <div className="feature-icon"><Icon name={f.icon} /></div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      <section className="section" id="pret">
        <div className="section-label" data-reveal="rise">Preț</div>
        <SplitTitle className="section-title" text="Preț fix. Fără comision per programare." />
        <p className="section-sub">Plătești un abonament lunar și o taxă de implementare, o singură dată. Câte programări primești nu schimbă factura.</p>
        <div className="pricing-card">
          {PRICING.map((p) => (
            <div key={p.title} className="pricing-item">
              <div className="pricing-check"><Icon name="check" size={22} /></div>
              <div className="pricing-title">{p.title}</div>
              <div className="pricing-desc">{p.desc}</div>
            </div>
          ))}
        </div>
        <div className="pricing-cta">
          <a href="#aplica" className="btn-primary">Aplică gratuit</a>
        </div>
      </section>

      <section className="apply-section" id="aplica">
        <div className="apply-inner">
          <div className="section-label is-center" data-reveal="rise">Aplică</div>
          <SplitTitle
            className="section-title"
            text="Vrei Timevia pentru afacerea ta?"
            style={{ textAlign: 'center', maxWidth: '100%' }}
          />
          <p className="section-sub" style={{ textAlign: 'center', maxWidth: '100%', marginBottom: '1.5rem' }}>
            Completează formularul și te contactăm în maxim 24 de ore pentru a configura totul împreună.
          </p>
          {submitted ? (
            <div className="form-success">
              <div className="form-success-icon"><Icon name="check" size={24} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: T.text, marginBottom: '0.5rem' }}>Cerere trimisă cu succes!</h3>
              <p style={{ fontSize: '1rem', color: T.muted }}>Te contactăm în maxim 24 de ore la adresa <strong>{form.email}</strong>.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
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
              {error && <p style={{ color: T.danger, fontSize: '1rem', marginBottom: '0.75rem' }}>{error}</p>}
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Se trimite...' : 'Trimite cererea →'}
              </button>
            </form>
          )}

          <div className="after-apply">
            <div className="after-title">Ce se întâmplă după ce aplici</div>
            {AFTER.map((a) => (
              <div key={a.when} className="after-item">
                <div className="after-when">{a.when}</div>
                <div className="after-desc">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="intrebari">
        <div className="section-label" data-reveal="rise">Întrebări frecvente</div>
        <SplitTitle className="section-title" text="Ce ne întreabă lumea cel mai des" />
        <p className="section-sub">Dacă nu găsești răspunsul aici, scrie-ne. Îți răspundem în aceeași zi.</p>
        <div className="faq-list">
          {FAQ.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>
                {f.q}
                <span className="faq-sign" aria-hidden="true" />
              </summary>
              <div className="faq-answer">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <hr className="divider" />

      <section className="contact-section" id="contact">
        <div className="contact-grid">
          <div>
            <div className="section-label" data-reveal="rise">Contact</div>
            <SplitTitle className="section-title" text="Ai întrebări?" />
            <p className="section-sub">Suntem disponibili să răspundem oricând. Nu ezita să ne contactezi.</p>
            <div className="contact-item">
              <div className="contact-icon"><Icon name="mail" size={19} /></div>
              <div><div className="contact-label">Email</div><div className="contact-value">contact@timevia.ro</div></div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><Icon name="phone" size={19} /></div>
              <div><div className="contact-label">Telefon / WhatsApp</div><div className="contact-value">+40 721 921 530</div></div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><Icon name="pin" size={19} /></div>
              <div><div className="contact-label">Locație</div><div className="contact-value">România</div></div>
            </div>
          </div>

          <div className="promises" data-reveal="mark">
            {PROMISES.map((p, i) => (
              <div key={p.title} className="promise-item">
                <div className="promise-check" style={{ '--i': i }}><Icon name="check" size={20} /></div>
                <div>
                  <div className="promise-title">{p.title}</div>
                  <div className="promise-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo">time<span>via</span></div>
        <div style={{ marginTop: '0.25rem' }}>
          © {new Date().getFullYear()} Timevia SRL. Toate drepturile rezervate.
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <a href="/politica-confidentialitate" style={{ fontSize: '0.9rem', marginRight: '1.5rem' }}>Politică de Confidențialitate</a>
          <a href="/termeni-conditii" style={{ fontSize: '0.9rem' }}>Termeni și Condiții</a>
        </div>
      </footer>
    </>
  );
}