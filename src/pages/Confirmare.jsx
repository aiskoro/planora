function Confirmare({ nume, data, ora, oraStop, servicii, durata, onNouaProgramare }) {
  function formateazaData(dataStr) {
    if (!dataStr) return '';
    const [an, luna, zi] = dataStr.split('-');
    const luni = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
                  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
    return `${zi} ${luni[parseInt(luna) - 1]} ${an}`;
  }

  function descarcaICS() {
    const dataFormatata = data.replace(/-/g, '');
    const oraFormatata = ora.replace(':', '') + '00';
    const oraStopFormatata = oraStop.replace(':', '') + '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Planora//RO',
      'BEGIN:VEVENT',
      `DTSTART:${dataFormatata}T${oraFormatata}`,
      `DTEND:${dataFormatata}T${oraStopFormatata}`,
      `SUMMARY:Programare Planora — ${servicii.join(', ')}`,
      `DESCRIPTION:Servicii: ${servicii.join(', ')}\\nDurată: ${durata} minute`,
      'LOCATION:Planora',
      `UID:${Date.now()}@planora`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'programare-planora.ics';
    link.click();
    URL.revokeObjectURL(url);
  }

  function getLinkGoogleCalendar() {
    const dataFormatata = data.replace(/-/g, '');
    const oraFormatata = ora.replace(':', '') + '00';
    const oraStopFormatata = oraStop.replace(':', '') + '00';
    const titlu = encodeURIComponent(`Programare Planora — ${servicii.join(', ')}`);
    const detalii = encodeURIComponent(`Servicii: ${servicii.join(', ')}\nDurată: ${durata} minute`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titlu}&dates=${dataFormatata}T${oraFormatata}/${dataFormatata}T${oraStopFormatata}&details=${detalii}`;
  }

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      {/* Icon success */}
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        backgroundColor: '#d1fae5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        fontSize: '36px',
      }}>
        ✓
      </div>

      <h1 style={{ fontSize: '26px', color: '#111', marginBottom: '8px' }}>
        Programare confirmată!
      </h1>
      <p style={{ color: '#666', marginBottom: '32px', fontSize: '15px' }}>
        Te așteptăm, <strong>{nume}</strong>!
      </p>

      {/* Card detalii */}
      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #eee',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'left',
        marginBottom: '32px',
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Detalii programare
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>📅</span>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>Data</p>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>{formateazaData(data)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>⏰</span>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>Ora</p>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>{ora} — {oraStop}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>✂️</span>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>Servicii</p>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>{servicii.join(', ')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>⏱️</span>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>Durată estimată</p>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>{durata} minute</p>
            </div>
          </div>
        </div>
      </div>

      <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
        Dacă ai introdus adresa de email, vei primi o confirmare și acolo.
      </p>

      {/* Butoane */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
        <a
          href={getLinkGoogleCalendar()}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '12px 28px',
            borderRadius: '10px',
            border: '1px solid #4F46E5',
            backgroundColor: '#fff',
            color: '#4F46E5',
            fontSize: '15px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%',
            textAlign: 'center',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          📅 Adaugă în Google Calendar
        </a>

        <button
          onClick={descarcaICS}
          style={{
            padding: '12px 28px',
            borderRadius: '10px',
            border: '1px solid #666',
            backgroundColor: '#fff',
            color: '#444',
            fontSize: '15px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%',
          }}
        >
          📥 Adaugă în Apple Calendar (.ics)
        </button>

        <button
          onClick={onNouaProgramare}
          style={{
            padding: '12px 28px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#4F46E5',
            color: '#fff',
            fontSize: '15px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%',
          }}
        >
          Fă o nouă programare
        </button>
      </div>
    </div>
  );
}

export default Confirmare;