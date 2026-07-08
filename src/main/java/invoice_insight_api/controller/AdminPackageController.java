package invoice_insight_api.controller;

import invoice_insight_api.dto.PackageResponse;
import invoice_insight_api.enums.Status;
import invoice_insight_api.repository.TariffPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/packages")
@RequiredArgsConstructor
public class AdminPackageController {

    private final TariffPackageRepository tariffPackageRepository;

    @GetMapping
    public ResponseEntity<List<PackageResponse>> getPackages() {
        List<PackageResponse> packages = tariffPackageRepository.findByStatus(Status.ACTIVE).stream()
                .map(tariffPackage -> new PackageResponse(
                        tariffPackage.getId(),
                        tariffPackage.getPackageCode(),
                        tariffPackage.getPackageName(),
                        tariffPackage.getInternetLimitGb(),
                        tariffPackage.getMinuteLimit(),
                        tariffPackage.getSmsLimit(),
                        tariffPackage.getMonthlyFee()
                ))
                .toList();

        return ResponseEntity.ok(packages);
    }
}
