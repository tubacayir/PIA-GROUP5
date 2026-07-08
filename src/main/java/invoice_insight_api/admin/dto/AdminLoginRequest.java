package invoice_insight_api.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequest(

        @NotBlank(message = "E-posta zorunludur")
        @Email(message = "Geçerli bir e-posta giriniz")
        String email,

        @NotBlank(message = "Şifre zorunludur")
        String password
) {
}
