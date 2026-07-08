package invoice_insight_api.shared.security;

import invoice_insight_api.shared.model.AdminUser;
import invoice_insight_api.shared.model.Customers;
import invoice_insight_api.shared.model.Organization;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtService {

    public static final String ROLE_CLAIM = "role";
    public static final String CUSTOMER_ROLE = "CUSTOMER";
    public static final String ORGANIZATION_ROLE = "ORGANIZATION";
    public static final String SYSTEM_ADMIN_ROLE = "SYSTEM_ADMIN";

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                       @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(Customers customers) {
        return buildToken(customers.getId().toString(), CUSTOMER_ROLE);
    }

    public String generateToken(Organization organization) {
        return buildToken(organization.getId().toString(), ORGANIZATION_ROLE);
    }

    public String generateToken(AdminUser adminUser) {
        return buildToken(adminUser.getId().toString(), SYSTEM_ADMIN_ROLE);
    }

    private String buildToken(String subject, String role) {
        Date issuedAt = new Date();
        Date expiresAt = new Date(issuedAt.getTime() + expirationMs);

        return Jwts.builder()
                .subject(subject)
                .claim(ROLE_CLAIM, role)
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .signWith(key)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
