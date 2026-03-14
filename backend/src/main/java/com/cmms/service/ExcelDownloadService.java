package com.cmms.service;

import com.cmms.domain.Equipment;
import com.cmms.domain.Inventory;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelDownloadService {

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public byte[] downloadEquipment(List<Equipment> list) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("설비 목록");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            // Headers
            String[] headers = {"설비번호", "설비명", "상태", "설비유형", "설치위치", "제조사", "모델", "시리얼", "설치일자", "QR 데이터"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowIdx = 1;
            for (Equipment eq : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(eq.getEquipmentId());
                row.createCell(1).setCellValue(eq.getName());
                row.createCell(2).setCellValue(eq.getStatus() != null ? eq.getStatus().getLabel() : "");
                row.createCell(3).setCellValue(eq.getCodeItem());
                row.createCell(4).setCellValue(eq.getInstallLocation());
                row.createCell(5).setCellValue(eq.getMakerName());
                row.createCell(6).setCellValue(eq.getModel());
                row.createCell(7).setCellValue(eq.getSerial());
                row.createCell(8).setCellValue(eq.getInstallDate() != null ? eq.getInstallDate().toString() : "");
                row.createCell(9).setCellValue(frontendBaseUrl + "/qr/equipment/" + eq.getEquipmentId());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] equipmentTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("설비 업로드");

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            String[] headers = {"설비명(*)", "플랜트(*)", "설치위치", "설비유형", "부서", "제조사", "모델", "시리얼", "설치일자"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 4000);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] inventoryTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("자재 업로드");

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            String[] headers = {"자재명(*)", "자재유형", "부서", "단위", "제조사", "규격", "모델"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 4000);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] downloadInventory(List<Inventory> list) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("자재 목록");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            // Headers
            String[] headers = {"자재코드", "자재명", "상태", "자재유형", "단위", "규격", "제조사", "모델"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowIdx = 1;
            for (Inventory inv : list) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(inv.getInventoryId());
                row.createCell(1).setCellValue(inv.getName());
                row.createCell(2).setCellValue(inv.getStatus() != null ? inv.getStatus().getLabel() : "");
                row.createCell(3).setCellValue(inv.getCodeItem());
                row.createCell(4).setCellValue(inv.getUnit());
                row.createCell(5).setCellValue(inv.getSpec());
                row.createCell(6).setCellValue(inv.getMakerName());
                row.createCell(7).setCellValue(inv.getModel());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
