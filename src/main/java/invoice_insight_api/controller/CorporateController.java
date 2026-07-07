package invoice_insight_api.controller;

import invoice_insight_api.dto.EmployeeResponse;
import invoice_insight_api.dto.InvoiceSummaryResponse;
import invoice_insight_api.service.CorporateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/corporate")
@RequiredArgsConstructor
public class CorporateController {

    private final CorporateService corporateService;

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeResponse>> getEmployees(Authentication authentication) {
        Long organizationId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(corporateService.getEmployees(organizationId));
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceSummaryResponse>> getInvoices(Authentication authentication) {
        Long organizationId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(corporateService.getInvoices(organizationId));
    }
}
