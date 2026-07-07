package invoice_insight_api.service;

import invoice_insight_api.dto.LoginRequest;
import invoice_insight_api.dto.LoginResponse;
import invoice_insight_api.enums.Status;
import invoice_insight_api.exception.InvalidCredentialsException;
import invoice_insight_api.model.Customer;
import invoice_insight_api.repository.CustomerRepository;
import invoice_insight_api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private static final String INVALID_CREDENTIALS_MESSAGE = "TC kimlik numarası veya şifre hatalı";

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        Customer customers = customerRepository.findByTcIdentityNumber(request.tcIdentityNumber())
                .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE));

        if (customers.getStatus() != Status.ACTIVE) {
            throw new InvalidCredentialsException("Hesap aktif değil");
        }

        if (!passwordEncoder.matches(request.password(), customers.getPassword())) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        }

        String token = jwtService.generateToken(customers);

        return new LoginResponse(
                token,
                "Bearer",
                customers.getId(),
                customers.getFirstName() + " " + customers.getLastName(),
                customers.getEmail()
        );
    }
}
