package com.cmms.integration;

import com.cmms.domain.*;
import com.cmms.repository.*;
import com.cmms.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser(username = "TEST_COMP:testuser", roles = { "USER" })
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
        // inspection.setInspectionId("INS_001"); // Let Service generate ID
        inspection.setName("Monthly Pump Check");
        inspection.setDate(LocalDate.now());

        InspectionRequest insReq = new InspectionRequest();
        insReq.setInspection(inspection);

        mockMvc.perform(post("/api/tx/inspections")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(insReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inspectionId").exists());

        // 2. WorkOrder
        WorkOrder workOrder = new WorkOrder();
        workOrder.setCompanyId("TEST_COMP");
        // workOrder.setOrderId("WO_001"); // Let Service generate ID
        workOrder.setName("Fix Leak");

        WorkOrderRequest woReq = new WorkOrderRequest();
        woReq.setWorkOrder(workOrder);

        mockMvc.perform(post("/api/tx/work-orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(woReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").exists());
    }

    @Test
    void testMemoFlow() throws Exception {
        Memo memo = new Memo();
        memo.setCompanyId("TEST_COMP");
        // memo.setMemoId("MEMO_01"); // Let Service generate ID
        memo.setTitle("Shutdown Notice");
        memo.setContent("System maintenance on Sunday.");

        mockMvc.perform(post("/api/memo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(memo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Shutdown Notice"));
    }
}
