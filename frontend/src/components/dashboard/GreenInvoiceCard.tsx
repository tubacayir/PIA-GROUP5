export interface GreenInvoiceData {
  digitalInvoices: number;
  paperInvoices: number;
  carbonSavedKg: number;
  treesEquivalent: number;
}

interface GreenInvoiceCardProps {
  data: GreenInvoiceData;
}

export default function GreenInvoiceCard({ data }: GreenInvoiceCardProps) {
  return (
    <section className="analytics-card green-invoice-card">
      <div className="analytics-card-header">
        <h2>Green Invoice Impact</h2>
        <p>Environmental impact of digital invoice adoption</p>
      </div>

      <div className="green-invoice-grid">
        <div className="green-metric">
          <span>Digital Invoices</span>

          <strong>
            {data.digitalInvoices.toLocaleString("en-US")}
          </strong>

          <p>Total paperless invoices</p>
        </div>

        <div className="green-metric">
          <span>Paper Invoices</span>

          <strong>
            {data.paperInvoices.toLocaleString("en-US")}
          </strong>

          <p>Invoices delivered through physical channels</p>
        </div>

        <div className="green-metric">
          <span>Carbon Saved</span>

          <strong>
            {data.carbonSavedKg.toLocaleString("en-US")} kg
          </strong>

          <p>Estimated CO₂ reduction</p>
        </div>

        <div className="green-metric">
          <span>Trees Equivalent</span>

          <strong>
            {data.treesEquivalent}
          </strong>

          <p>Estimated environmental impact equivalent</p>
        </div>
      </div>
    </section>
  );
}
