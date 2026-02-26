package com.cmms.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    /**
     * Validates if the provided companyId matches the authenticated user's
     * companyId.
     *
     * @param requestCompanyId The companyId from the request/entity
     * @throws SecurityException if validation fails
     */
    public void validateCompanyId(String requestCompanyId) {
        if (requestCompanyId == null || requestCompanyId.trim().isEmpty()) {
            throw new SecurityException("Company ID is required.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Authentication is required.");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof String) {
            String strPrincipal = (String) principal;
            if (strPrincipal.contains(":")) {
                String currentCompanyId = strPrincipal.split(":")[0];
                if (!currentCompanyId.equals(requestCompanyId)) {
                    throw new SecurityException("Unauthorized access to company data.");
                }
            }
        }
    }
}
