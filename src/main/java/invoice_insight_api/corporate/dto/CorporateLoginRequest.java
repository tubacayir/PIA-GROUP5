package invoice_insight_api.corporate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CorporateLoginRequest(

        @NotBlank(message = "Vergi kimlik numarası zorunludur")
        @Pattern(regexp = "\\d{10}", message = "Vergi kimlik numarası 10 haneli olmalıdır")
        String taxIdentityNumber,

        @NotBlank(message = "Şifre zorunludur")
        String password
) {
}
