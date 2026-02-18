package com.cmms.common.security;

import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    /**
     * Validates if the provided companyId matches the authenticated user's
     * companyId.
     * Currently a placeholder that accepts any non-null/non-empty value.
     * In a real implementation, this would check against the SecurityContext.
     *
     * @param requestCompanyId The companyId from the request/entity
     * @throws SecurityException if validation fails
     */
    public void validateCompanyId(String requestCompanyId) {
        if (requestCompanyId == null || requestCompanyId.trim().isEmpty()) {
            throw new SecurityException("Company ID is required.");
        }

        // TODO: Integrate with Spring Security to check against logged-in user's
        // company
        // String currentCompanyId = SecurityContextHolder.getContext()...
        // if (!currentCompanyId.equals(requestCompanyId)) {
        // throw new SecurityException("Unauthorized access to company data.");
        // }
    }
}
