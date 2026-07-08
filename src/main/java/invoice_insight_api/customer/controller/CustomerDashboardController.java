package invoice_insight_api.customer.controller;

import invoice_insight_api.customer.dto.DashboardSummaryResponse;
import invoice_insight_api.customer.service.CustomerDashboardService;
import invoice_insight_api.shared.dto.CurrentUsageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/dashboard")
@RequiredArgsConstructor
public class CustomerDashboardController {

    private final CustomerDashboardService customerDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(Authentication authentication) {
        Long customerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(customerDashboardService.getDashboardSummary(customerId));
    }

    @GetMapping("/usage")
    public ResponseEntity<CurrentUsageResponse> getCurrentUsage(Authentication authentication) {
        Long customerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(customerDashboardService.getCurrentUsage(customerId));
    }
}
