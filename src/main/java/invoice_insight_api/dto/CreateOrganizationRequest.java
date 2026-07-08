package invoice_insight_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateOrganizationRequest(

        @NotBlank(message = "Vergi kimlik numarası zorunludur")
        @Pattern(regexp = "\\d{10}", message = "Vergi kimlik numarası 10 haneli olmalıdır")
        String taxIdentityNumber,

        @NotBlank(message = "Şirket adı zorunludur")
        String name,

        @NotBlank(message = "Şifre zorunludur")
        String password,

        String sector,

        @NotNull(message = "Çalışan sayısı zorunludur")
        Integer employeeCount,

        @NotBlank(message = "Şehir zorunludur")
        String city
) {
}
