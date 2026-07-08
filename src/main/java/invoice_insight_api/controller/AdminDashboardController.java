package invoice_insight_api.controller;

import invoice_insight_api.dto.AdminDashboardChartsResponse;
import invoice_insight_api.dto.AdminDashboardSummaryResponse;
import invoice_insight_api.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<AdminDashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(adminDashboardService.getSummary());
    }

    @GetMapping("/charts")
    public ResponseEntity<AdminDashboardChartsResponse> getCharts() {
        return ResponseEntity.ok(adminDashboardService.getCharts());
    }
}
