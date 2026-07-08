package invoice_insight_api.admin.service;

import invoice_insight_api.admin.dto.AdminUserResponse;
import invoice_insight_api.admin.dto.CreateAdminUserRequest;
import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.exception.DuplicateResourceException;
import invoice_insight_api.shared.model.AdminUser;
import invoice_insight_api.shared.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public List<AdminUserResponse> getAdmins() {
        return adminUserRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminUserResponse createAdmin(CreateAdminUserRequest request) {
        if (adminUserRepository.findByEmail(request.email()).isPresent()) {
            throw new DuplicateResourceException("Bu e-posta adresi zaten kayıtlı");
        }

        AdminUser adminUser = new AdminUser();
        adminUser.setEmail(request.email());
        adminUser.setPassword(passwordEncoder.encode(request.password()));
        adminUser.setFullName(request.fullName());
        adminUser.setCanCreateInvoices(request.canCreateInvoices());
        adminUser.setStatus(Status.ACTIVE);
        adminUser.setCreatedAt(LocalDateTime.now());
        adminUser.setUpdatedAt(LocalDateTime.now());

        return toResponse(adminUserRepository.save(adminUser));
    }

    private AdminUserResponse toResponse(AdminUser adminUser) {
        return new AdminUserResponse(
                adminUser.getId(),
                adminUser.getEmail(),
                adminUser.getFullName(),
                adminUser.isCanCreateInvoices(),
                adminUser.getStatus().name()
        );
    }
}
