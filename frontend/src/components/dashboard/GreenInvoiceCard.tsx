import { greenInvoiceData } from "../../mock/dashboardMock";

  
  export default function GreenInvoiceCard() {
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
              {greenInvoiceData.digitalInvoices.toLocaleString("en-US")}
            </strong>
            <p>Total paperless invoices</p>
          </div>
  
          <div className="green-metric">
            <span>Digital Invoice Rate</span>
            <strong>{greenInvoiceData.digitalInvoiceRate}%</strong>
            <p>Share of all invoices</p>
          </div>
  
          <div className="green-metric">
            <span>Carbon Saved</span>
            <strong>{greenInvoiceData.carbonSavedKg} kg</strong>
            <p>Estimated CO₂ reduction</p>
          </div>
  
          <div className="green-metric">
  <span>Paper Invoices Avoided</span>

  <strong>
    {greenInvoiceData.digitalInvoices.toLocaleString("en-US")}
  </strong>

  <p>Paper invoices replaced by digital delivery</p>
</div>
        </div>
      </section>
    );
  }