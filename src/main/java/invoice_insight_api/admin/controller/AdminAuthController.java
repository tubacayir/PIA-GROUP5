package invoice_insight_api.admin.controller;

import invoice_insight_api.admin.dto.AdminLoginRequest;
import invoice_insight_api.admin.dto.AdminLoginResponse;
import invoice_insight_api.admin.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(value = "*")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/admin-login")
    public ResponseEntity<AdminLoginResponse> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(adminAuthService.login(request));
    }
}
