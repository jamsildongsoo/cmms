package com.cmms.integration;

import com.cmms.domain.*;
import com.cmms.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class TransactionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CompanyRepository companyRepository;

    @BeforeEach
    void setup() {
        if (!companyRepository.existsById("TEST_COMP")) {
            Company company = new Company();
            company.setCompanyId("TEST_COMP");
            company.setName("Test Company");
            companyRepository.save(company);
        }
    }

    @Test
    void testTransactionFlow() throws Exception {
        // 1. Create Inspection
        Inspection inspection = new Inspection();
        inspection.setCompanyId("TEST_COMP");
        inspection.setInspectionId("INS_001");
        inspection.setName("Monthly Pump Check");
        inspection.setDate(LocalDate.now());

        mockMvc.perform(post("/api/tx/inspections")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inspection)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inspectionId").value("INS_001"));

        // 2. Create Inspection Item
        InspectionItem inspectionItem = new InspectionItem();
        inspectionItem.setCompanyId("TEST_COMP");
        inspectionItem.setInspectionId("INS_001");
        inspectionItem.setLineNo(1);
        inspectionItem.setName("Check Oil Level");

        mockMvc.perform(post("/api/tx/inspection-items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inspectionItem)))
                .andExpect(status().isOk());

        // 3. Create WorkOrder
        WorkOrder workOrder = new WorkOrder();
        workOrder.setCompanyId("TEST_COMP");
        workOrder.setOrderId("WO_001");
        workOrder.setName("Fix Leak");
        // workOrder.setType("BREAKDOWN"); // Type field not in WorkOrder entity

        mockMvc.perform(post("/api/tx/work-orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workOrder)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value("WO_001"));

        // 4. Create WorkOrder Item
        WorkOrderItem workOrderItem = new WorkOrderItem();
        workOrderItem.setCompanyId("TEST_COMP");
        workOrderItem.setOrderId("WO_001");
        workOrderItem.setLineNo(1);
        workOrderItem.setName("Replace Seal");

        mockMvc.perform(post("/api/tx/work-order-items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workOrderItem)))
                .andExpect(status().isOk());
    }

    @Test
    void testMemoFlow() throws Exception {
        Memo memo = new Memo();
        memo.setCompanyId("TEST_COMP");
        memo.setMemoId("MEMO_01");
        memo.setTitle("Shutdown Notice");
        memo.setContent("System maintenance on Sunday.");

        mockMvc.perform(post("/api/sys/memos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(memo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Shutdown Notice"));
    }
}
