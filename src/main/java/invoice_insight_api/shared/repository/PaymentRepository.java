package invoice_insight_api.shared.repository;

import invoice_insight_api.shared.enums.PaymentStatus;
import invoice_insight_api.shared.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByInvoice_IdInAndStatusOrderByPaymentDateDesc(Collection<Long> invoiceIds, PaymentStatus status);

    // Distinct invoices that have at least one successful payment -> "Paid".
    @Query("SELECT COUNT(DISTINCT p.invoice.id) FROM Payment p WHERE p.status = invoice_insight_api.shared.enums.PaymentStatus.PAID")
    long countDistinctInvoicesWithSuccessfulPayment();

    @Query("SELECT COUNT(DISTINCT p.invoice.id) FROM Payment p " +
            "WHERE p.status = invoice_insight_api.shared.enums.PaymentStatus.PAID AND p.paymentDate <= p.invoice.dueDate")
    long countDistinctInvoicesPaidOnTime();

    @Query("SELECT COUNT(DISTINCT p.invoice.id) FROM Payment p " +
            "WHERE p.status = invoice_insight_api.shared.enums.PaymentStatus.PAID AND p.paymentDate > p.invoice.dueDate")
    long countDistinctInvoicesPaidLate();

    @Query("SELECT p.paymentChannel, COUNT(p) FROM Payment p " +
            "WHERE p.status = invoice_insight_api.shared.enums.PaymentStatus.PAID GROUP BY p.paymentChannel")
    List<Object[]> countSuccessfulPaymentsByChannelGrouped();

    @Query("SELECT p.invoice.invoiceYear, p.invoice.invoiceMonth, COUNT(p) FROM Payment p " +
            "WHERE p.status = invoice_insight_api.shared.enums.PaymentStatus.PAID AND p.paymentDate > p.invoice.dueDate " +
            "GROUP BY p.invoice.invoiceYear, p.invoice.invoiceMonth ORDER BY p.invoice.invoiceYear, p.invoice.invoiceMonth")
    List<Object[]> findLatePaymentMonthlyTrend();
}
