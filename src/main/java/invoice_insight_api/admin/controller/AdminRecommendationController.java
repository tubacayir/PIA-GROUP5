package invoice_insight_api.admin.controller;

import invoice_insight_api.admin.dto.AdminRecommendationResponse;
import invoice_insight_api.admin.service.AdminRecommendationService;
import invoice_insight_api.shared.dto.BatchRecalculationSummary;
import invoice_insight_api.shared.enums.RecommendationStatus;
import invoice_insight_api.shared.enums.RecommendationType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/recommendations")
@RequiredArgsConstructor
public class AdminRecommendationController {

    private final AdminRecommendationService adminRecommendationService;

    @GetMapping
    public ResponseEntity<List<AdminRecommendationResponse>> getRecommendations(
            @RequestParam(required = false) RecommendationStatus status,
            @RequestParam(required = false) RecommendationType type,
            @RequestParam(defaultValue = "false") boolean highPriorityOnly) {
        return ResponseEntity.ok(adminRecommendationService.getRecommendations(status, type, highPriorityOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminRecommendationResponse> getRecommendation(@PathVariable Long id) {
        return ResponseEntity.ok(adminRecommendationService.getRecommendation(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<AdminRecommendationResponse> approve(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(adminRecommendationService.approve(id, adminId(authentication)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<AdminRecommendationResponse> reject(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(adminRecommendationService.reject(id, adminId(authentication)));
    }

    @PostMapping("/recalculate")
    public ResponseEntity<BatchRecalculationSummary> recalculateAll() {
        return ResponseEntity.ok(adminRecommendationService.recalculateAll());
    }

    @PostMapping("/recalculate/customer/{customerId}")
    public ResponseEntity<AdminRecommendationResponse> recalculateCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(adminRecommendationService.recalculateCustomer(customerId));
    }

    @PostMapping("/recalculate/organization/{organizationId}")
    public ResponseEntity<AdminRecommendationResponse> recalculateOrganization(@PathVariable Long organizationId) {
        return ResponseEntity.ok(adminRecommendationService.recalculateOrganization(organizationId));
    }

    private Long adminId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }
}
