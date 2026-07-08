package invoice_insight_api.corporate.controller;

import invoice_insight_api.corporate.dto.CorporateLoginRequest;
import invoice_insight_api.corporate.dto.CorporateLoginResponse;
import invoice_insight_api.corporate.service.CorporateAuthService;
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
public class CorporateAuthController {

    private final CorporateAuthService corporateAuthService;

    @PostMapping("/corporate-login")
    public ResponseEntity<CorporateLoginResponse> corporateLogin(@Valid @RequestBody CorporateLoginRequest request) {
        return ResponseEntity.ok(corporateAuthService.login(request));
    }
}
