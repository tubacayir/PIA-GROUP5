package invoice_insight_api.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequest(

        @NotBlank(message = "TC kimlik numarası zorunludur")
        @Pattern(regexp = "\\d{11}", message = "TC kimlik numarası 11 haneli olmalıdır")
        String tcIdentityNumber,

        @NotBlank(message = "Şifre zorunludur")
        String password
) {
}
