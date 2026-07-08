package invoice_insight_api.customer.service;

import invoice_insight_api.customer.dto.DashboardSummaryResponse;
import invoice_insight_api.shared.dto.CurrentUsageResponse;
import invoice_insight_api.shared.enums.InvoiceStatus;
import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.model.Invoice;
import invoice_insight_api.shared.model.Subscription;
import invoice_insight_api.shared.model.TariffPackage;
import invoice_insight_api.shared.model.UsageSummary;
import invoice_insight_api.shared.repository.InvoiceRepository;
import invoice_insight_api.shared.repository.SubscriptionRepository;
import invoice_insight_api.shared.repository.UsageSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerDashboardService {

    private static final List<InvoiceStatus> UNPAID_STATUSES = List.of(InvoiceStatus.CREATED, InvoiceStatus.OVERDUE);

    private final InvoiceRepository invoiceRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UsageSummaryRepository usageSummaryRepository;

    public DashboardSummaryResponse getDashboardSummary(Long customerId) {
        List<Invoice> unpaidInvoices = invoiceRepository
                .findBySubscription_Customers_IdAndStatusInOrderByDueDateAsc(customerId, UNPAID_STATUSES);

        BigDecimal totalUnpaidAmount = unpaidInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate nextPaymentDueDate = unpaidInvoices.stream()
                .findFirst()
                .map(Invoice::getDueDate)
                .orElse(null);

        return new DashboardSummaryResponse(totalUnpaidAmount, nextPaymentDueDate);
    }

    public CurrentUsageResponse getCurrentUsage(Long customerId) {
        Optional<Subscription> primarySubscription = subscriptionRepository.findByCustomers_Id(customerId).stream()
                .sorted(Comparator
                        .comparing((Subscription s) -> s.getStatus() == Status.ACTIVE ? 0 : 1)
                        .thenComparing(Subscription::getStartDate, Comparator.reverseOrder()))
                .findFirst();

        return primarySubscription
                .flatMap(this::latestCurrentUsage)
                .orElse(null);
    }

    private Optional<CurrentUsageResponse> latestCurrentUsage(Subscription subscription) {
        return usageSummaryRepository
                .findBySubscription_IdOrderByUsageYearDescUsageMonthDesc(subscription.getId())
                .stream()
                .findFirst()
                .map(usage -> toCurrentUsageResponse(usage, subscription.getTariffPackage()));
    }

    private CurrentUsageResponse toCurrentUsageResponse(UsageSummary usage, TariffPackage tariffPackage) {
        boolean exceedsLimit = usage.getUsedInternetGb().compareTo(tariffPackage.getInternetLimitGb()) > 0
                || usage.getUsedMinutes() > tariffPackage.getMinuteLimit()
                || usage.getUsedSms() > tariffPackage.getSmsLimit();

        return new CurrentUsageResponse(
                usage.getUsageMonth(),
                usage.getUsageYear(),
                usage.getUsedInternetGb(),
                usage.getUsedMinutes(),
                usage.getUsedSms(),
                tariffPackage.getInternetLimitGb(),
                tariffPackage.getMinuteLimit(),
                tariffPackage.getSmsLimit(),
                exceedsLimit
        );
    }
}
