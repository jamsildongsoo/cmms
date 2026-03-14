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
import org.springframework.security.test.context.support.WithMockUser;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser(username = "TEST_COMP:testuser", roles = { "USER" })
public class MasterDataIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CompanyRepository companyRepository;

    @BeforeEach
    void setup() {
        // Bootstrap Company
        if (!companyRepository.existsById("TEST_COMP")) {
            Company company = new Company();
            company.setCompanyId("TEST_COMP");
            company.setName("Test Company");
            companyRepository.save(company);
        }
    }

    @Test
    void testMasterDataFlow() throws Exception {
        // 1. Create Equipment
        Equipment equipment = new Equipment();
        equipment.setCompanyId("TEST_COMP");
        // equipment.setEquipmentId("EQ_001");
        equipment.setName("Hydraulic Pump A");
        equipment.setPlantId("PLANT_01");

        mockMvc.perform(post("/api/master/equipment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(equipment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.equipmentId").exists());

        // 2. Create Inventory (Spare Part)
        Inventory inventory = new Inventory();
        inventory.setCompanyId("TEST_COMP");
        // inventory.setInventoryId("PART_001");
        inventory.setName("O-Ring Seal");
        inventory.setSpec("10mm");

        mockMvc.perform(post("/api/master/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inventory)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inventoryId").exists());
    }
}
