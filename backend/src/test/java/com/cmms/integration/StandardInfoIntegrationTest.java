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

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser(username = "TEST_COMP:testuser", roles = { "USER" })
public class StandardInfoIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private CompanyRepository companyRepository;

        @Test
        void testStandardInfoFlow() throws Exception {
                Company company = new Company();
                company.setCompanyId("TEST_COMP");
                company.setName("Test Company");
                companyRepository.save(company);

                // 2. Create Plant
                Plant plant = new Plant();
                plant.setCompanyId("TEST_COMP");
                // plant.setPlantId("PLANT_01"); // Let Service generate ID
                plant.setName("Test Plant");

                mockMvc.perform(post("/api/std/plants")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(plant)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.plantId").exists());

                // 3. Create Dept
                Dept dept = new Dept();
                dept.setCompanyId("TEST_COMP");
                // dept.setDeptId("DEPT_01");
                dept.setName("Maintenance Dept");

                mockMvc.perform(post("/api/std/depts")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dept)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.deptId").exists());

                // 4. Create Person
                Person person = new Person();
                person.setCompanyId("TEST_COMP");
                // person.setPersonId("USER_01");
                person.setName("Test User");
                person.setDeptId("DEPT_01");

                mockMvc.perform(post("/api/std/persons")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(person)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.personId").exists());

                // 5. Create Code
                Code code = new Code();
                code.setCompanyId("TEST_COMP");
                // code.setCodeId("EQ_TYPE");
                code.setName("Equipment Type");

                String codeRes = mockMvc.perform(post("/api/std/codes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(code)))
                                .andExpect(status().isOk())
                                .andReturn().getResponse().getContentAsString();
                
                String codeId = objectMapper.readTree(codeRes).get("codeId").asText();

                // 6. Create CodeItem
                CodeItem codeItem = new CodeItem();
                codeItem.setCompanyId("TEST_COMP");
                codeItem.setCodeId(codeId);
                codeItem.setItemId("PUMP");
                codeItem.setName("Pump");

                mockMvc.perform(post("/api/std/codes/TEST_COMP/" + codeId + "/items")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(codeItem)))
                                .andExpect(status().isOk());

                // 7. Create Storage
                Storage storage = new Storage();
                storage.setCompanyId("TEST_COMP");
                // storage.setStorageId("WH_01");
                storage.setName("Main Warehouse");

                mockMvc.perform(post("/api/std/storages")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(storage)))
                                .andExpect(status().isOk());
        }
}
