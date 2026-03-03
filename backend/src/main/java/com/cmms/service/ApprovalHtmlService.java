package com.cmms.service;

import com.cmms.domain.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalHtmlService {

    private final TransactionService transactionService;

    public String generateHtmlBody(String companyId, String refEntity, String refId) {
        StringBuilder html = new StringBuilder();

        html.append("<div style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">");

        if ("INSPECTION".equalsIgnoreCase(refEntity)) {
            html.append(generateInspectionHtml(companyId, refId));
        } else if ("WO".equalsIgnoreCase(refEntity) || "WORK_ORDER".equalsIgnoreCase(refEntity)) {
            html.append(generateWorkOrderHtml(companyId, refId));
        } else if ("WP".equalsIgnoreCase(refEntity) || "WORK_PERMIT".equalsIgnoreCase(refEntity)) {
            html.append(generateWorkPermitHtml(companyId, refId));
        } else {
            html.append("<p>지원하지 않는 문서 유형입니다.</p>");
        }

        html.append("<br/>");
        html.append("<hr style=\"border: 1px solid #eee; margin-top: 20px;\" />");
        html.append("<div style=\"margin-top: 15px; text-align: center;\">");

        // Add a link back to the system based on entity
        String linkPath = "";
        if ("INSPECTION".equalsIgnoreCase(refEntity))
            linkPath = "/pm/inspection/" + refId;
        else if ("WO".equalsIgnoreCase(refEntity) || "WORK_ORDER".equalsIgnoreCase(refEntity))
            linkPath = "/wo/work-order/" + refId;
        else if ("WP".equalsIgnoreCase(refEntity) || "WORK_PERMIT".equalsIgnoreCase(refEntity))
            linkPath = "/wp/work-permit/" + refId;

        if (!linkPath.isEmpty()) {
            html.append("<a href=\"").append(linkPath)
                    .append("\" style=\"display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;\">")
                    .append("시스템에서 원본 보기</a>");
        }

        html.append("</div>");
        html.append("</div>");

        return html.toString();
    }

    private String generateInspectionHtml(String companyId, String refId) {
        Inspection doc = transactionService.getInspectionById(companyId, refId).orElse(null);
        if (doc == null)
            return "<p>해당 점검 문서를 찾을 수 없습니다.</p>";

        StringBuilder sb = new StringBuilder();
        sb.append(
                "<h2 style=\"text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px;\">점검 계획/실적 보고서</h2>");
        sb.append("<table style=\"width: 100%; border-collapse: collapse; margin-top: 20px;\">");

        appendRow(sb, "문서번호", doc.getInspectionId(), "점검유형", doc.getCodeItem());
        appendRow(sb, "점검명", doc.getName(), "단계", doc.getStage());
        appendRow(sb, "대상설비", doc.getEquipmentId() != null ? doc.getEquipmentId() : "", "점검일자",
                doc.getDate() != null ? doc.getDate().toString() : "");

        sb.append("</table>");

        if (doc.getNote() != null && !doc.getNote().isEmpty()) {
            sb.append("<h3 style=\"margin-top: 20px;\">비고/특이사항</h3>");
            sb.append("<div style=\"padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd;\">")
                    .append(doc.getNote().replace("\n", "<br/>")).append("</div>");
        }

        return sb.toString();
    }

    private String generateWorkOrderHtml(String companyId, String refId) {
        WorkOrder doc = transactionService.getWorkOrderById(companyId, refId).orElse(null);
        if (doc == null)
            return "<p>해당 작업지시 문서를 찾을 수 없습니다.</p>";

        StringBuilder sb = new StringBuilder();
        sb.append(
                "<h2 style=\"text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px;\">작업 지시/결과서</h2>");
        sb.append("<table style=\"width: 100%; border-collapse: collapse; margin-top: 20px;\">");

        appendRow(sb, "지시번호", doc.getOrderId(), "작업유형", doc.getCodeItem());
        appendRow(sb, "작업명", doc.getName(), "단계", doc.getStage());
        appendRow(sb, "대상설비", doc.getEquipmentId() != null ? doc.getEquipmentId() : "", "작업일자",
                doc.getDate() != null ? doc.getDate().toString() : "");
        appendRow(sb, "예상/실적비용", doc.getCost() != null ? doc.getCost().toString() : "0", "예상/실적시간",
                doc.getTime() != null ? doc.getTime().toString() : "0");

        sb.append("</table>");

        if (doc.getNote() != null && !doc.getNote().isEmpty()) {
            sb.append("<h3 style=\"margin-top: 20px;\">요청 내역</h3>");
            sb.append("<div style=\"padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd;\">")
                    .append(doc.getNote().replace("\n", "<br/>")).append("</div>");
        }

        return sb.toString();
    }

    private String generateWorkPermitHtml(String companyId, String refId) {
        WorkPermit doc = transactionService.getWorkPermitById(companyId, refId).orElse(null);
        if (doc == null)
            return "<p>해당 작업허가 문서를 찾을 수 없습니다.</p>";

        StringBuilder sb = new StringBuilder();
        sb.append(
                "<h2 style=\"text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px;\">안전 작업 허가서</h2>");
        sb.append("<table style=\"width: 100%; border-collapse: collapse; margin-top: 20px;\">");

        appendRow(sb, "허가번호", doc.getPermitId(), "허가유형",
                doc.getWpTypes() != null ? String.join(", ", doc.getWpTypes()) : "");
        appendRow(sb, "작업명", doc.getName(), "단계", doc.getStage());
        appendRow(sb, "대상설비", doc.getEquipmentId() != null ? doc.getEquipmentId() : "", "신청일자",
                doc.getDate() != null ? doc.getDate().toString() : "");

        String start = doc.getStartDt() != null ? doc.getStartDt().toString() : "";
        String end = doc.getEndDt() != null ? doc.getEndDt().toString() : "";

        appendRow(sb, "작업시작", start, "작업종료", end);
        appendRow(sb, "작업장소", doc.getLocation() != null ? doc.getLocation() : "", "", "");

        sb.append("</table>");

        if (doc.getWorkSummary() != null && !doc.getWorkSummary().isEmpty()) {
            sb.append("<h3 style=\"margin-top: 20px;\">작업 내용</h3>");
            sb.append("<div style=\"padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd;\">")
                    .append(doc.getWorkSummary().replace("\n", "<br/>")).append("</div>");
        }

        if (doc.getHazardFactor() != null || doc.getSafetyFactor() != null) {
            sb.append("<h3 style=\"margin-top: 20px;\">위험성 및 안전대책</h3>");
            sb.append(
                    "<table style=\"width: 100%; border-collapse: collapse; border: 1px solid #ddd; margin-top: 10px;\">");
            sb.append(
                    "<tr><th style=\"width: 150px; padding: 10px; border: 1px solid #ddd; background-color: #f4f4f4;\">위험요인</th>");
            sb.append("<td style=\"padding: 10px; border: 1px solid #ddd;\">")
                    .append(doc.getHazardFactor() != null ? doc.getHazardFactor() : "").append("</td></tr>");
            sb.append(
                    "<tr><th style=\"width: 150px; padding: 10px; border: 1px solid #ddd; background-color: #f4f4f4;\">안전대책</th>");
            sb.append("<td style=\"padding: 10px; border: 1px solid #ddd;\">")
                    .append(doc.getSafetyFactor() != null ? doc.getSafetyFactor() : "").append("</td></tr>");
            sb.append("</table>");
        }

        return sb.toString();
    }

    private void appendRow(StringBuilder sb, String th1, String td1, String th2, String td2) {
        sb.append("<tr>");
        sb.append(
                "<th style=\"width: 15%; padding: 10px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: left;\">")
                .append(th1).append("</th>");
        sb.append("<td style=\"width: 35%; padding: 10px; border: 1px solid #ddd;\">").append(td1 != null ? td1 : "")
                .append("</td>");

        if (th2 != null && !th2.isEmpty()) {
            sb.append(
                    "<th style=\"width: 15%; padding: 10px; border: 1px solid #ddd; background-color: #f4f4f4; text-align: left;\">")
                    .append(th2).append("</th>");
            sb.append("<td style=\"width: 35%; padding: 10px; border: 1px solid #ddd;\">")
                    .append(td2 != null ? td2 : "").append("</td>");
        } else {
            sb.append("<td colspan=\"2\" style=\"border: 1px solid #ddd;\"></td>");
        }

        sb.append("</tr>");
    }
}
