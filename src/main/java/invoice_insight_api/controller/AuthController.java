package invoice_insight_api.controller;

import invoice_insight_api.dto.CorporateLoginRequest;
import invoice_insight_api.dto.CorporateLoginResponse;
import invoice_insight_api.dto.LoginRequest;
import invoice_insight_api.dto.LoginResponse;
import invoice_insight_api.service.AuthService;
import invoice_insight_api.service.CorporateAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CorporateAuthService corporateAuthService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/corporate-login")
    public ResponseEntity<CorporateLoginResponse> corporateLogin(@Valid @RequestBody CorporateLoginRequest request) {
        return ResponseEntity.ok(corporateAuthService.login(request));
    }
}
