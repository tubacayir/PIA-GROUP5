package invoice_insight_api.admin.service;

import invoice_insight_api.admin.dto.AdminLoginRequest;
import invoice_insight_api.admin.dto.AdminLoginResponse;
import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.exception.InvalidCredentialsException;
import invoice_insight_api.shared.model.AdminUser;
import invoice_insight_api.shared.repository.AdminUserRepository;
import invoice_insight_api.shared.security.JwtService;
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
