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
public class StandardInfoIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CompanyRepository companyRepository;

    @Test
    void testStandardInfoFlow() throws Exception {
        // 1. Create Company (Already exists in data.sql usually, but let's create one
        // via Repo for test isolation if needed, or just query)
        // Since we are using H2 and likely have data.sql or empty, let's assume we need
        // to create one if the API allows,
        // OR we just use one that we insert directly via repository to bootstrap.
        // The Controller doesn't have createCompany, so we insert via Repository.
        Company company = new Company();
        company.setCompanyId("TEST_COMP");
        company.setName("Test Company");
        companyRepository.save(company);

        // 2. Create Plant
        Plant plant = new Plant();
        plant.setCompanyId("TEST_COMP");
        plant.setPlantId("PLANT_01");
        plant.setName("Test Plant");

        mockMvc.perform(post("/api/std/plants")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(plant)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plantId").value("PLANT_01"));

        // 3. Create Dept
        Dept dept = new Dept();
        dept.setCompanyId("TEST_COMP");
        dept.setDeptId("DEPT_01");
        dept.setName("Maintenance Dept");

        mockMvc.perform(post("/api/std/depts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dept)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deptId").value("DEPT_01"));

        // 4. Create Person
        Person person = new Person();
        person.setCompanyId("TEST_COMP");
        person.setPersonId("USER_01");
        person.setName("Test User");
        person.setDeptId("DEPT_01");

        mockMvc.perform(post("/api/std/persons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(person)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.personId").value("USER_01"));

        // 5. Create Code
        Code code = new Code();
        code.setCompanyId("TEST_COMP");
        code.setCodeId("EQ_TYPE");
        code.setName("Equipment Type");

        mockMvc.perform(post("/api/std/codes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(code)))
                .andExpect(status().isOk());

        // 6. Create CodeItem
        CodeItem codeItem = new CodeItem();
        codeItem.setCompanyId("TEST_COMP");
        codeItem.setCodeId("EQ_TYPE");
        codeItem.setItemId("PUMP");
        codeItem.setName("Pump");

        mockMvc.perform(post("/api/std/code-items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(codeItem)))
                .andExpect(status().isOk());

        // 7. Create Storage
        Storage storage = new Storage();
        storage.setCompanyId("TEST_COMP");
        storage.setStorageId("WH_01");
        storage.setName("Main Warehouse");
        // Storage entity does not have plantId in current domain

        mockMvc.perform(post("/api/std/storages")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(storage)))
                .andExpect(status().isOk());
    }
}
