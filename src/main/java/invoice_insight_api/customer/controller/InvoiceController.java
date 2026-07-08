package invoice_insight_api.customer.controller;

import invoice_insight_api.shared.dto.InvoiceDetailResponse;
import invoice_insight_api.shared.dto.InvoiceSummaryResponse;
import invoice_insight_api.shared.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<InvoiceSummaryResponse>> getMyInvoices(Authentication authentication) {
        Long customerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(invoiceService.getInvoicesForCustomer(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDetailResponse> getInvoiceDetail(@PathVariable Long id,
                                                                   Authentication authentication) {
        Long customerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(invoiceService.getInvoiceDetail(customerId, id));
    }
}
