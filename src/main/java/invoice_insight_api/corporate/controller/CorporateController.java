package invoice_insight_api.corporate.controller;

import invoice_insight_api.corporate.dto.CorporateInvoiceSummaryResponse;
import invoice_insight_api.corporate.dto.DashboardSummaryResponse;
import invoice_insight_api.corporate.dto.EmployeeResponse;
import invoice_insight_api.corporate.dto.InvoiceAnalyticsResponse;
import invoice_insight_api.shared.dto.InvoiceDetailResponse;
import invoice_insight_api.shared.dto.MonthlyInvoiceTrendPoint;
import invoice_insight_api.corporate.dto.MonthlyUsageTrendPoint;
import invoice_insight_api.shared.dto.PackageResponse;
import invoice_insight_api.corporate.dto.SubscriptionResponse;
import invoice_insight_api.corporate.dto.UpdateSubscriptionPackageRequest;
import invoice_insight_api.corporate.dto.UpdateSubscriptionStatusRequest;
import invoice_insight_api.corporate.dto.UsageAnalyticsResponse;
import invoice_insight_api.corporate.service.CorporateService;
import invoice_insight_api.shared.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/corporate")
@RequiredArgsConstructor
public class CorporateController {

    private final CorporateService corporateService;
    private final InvoiceService invoiceService;

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(Authentication authentication) {
        return ResponseEntity.ok(corporateService.getDashboardSummary(organizationId(authentication)));
    }

    @GetMapping("/dashboard/usage-trend")
    public ResponseEntity<List<MonthlyUsageTrendPoint>> getUsageTrend(Authentication authentication) {
        return ResponseEntity.ok(corporateService.getMonthlyUsageTrend(organizationId(authentication)));
    }

    @GetMapping("/dashboard/invoice-trend")
    public ResponseEntity<List<MonthlyInvoiceTrendPoint>> getInvoiceTrend(Authentication authentication) {
        return ResponseEntity.ok(invoiceService.getMonthlyInvoiceTrendForOrganization(organizationId(authentication)));
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeResponse>> getEmployees(Authentication authentication) {
        return ResponseEntity.ok(corporateService.getEmployees(organizationId(authentication)));
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<EmployeeResponse> getEmployee(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(corporateService.getEmployeeDetail(organizationId(authentication), id));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<List<SubscriptionResponse>> getSubscriptions(Authentication authentication) {
        return ResponseEntity.ok(corporateService.getSubscriptions(organizationId(authentication)));
    }

    @GetMapping("/subscriptions/{id}")
    public ResponseEntity<SubscriptionResponse> getSubscription(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(corporateService.getSubscription(organizationId(authentication), id));
    }

    @PatchMapping("/subscriptions/{id}/package")
    public ResponseEntity<SubscriptionResponse> updateSubscriptionPackage(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSubscriptionPackageRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(corporateService.updateSubscriptionPackage(organizationId(authentication), id, request.packageId()));
    }

    @PatchMapping("/subscriptions/{id}/status")
    public ResponseEntity<SubscriptionResponse> updateSubscriptionStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSubscriptionStatusRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(corporateService.updateSubscriptionStatus(organizationId(authentication), id, request.status()));
    }

    @GetMapping("/packages")
    public ResponseEntity<List<PackageResponse>> getPackages() {
        return ResponseEntity.ok(corporateService.getPackages());
    }

    @GetMapping("/usage-analytics")
    public ResponseEntity<UsageAnalyticsResponse> getUsageAnalytics(Authentication authentication) {
        return ResponseEntity.ok(corporateService.getUsageAnalytics(organizationId(authentication)));
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<CorporateInvoiceSummaryResponse>> getInvoices(Authentication authentication) {
        return ResponseEntity.ok(invoiceService.getInvoicesForOrganization(organizationId(authentication)));
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<InvoiceDetailResponse> getInvoice(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(invoiceService.getInvoiceDetailForOrganization(organizationId(authentication), id));
    }

    @GetMapping("/invoices/analytics")
    public ResponseEntity<InvoiceAnalyticsResponse> getInvoiceAnalytics(Authentication authentication) {
        return ResponseEntity.ok(invoiceService.getInvoiceAnalyticsForOrganization(organizationId(authentication)));
    }

    private Long organizationId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }
}
