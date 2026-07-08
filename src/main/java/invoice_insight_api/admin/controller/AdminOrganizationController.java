package invoice_insight_api.admin.controller;

import invoice_insight_api.admin.dto.AdminOrganizationDetailResponse;
import invoice_insight_api.admin.dto.AdminOrganizationSummaryResponse;
import invoice_insight_api.admin.dto.CreateOrganizationRequest;
import invoice_insight_api.admin.dto.UpdateOrganizationRequest;
import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.admin.service.AdminOrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/organizations")
@RequiredArgsConstructor
public class AdminOrganizationController {

    private final AdminOrganizationService adminOrganizationService;

    @GetMapping
    public ResponseEntity<List<AdminOrganizationSummaryResponse>> getOrganizations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) Status status) {
        return ResponseEntity.ok(adminOrganizationService.getOrganizations(search, city, sector, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminOrganizationDetailResponse> getOrganization(@PathVariable Long id) {
        return ResponseEntity.ok(adminOrganizationService.getOrganizationDetail(id));
    }

    @PostMapping
    public ResponseEntity<AdminOrganizationSummaryResponse> createOrganization(@Valid @RequestBody CreateOrganizationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminOrganizationService.createOrganization(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminOrganizationSummaryResponse> updateOrganization(@PathVariable Long id,
                                                                                @Valid @RequestBody UpdateOrganizationRequest request) {
        return ResponseEntity.ok(adminOrganizationService.updateOrganization(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable Long id) {
        adminOrganizationService.deleteOrganization(id);
        return ResponseEntity.noContent().build();
    }
}
