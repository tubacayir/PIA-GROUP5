package invoice_insight_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateAdminUserRequest(

        @NotBlank(message = "E-posta zorunludur")
        @Email(message = "Geçerli bir e-posta giriniz")
        String email,

        @NotBlank(message = "Şifre zorunludur")
        String password,

        @NotBlank(message = "Ad soyad zorunludur")
        String fullName,

        boolean canCreateInvoices
) {
}
