package invoice_insight_api.service;

import invoice_insight_api.dto.AdminLoginRequest;
import invoice_insight_api.dto.AdminLoginResponse;
import invoice_insight_api.enums.Status;
import invoice_insight_api.exception.InvalidCredentialsException;
import invoice_insight_api.model.AdminUser;
import invoice_insight_api.repository.AdminUserRepository;
import invoice_insight_api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAuthService {

    private static final String INVALID_CREDENTIALS_MESSAGE = "E-posta veya şifre hatalı";

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminLoginResponse login(AdminLoginRequest request) {
        AdminUser adminUser = adminUserRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE));

        if (adminUser.getStatus() != Status.ACTIVE) {
            throw new InvalidCredentialsException("Yönetici hesabı aktif değil");
        }

        if (!passwordEncoder.matches(request.password(), adminUser.getPassword())) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        }

        String token = jwtService.generateToken(adminUser);

        return new AdminLoginResponse(
                token,
                "Bearer",
                adminUser.getId(),
                adminUser.getFullName(),
                adminUser.isCanCreateInvoices()
        );
    }
}
