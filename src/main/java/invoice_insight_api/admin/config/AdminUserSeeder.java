package invoice_insight_api.admin.config;

import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.model.AdminUser;
import invoice_insight_api.shared.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AdminUserSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserSeeder.class);
    private static final String DEFAULT_EMAIL = "admin@piacell.com";
    private static final String DEFAULT_PASSWORD = "Admin123!";

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (adminUserRepository.count() > 0) {
            return;
        }

        AdminUser adminUser = new AdminUser();
        adminUser.setEmail(DEFAULT_EMAIL);
        adminUser.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        adminUser.setFullName("PiaCell Sistem Yöneticisi");
        adminUser.setCanCreateInvoices(true);
        adminUser.setStatus(Status.ACTIVE);
        adminUser.setCreatedAt(LocalDateTime.now());
        adminUser.setUpdatedAt(LocalDateTime.now());
        adminUserRepository.save(adminUser);

        log.warn("No admin users found - created default System Admin account. email={} password={} " +
                "(CHANGE THIS before any non-local use)", DEFAULT_EMAIL, DEFAULT_PASSWORD);
    }
}
