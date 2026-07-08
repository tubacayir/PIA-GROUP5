package invoice_insight_api.controller;

import invoice_insight_api.dto.AdminUserResponse;
import invoice_insight_api.dto.CreateAdminUserRequest;
import invoice_insight_api.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/admins")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAdmins() {
        return ResponseEntity.ok(adminUserService.getAdmins());
    }

    @PostMapping
    public ResponseEntity<AdminUserResponse> createAdmin(@Valid @RequestBody CreateAdminUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.createAdmin(request));
    }
}
