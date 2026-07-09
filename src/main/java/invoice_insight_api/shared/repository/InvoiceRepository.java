package invoice_insight_api.shared.repository;

import invoice_insight_api.shared.enums.InvoiceStatus;
import invoice_insight_api.shared.model.Invoice;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findBySubscription_Customer_IdOrderByIssueDateDesc(Long customerId);

    Optional<Invoice> findByIdAndSubscription_Customer_Id(Long id, Long customerId);

    List<Invoice> findBySubscription_Customer_IdAndStatusInOrderByDueDateAsc(Long customerId, List<InvoiceStatus> statuses);

    List<Invoice> findBySubscription_Organization_IdOrderByIssueDateDesc(Long organizationId);

    Optional<Invoice> findByIdAndSubscription_Organization_Id(Long id, Long organizationId);

    List<Invoice> findBySubscription_IdOrderByIssueDateDesc(Long subscriptionId);

    @Query("SELECT AVG(i.totalAmount) FROM Invoice i")
    BigDecimal findAverageTotalAmount();

    @Query("SELECT i.invoiceYear, i.invoiceMonth, SUM(i.totalAmount) FROM Invoice i " +
            "GROUP BY i.invoiceYear, i.invoiceMonth ORDER BY i.invoiceYear, i.invoiceMonth")
    List<Object[]> findMonthlyRevenueTrend();

    @Query("SELECT i.invoiceYear, i.invoiceMonth, COUNT(i) FROM Invoice i " +
            "GROUP BY i.invoiceYear, i.invoiceMonth ORDER BY i.invoiceYear, i.invoiceMonth")
    List<Object[]> findMonthlyInvoiceCountTrend();

    @Query("SELECT i.status, COUNT(i) FROM Invoice i GROUP BY i.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT i.deliveryMethod, COUNT(i) FROM Invoice i WHERE i.deliveryMethod IS NOT NULL GROUP BY i.deliveryMethod")
    List<Object[]> countByDeliveryMethodGrouped();

    @Query("SELECT i.paymentChannel, COUNT(i) FROM Invoice i WHERE i.paymentChannel IS NOT NULL GROUP BY i.paymentChannel")
    List<Object[]> countByPaymentChannelGrouped();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.deliveryMethod IS NOT NULL")
    long countWithDeliveryMethod();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.deliveryMethod = invoice_insight_api.shared.enums.DeliveryMethod.DIGITAL")
    long countDigitalInvoices();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = invoice_insight_api.shared.enums.InvoiceStatus.PAID AND i.paymentDate IS NOT NULL")
    long countPaidWithPaymentDate();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = invoice_insight_api.shared.enums.InvoiceStatus.PAID " +
            "AND i.paymentDate IS NOT NULL AND i.paymentDate <= i.dueDate")
    long countPaidOnTime();

    @Query("SELECT i.invoiceYear, i.invoiceMonth, COUNT(i) FROM Invoice i " +
            "WHERE i.status = invoice_insight_api.shared.enums.InvoiceStatus.PAID AND i.paymentDate > i.dueDate " +
            "GROUP BY i.invoiceYear, i.invoiceMonth ORDER BY i.invoiceYear, i.invoiceMonth")
    List<Object[]> findLatePaymentMonthlyTrend();

    @Query("SELECT s.organization.name, SUM(i.totalAmount) FROM Invoice i JOIN i.subscription s " +
            "WHERE s.organization IS NOT NULL GROUP BY s.organization.id, s.organization.name " +
            "ORDER BY SUM(i.totalAmount) DESC")
    List<Object[]> findTopCompaniesByBilledAmount(Pageable pageable);

    @Query("SELECT i FROM Invoice i " +
            "JOIN FETCH i.subscription s " +
            "JOIN FETCH s.customer " +
            "JOIN FETCH s.tariffPackage")
    List<Invoice> findAllWithSubscriptionCustomerAndPackage();
}
