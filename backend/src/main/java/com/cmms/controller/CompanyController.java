package com.cmms.controller;

import com.cmms.domain.Company;
import com.cmms.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public List<Company> getAllCompanies() {
        return companyService.getAllCompanies();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompany(@PathVariable String id) {
        return companyService.getCompanyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Company createCompany(@RequestBody Company company) {
        return companyService.save(company);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable String id) {
        companyService.delete(id);
        return ResponseEntity.ok().build();
    }
}
