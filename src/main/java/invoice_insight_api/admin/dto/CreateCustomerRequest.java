package invoice_insight_api.admin.dto;

import invoice_insight_api.shared.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record CreateCustomerRequest(

        @NotBlank(message = "TC kimlik numarası zorunludur")
        @Pattern(regexp = "\\d{11}", message = "TC kimlik numarası 11 haneli olmalıdır")
        String tcIdentityNumber,

        @NotBlank(message = "Ad zorunludur")
        String firstName,

        @NotBlank(message = "Soyad zorunludur")
        String lastName,

        @NotBlank(message = "E-posta zorunludur")
        @Email(message = "Geçerli bir e-posta giriniz")
        String email,

        @NotBlank(message = "Telefon numarası zorunludur")
        String phoneNumber,

        @NotBlank(message = "Şifre zorunludur")
        String password,

        @NotNull(message = "Doğum tarihi zorunludur")
        LocalDate birthDate,

        @NotNull(message = "Cinsiyet zorunludur")
        Gender gender,

        @NotBlank(message = "Şehir zorunludur")
        String city,
        @NotNull(message = "Package seçimi zorunludur")
        Long tariffPackageId

) {
}
