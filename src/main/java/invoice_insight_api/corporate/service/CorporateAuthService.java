package invoice_insight_api.corporate.service;

import invoice_insight_api.corporate.dto.CorporateLoginRequest;
import invoice_insight_api.corporate.dto.CorporateLoginResponse;
import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.exception.InvalidCredentialsException;
import invoice_insight_api.shared.model.Organization;
import invoice_insight_api.shared.repository.OrganizationRepository;
import invoice_insight_api.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CorporateAuthService {

    private static final String INVALID_CREDENTIALS_MESSAGE = "Vergi kimlik numarası veya şifre hatalı";

    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public CorporateLoginResponse login(CorporateLoginRequest request) {
        Organization organization = organizationRepository.findByTaxIdentityNumber(request.taxIdentityNumber())
                .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE));

        if (organization.getStatus() != Status.ACTIVE) {
            throw new InvalidCredentialsException("Şirket hesabı aktif değil");
        }

        if (!passwordEncoder.matches(request.password(), organization.getPassword())) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        }

        String token = jwtService.generateToken(organization);

        return new CorporateLoginResponse(
                token,
                "Bearer",
                organization.getId(),
                organization.getName()
        );
    }
}
