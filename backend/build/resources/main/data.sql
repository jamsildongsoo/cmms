-- 1. Company
INSERT INTO company (company_id, name) VALUES ('1000', 'Test Company');

-- 2. Plant
INSERT INTO plant (company_id, plant_id, name) VALUES ('1000', 'P0001', 'Seoul Plant');
INSERT INTO plant (company_id, plant_id, name) VALUES ('1000', 'P0002', 'Gyeonggi Plant');
INSERT INTO plant (company_id, plant_id, name) VALUES ('1000', 'P0003', 'Gwangju Plant');

-- 3. Dept
INSERT INTO dept (company_id, dept_id, name, parent_id) VALUES ('1000', 'D0000', 'CEO Office', NULL);
INSERT INTO dept (company_id, dept_id, name, parent_id) VALUES ('1000', 'D1001', 'Management Team', 'D0000');
INSERT INTO dept (company_id, dept_id, name, parent_id) VALUES ('1000', 'D2001', 'Operations Team', 'D0000');
INSERT INTO dept (company_id, dept_id, name, parent_id) VALUES ('1000', 'M1001', 'Maintenance Team', 'D2001');

-- 4. Storage / Bin / Location
INSERT INTO storage (company_id, storage_id, name) VALUES ('1000', 'S0001', 'Main Storage (Seoul)');
INSERT INTO storage (company_id, storage_id, name) VALUES ('1000', 'S0002', 'Sub Storage (Gyeonggi)');

INSERT INTO bin (company_id, bin_id, name, storage_id) VALUES ('1000', 'B0001', 'Rack A', 'S0001');
INSERT INTO bin (company_id, bin_id, name, storage_id) VALUES ('1000', 'B0002', 'Rack B', 'S0002');

INSERT INTO location (company_id, location_id, name, storage_id, bin_id) VALUES ('1000', 'L0001', 'Shelf 1', 'S0001', 'B0001');
INSERT INTO location (company_id, location_id, name, storage_id, bin_id) VALUES ('1000', 'L0002', 'Shelf 2', 'S0002', 'B0002');

-- 5. Person
-- BCrypt hashed password for '1234' is '$2a$10$7yC0urP.xRDm1rJLps/DaOKh5xll1RmZ2.Fbd6voR5.LYSr4EveaC'
INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position) 
VALUES ('1000', 'admin', 'Admin User', 'D0000', 'ADMIN', '$2a$10$7yC0urP.xRDm1rJLps/DaOKh5xll1RmZ2.Fbd6voR5.LYSr4EveaC', 'admin@test.com', 'Manager');

INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position) 
VALUES ('1000', 'user1', 'Manager User', 'D1001', 'USER', '$2a$10$7yC0urP.xRDm1rJLps/DaOKh5xll1RmZ2.Fbd6voR5.LYSr4EveaC', 'user1@test.com', 'Staff');

INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position) 
VALUES ('1000', 'user2', 'Operator User', 'D2001', 'USER', '$2a$10$7yC0urP.xRDm1rJLps/DaOKh5xll1RmZ2.Fbd6voR5.LYSr4EveaC', 'user2@test.com', 'Engineer');

INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position) 
VALUES ('1000', 'user3', 'Maintenance User', 'M1001', 'USER', '$2a$10$7yC0urP.xRDm1rJLps/DaOKh5xll1RmZ2.Fbd6voR5.LYSr4EveaC', 'user3@test.com', 'Technician');


-- 6. Common Code (Code & CodeItem)

-- [EQ_TYPE] Equipment Type
INSERT INTO code (company_id, code_id, name) VALUES ('1000', 'EQ_TYPE', 'Equipment Type');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'MECH', 'Mechanical');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'ELEC', 'Electrical');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'INST', 'Instrument');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'UTIL', 'Utility');

-- [MAT_TYPE] Material Type (Inventory)
INSERT INTO code (company_id, code_id, name) VALUES ('1000', 'MAT_TYPE', 'Material Type');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'MAT_TYPE', 'SPARE', 'Spare Parts');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'MAT_TYPE', 'CONS', 'Consumables');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'MAT_TYPE', 'TOOL', 'Tools');

-- [INSP_TYPE] Inspection Type
INSERT INTO code (company_id, code_id, name) VALUES ('1000', 'INSP_TYPE', 'Inspection Type');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'INSP_TYPE', 'PATROL', 'Patrol Inspection');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'INSP_TYPE', 'MEASURE', 'Measurement');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'INSP_TYPE', 'PM', 'Preventive Maintenance');

-- [WO_TYPE] Work Order Type
INSERT INTO code (company_id, code_id, name) VALUES ('1000', 'WO_TYPE', 'Work Order Type');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'BM', 'Breakdown Maint');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'PM', 'Preventive Maint');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'CM', 'Corrective Maint');
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'EM', 'Emergency');
