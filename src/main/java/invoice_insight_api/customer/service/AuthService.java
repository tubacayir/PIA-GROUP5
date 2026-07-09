package invoice_insight_api.customer.service;

import invoice_insight_api.customer.dto.LoginRequest;
import invoice_insight_api.customer.dto.LoginResponse;
import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.exception.InvalidCredentialsException;
import invoice_insight_api.shared.model.Customers;
import invoice_insight_api.shared.repository.CustomerRepository;
import invoice_insight_api.shared.security.JwtService;
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
        Customers customer = customerRepository.findByTcIdentityNumber(request.tcIdentityNumber())
                .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE));

        if (customer.getStatus() != Status.ACTIVE) {
            throw new InvalidCredentialsException("Hesap aktif değil");
        }

        if (!passwordEncoder.matches(request.password(), customer.getPassword())) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE);
        }

        String token = jwtService.generateToken(customer);

        return new LoginResponse(
                token,
                "Bearer",
                customer.getId(),
                customer.getFirstName() + " " + customer.getLastName(),
                customer.getEmail()
        );
    }
}
