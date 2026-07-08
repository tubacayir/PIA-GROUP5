package invoice_insight_api.controller;

import invoice_insight_api.dto.AdminCustomerDetailResponse;
import invoice_insight_api.dto.AdminCustomerSummaryResponse;
import invoice_insight_api.dto.CreateCustomerRequest;
import invoice_insight_api.dto.UpdateCustomerRequest;
import invoice_insight_api.enums.Gender;
import invoice_insight_api.enums.Status;
import invoice_insight_api.service.AdminCustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    public ResponseEntity<List<AdminCustomerSummaryResponse>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) String customerType,
            @RequestParam(required = false) Long packageId,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge) {
        return ResponseEntity.ok(adminCustomerService.getCustomers(
                search, city, gender, status, customerType, packageId, minAge, maxAge));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminCustomerDetailResponse> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(adminCustomerService.getCustomerDetail(id));
    }

    @PostMapping
    public ResponseEntity<AdminCustomerSummaryResponse> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCustomerService.createCustomer(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminCustomerSummaryResponse> updateCustomer(@PathVariable Long id,
                                                                        @Valid @RequestBody UpdateCustomerRequest request) {
        return ResponseEntity.ok(adminCustomerService.updateCustomer(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        adminCustomerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
