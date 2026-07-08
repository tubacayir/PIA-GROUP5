package invoice_insight_api.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateOrganizationRequest(

        @NotBlank(message = "Şirket adı zorunludur")
        String name,

        String sector,

        @NotNull(message = "Çalışan sayısı zorunludur")
        Integer employeeCount,

        @NotBlank(message = "Şehir zorunludur")
        String city
) {
}
