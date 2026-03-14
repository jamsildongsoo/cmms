package com.cmms.service;

import com.cmms.common.domain.CommonStatus;
import com.cmms.domain.*;
import com.cmms.dto.ExcelUploadResult;
import com.cmms.repository.EquipmentRepository;
import com.cmms.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelUploadService {

    private final EquipmentRepository equipmentRepository;
    private final InventoryRepository inventoryRepository;
    private final SystemService systemService;
    private static final int MAX_ROWS = 5000;
    private static final List<String> ALLOWED_EXCEL_TYPES = List.of(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
    );

    /**
     * Equipment 검증만 (저장 안 함)
     */
    public ExcelUploadResult validateEquipment(String companyId, MultipartFile file) throws Exception {
        return processEquipment(companyId, file, false);
    }

    /**
     * Equipment 검증 + 저장 (all-or-nothing)
     */
    @Transactional
    public ExcelUploadResult uploadEquipment(String companyId, MultipartFile file) throws Exception {
        return processEquipment(companyId, file, true);
    }

    private ExcelUploadResult processEquipment(String companyId, MultipartFile file, boolean save) throws Exception {
        validateExcelFile(file);
        ExcelUploadResult result = new ExcelUploadResult();
        List<Equipment> validList = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            if (sheet.getLastRowNum() > MAX_ROWS) {
                throw new IllegalArgumentException("한 번에 최대 " + MAX_ROWS + "행까지만 업로드 가능합니다.");
            }

            Iterator<Row> rows = sheet.iterator();
            if (rows.hasNext()) rows.next(); // Skip header

            int rowNum = 1;
            while (rows.hasNext()) {
                rowNum++;
                Row row = rows.next();
                result.setTotalRows(result.getTotalRows() + 1);

                try {
                    String name = getCellValue(row.getCell(0));
                    String plantId = getCellValue(row.getCell(1));

                    if (name.isEmpty() || plantId.isEmpty()) {
                        result.addError(rowNum, name, "필수 항목(설비명, 플랜트) 누락");
                        continue;
                    }

                    Equipment eq = new Equipment();
                    eq.setCompanyId(companyId);
                    eq.setName(name);
                    eq.setPlantId(plantId);
                    eq.setInstallLocation(getCellValue(row.getCell(2)));
                    eq.setCodeItem(getCellValue(row.getCell(3)));
                    eq.setDeptId(getCellValue(row.getCell(4)));
                    eq.setMakerName(getCellValue(row.getCell(5)));
                    eq.setModel(getCellValue(row.getCell(6)));
                    eq.setSerial(getCellValue(row.getCell(7)));

                    Cell dateCell = row.getCell(8);
                    if (dateCell != null && dateCell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(dateCell)) {
                        eq.setInstallDate(dateCell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
                    }

                    eq.setStatus(CommonStatus.CONFIRMED);
                    validList.add(eq);
                    result.incrementSuccess();
                } catch (Exception e) {
                    result.addError(rowNum, "Unknown", e.getMessage());
                }
            }
        }

        if (save) {
            if (result.getFailureCount() > 0) {
                throw new IllegalArgumentException("검증 실패 " + result.getFailureCount() + "건이 있어 저장할 수 없습니다.");
            }
            for (Equipment eq : validList) {
                eq.setEquipmentId(systemService.generateId(companyId, "EQUIPMENT", "GLOBAL"));
                equipmentRepository.save(eq);
            }
        }

        return result;
    }

    /**
     * Inventory 검증만 (저장 안 함)
     */
    public ExcelUploadResult validateInventory(String companyId, MultipartFile file) throws Exception {
        return processInventory(companyId, file, false);
    }

    /**
     * Inventory 검증 + 저장 (all-or-nothing)
     */
    @Transactional
    public ExcelUploadResult uploadInventory(String companyId, MultipartFile file) throws Exception {
        return processInventory(companyId, file, true);
    }

    private ExcelUploadResult processInventory(String companyId, MultipartFile file, boolean save) throws Exception {
        validateExcelFile(file);
        ExcelUploadResult result = new ExcelUploadResult();
        List<Inventory> validList = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            if (sheet.getLastRowNum() > MAX_ROWS) {
                throw new IllegalArgumentException("한 번에 최대 " + MAX_ROWS + "행까지만 업로드 가능합니다.");
            }

            Iterator<Row> rows = sheet.iterator();
            if (rows.hasNext()) rows.next(); // Skip header

            int rowNum = 1;
            while (rows.hasNext()) {
                rowNum++;
                Row row = rows.next();
                result.setTotalRows(result.getTotalRows() + 1);

                try {
                    String name = getCellValue(row.getCell(0));

                    if (name.isEmpty()) {
                        result.addError(rowNum, "", "필수 항목(자재명) 누락");
                        continue;
                    }

                    Inventory inv = new Inventory();
                    inv.setCompanyId(companyId);
                    inv.setName(name);
                    inv.setCodeItem(getCellValue(row.getCell(1)));
                    inv.setDeptId(getCellValue(row.getCell(2)));
                    inv.setUnit(getCellValue(row.getCell(3)));
                    inv.setMakerName(getCellValue(row.getCell(4)));
                    inv.setSpec(getCellValue(row.getCell(5)));
                    inv.setModel(getCellValue(row.getCell(6)));

                    inv.setStatus(CommonStatus.CONFIRMED);
                    validList.add(inv);
                    result.incrementSuccess();
                } catch (Exception e) {
                    result.addError(rowNum, "Unknown", e.getMessage());
                }
            }
        }

        if (save) {
            if (result.getFailureCount() > 0) {
                throw new IllegalArgumentException("검증 실패 " + result.getFailureCount() + "건이 있어 저장할 수 없습니다.");
            }
            for (Inventory inv : validList) {
                inv.setInventoryId(systemService.generateId(companyId, "INVENTORY", "GLOBAL"));
                inventoryRepository.save(inv);
            }
        }

        return result;
    }

    private void validateExcelFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드 파일이 비어 있습니다.");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !(originalFilename.endsWith(".xlsx") || originalFilename.endsWith(".xls"))) {
            throw new IllegalArgumentException("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
        }
        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_EXCEL_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다: " + contentType);
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                return String.valueOf((long)cell.getNumericCellValue());
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default: return "";
        }
    }
}
