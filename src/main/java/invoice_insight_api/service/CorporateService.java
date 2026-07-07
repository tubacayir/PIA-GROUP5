package invoice_insight_api.service;

import invoice_insight_api.dto.EmployeeResponse;
import invoice_insight_api.dto.InvoiceSummaryResponse;
import invoice_insight_api.model.Customers;
import invoice_insight_api.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CorporateService {

    private final CustomerRepository customerRepository;
    private final InvoiceService invoiceService;

    public List<EmployeeResponse> getEmployees(Long organizationId) {
        return customerRepository.findByOrganizationId(organizationId).stream()
                .map(this::toEmployeeResponse)
                .toList();
    }

    public List<InvoiceSummaryResponse> getInvoices(Long organizationId) {
        return invoiceService.getInvoicesForOrganization(organizationId);
    }

    private EmployeeResponse toEmployeeResponse(Customers customer) {
        return new EmployeeResponse(
                customer.getId(),
                customer.getTcIdentityNumber(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhoneNumber(),
                customer.getCity(),
                customer.getStatus().name()
        );
    }
}
