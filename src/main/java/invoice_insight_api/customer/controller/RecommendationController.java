package invoice_insight_api.customer.controller;

import invoice_insight_api.shared.dto.RecommendationResponse;
import invoice_insight_api.shared.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<RecommendationResponse>> getMyRecommendations(Authentication authentication) {
        Long customerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(recommendationService.getRecommendationsForCustomer(customerId));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<RecommendationResponse> approve(@PathVariable Long id, Authentication authentication) {
        Long customerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(recommendationService.approveForCustomer(customerId, id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<RecommendationResponse> reject(@PathVariable Long id, Authentication authentication) {
        Long customerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(recommendationService.rejectForCustomer(customerId, id));
    }
}
