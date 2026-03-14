package com.cmms.service;

import com.cmms.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalHtmlService {

    private final TransactionService transactionService;
    private final TemplateEngine templateEngine;

    public String generateHtmlBody(String companyId, String refEntity, String refId) {
        Context context = new Context();
        String templateName = "approval/layout";
        String contentFragment = "";

        if ("INSPECTION".equalsIgnoreCase(refEntity)) {
            Optional<Inspection> doc = transactionService.getInspectionById(companyId, refId);
            if (doc.isPresent()) {
                context.setVariable("doc", doc.get());
                contentFragment = "approval/inspection :: content";
            }
        } else if ("WO".equalsIgnoreCase(refEntity) || "WORK_ORDER".equalsIgnoreCase(refEntity)) {
            Optional<WorkOrder> doc = transactionService.getWorkOrderById(companyId, refId);
            if (doc.isPresent()) {
                context.setVariable("doc", doc.get());
                contentFragment = "approval/work-order :: content";
            }
        } else if ("WP".equalsIgnoreCase(refEntity) || "WORK_PERMIT".equalsIgnoreCase(refEntity)) {
            Optional<WorkPermit> doc = transactionService.getWorkPermitById(companyId, refId);
            if (doc.isPresent()) {
                context.setVariable("doc", doc.get());
                contentFragment = "approval/work-permit :: content";
            }
        }

        if (contentFragment.isEmpty()) {
            log.warn("결재 본문 생성 실패 - 문서를 찾을 수 없음: refEntity={}, refId={}", refEntity, refId);
            return "<div style='padding:20px; color:red;'>해당 문서를 찾을 수 없거나 지원하지 않는 유형입니다. (ID: " + refId + ")</div>";
        }

        context.setVariable("content", contentFragment);

        try {
            return templateEngine.process(templateName, context);
        } catch (Exception e) {
            log.error("결재 본문 HTML 템플릿 렌더링 실패: refEntity={}, refId={}", refEntity, refId, e);
            return "<div style='padding:20px; color:red;'>결재 본문 생성 중 오류가 발생했습니다. (ID: " + refId + ")</div>";
        }
    }
}
