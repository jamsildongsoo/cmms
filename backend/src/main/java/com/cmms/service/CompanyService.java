package com.cmms.service;

import com.cmms.domain.Company;
import com.cmms.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;

    public List<Company> getAllCompanies() {
        return companyRepository.findAllByDeleteMarkIsNullOrDeleteMark("N");
        // 대량 데이터는 database level에서 제한 검색
    }

    public Optional<Company> getCompanyById(String id) {
        return companyRepository.findById(id)
                .filter(company -> company.getDeleteMark() == null || "N".equals(company.getDeleteMark()));
        // 단건 검색 데이터는 filter로 제한 검색
    }

    @Transactional
    public Company save(Company company) {
        return companyRepository.save(company);
    }

    @Transactional
    public void delete(String id) {
        companyRepository.findById(id).ifPresent(company -> {
            company.setDeleteMark("Y"); // Soft Delete
            companyRepository.save(company);
        });
    }
}
