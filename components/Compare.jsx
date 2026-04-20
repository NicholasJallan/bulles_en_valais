const Compare = ({ t }) => (
  <section className="compare" id="compare">
    <div className="container">
      <div className="sec-header">
        <div>
          <div className="eyebrow" style={{marginBottom: 20}}>{t.compare.eyebrow}</div>
          <h2>{t.compare.title_1} <em>{t.compare.title_em}</em></h2>
        </div>
        <p className="sec-lead">{t.compare.lead}</p>
      </div>

      <table className="compare-table">
        <thead>
          <tr>
            <th></th>
            <th className="serif">PADI<span>{t.compare.head[0]}</span></th>
            <th className="serif">SDI / TDI<span>{t.compare.head[1]}</span></th>
            <th className="serif">FFESSM<span>{t.compare.head[2]}</span></th>
          </tr>
        </thead>
        <tbody>
          {t.compare.rows.map((r, i) => (
            <tr key={i}>
              <td>{r.k}</td>
              <td data-col="PADI">{r.v[0]}</td>
              <td data-col="SDI/TDI">{r.v[1]}</td>
              <td data-col="FFESSM">{r.v[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{marginTop: 32, color: 'var(--ink-muted)', fontSize: 14, fontStyle: 'italic', maxWidth: '70ch'}}>{t.compare.footer}</p>
    </div>
  </section>
);
window.Compare = Compare;
