package com.cmms.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    public static String getCompanyId(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof String principal)) {
            throw new SecurityException("Authentication is required.");
        }
        String[] parts = principal.split(":");
        if (parts.length < 2) {
            throw new SecurityException("Invalid authentication principal format.");
        }
        return parts[0];
    }

    public void validateCompanyId(String requestCompanyId) {
        if (requestCompanyId == null || requestCompanyId.trim().isEmpty()) {
            throw new SecurityException("Company ID is required.");
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("Authentication is required.");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof String strPrincipal) {
            if (strPrincipal.contains(":")) {
                String currentCompanyId = strPrincipal.split(":")[0];
                if (!currentCompanyId.equals(requestCompanyId)) {
                    throw new SecurityException("Unauthorized access to company data.");
                }
            }
        }
    }

    public static String getPersonId(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof String principal)) {
            throw new SecurityException("Authentication is required.");
        }
        String[] parts = principal.split(":");
        if (parts.length < 2) {
            throw new SecurityException("Invalid authentication principal format.");
        }
        return parts[1];
    }
}
