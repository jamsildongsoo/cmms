-- 1. Company
INSERT INTO company (company_id, name, delete_mark) VALUES ('1000', 'Test Company', 'N') ON CONFLICT (company_id) DO NOTHING;

-- 2. Plant
INSERT INTO plant (company_id, plant_id, name, delete_mark) VALUES ('1000', 'P0001', 'Seoul Plant', 'N') ON CONFLICT (company_id, plant_id) DO NOTHING;
INSERT INTO plant (company_id, plant_id, name, delete_mark) VALUES ('1000', 'P0002', 'Gyeonggi Plant', 'N') ON CONFLICT (company_id, plant_id) DO NOTHING;
INSERT INTO plant (company_id, plant_id, name, delete_mark) VALUES ('1000', 'P0003', 'Gwangju Plant', 'N') ON CONFLICT (company_id, plant_id) DO NOTHING;

-- 3. Dept
INSERT INTO dept (company_id, dept_id, name, parent_id, delete_mark) VALUES ('1000', 'D0000', 'CEO Office', NULL, 'N') ON CONFLICT (company_id, dept_id) DO NOTHING;
INSERT INTO dept (company_id, dept_id, name, parent_id, delete_mark) VALUES ('1000', 'D1001', 'Management Team', 'D0000', 'N') ON CONFLICT (company_id, dept_id) DO NOTHING;
INSERT INTO dept (company_id, dept_id, name, parent_id, delete_mark) VALUES ('1000', 'D2001', 'Operations Team', 'D0000', 'N') ON CONFLICT (company_id, dept_id) DO NOTHING;
INSERT INTO dept (company_id, dept_id, name, parent_id, delete_mark) VALUES ('1000', 'M1001', 'Maintenance Team', 'D2001', 'N') ON CONFLICT (company_id, dept_id) DO NOTHING;

-- 4. Storage / Bin / Location
INSERT INTO storage (company_id, storage_id, name, delete_mark) VALUES ('1000', 'S0001', 'Main Storage (Seoul)', 'N') ON CONFLICT (company_id, storage_id) DO NOTHING;
INSERT INTO storage (company_id, storage_id, name, delete_mark) VALUES ('1000', 'S0002', 'Sub Storage (Gyeonggi)', 'N') ON CONFLICT (company_id, storage_id) DO NOTHING;

INSERT INTO bin (company_id, bin_id, name, storage_id) VALUES ('1000', 'B0001', 'Rack A', 'S0001') ON CONFLICT (company_id, bin_id) DO NOTHING;
INSERT INTO bin (company_id, bin_id, name, storage_id) VALUES ('1000', 'B0002', 'Rack B', 'S0002') ON CONFLICT (company_id, bin_id) DO NOTHING;

INSERT INTO location (company_id, location_id, name, storage_id, bin_id) VALUES ('1000', 'L0001', 'Shelf 1', 'S0001', 'B0001') ON CONFLICT (company_id, location_id) DO NOTHING;
INSERT INTO location (company_id, location_id, name, storage_id, bin_id) VALUES ('1000', 'L0002', 'Shelf 2', 'S0002', 'B0002') ON CONFLICT (company_id, location_id) DO NOTHING;

-- 5. Role
INSERT INTO role (company_id, role_id, name, note, delete_mark) VALUES ('1000', 'SYSTEM', 'System Administrator', 'Full system access', 'N') ON CONFLICT (company_id, role_id) DO NOTHING;
INSERT INTO role (company_id, role_id, name, note, delete_mark) VALUES ('1000', 'ADMIN', 'Administrator', 'Company admin access', 'N') ON CONFLICT (company_id, role_id) DO NOTHING;
INSERT INTO role (company_id, role_id, name, note, delete_mark) VALUES ('1000', 'MANAGER', 'Manager', 'Manager access', 'N') ON CONFLICT (company_id, role_id) DO NOTHING;
INSERT INTO role (company_id, role_id, name, note, delete_mark) VALUES ('1000', 'USER', 'General User', 'Standard access', 'N') ON CONFLICT (company_id, role_id) DO NOTHING;

-- 6. Person
-- BCrypt hashed password for '1234' is '$2a$10$7yC0urP.xRDm1rJLps/DaOKh5xll1RmZ2.Fbd6voR5.LYSr4EveaC'
INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position, delete_mark) 
VALUES ('1000', 'admin', 'Admin User', 'D0000', 'ADMIN', '$2a$10$7yC0urP.xRDm1rJLps/DaOKh5xll1RmZ2.Fbd6voR5.LYSr4EveaC', 'admin@test.com', 'Manager', 'N') ON CONFLICT (company_id, person_id) DO NOTHING;

INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position, delete_mark) 
VALUES ('1000', 'user1', 'Manager User', 'D1001', 'USER', '$2a$10$7yC0urP.xRDm1rJLps/DaOKh5xll1RmZ2.Fbd6voR5.LYSr4EveaC', 'user1@test.com', 'Staff', 'N') ON CONFLICT (company_id, person_id) DO NOTHING;

INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position, delete_mark) 
VALUES ('1000', 'user2', 'Operator User', 'D2001', 'USER', '$2a$10$7yC0urP.xRDm1rJLps/DaOKh5xll1RmZ2.Fbd6voR5.LYSr4EveaC', 'user2@test.com', 'Engineer', 'N') ON CONFLICT (company_id, person_id) DO NOTHING;

INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position, delete_mark) 
VALUES ('1000', 'user3', 'Maintenance User', 'M1001', 'USER', '$2a$10$7yC0urP.xRDm1rJLps/DaOKh5xll1RmZ2.Fbd6voR5.LYSr4EveaC', 'user3@test.com', 'Technician', 'N') ON CONFLICT (company_id, person_id) DO NOTHING;


-- 6. Common Code (Code & CodeItem)

-- [EQ_TYPE] Equipment Type
INSERT INTO code (company_id, code_id, name, delete_mark) VALUES ('1000', 'EQ_TYPE', 'Equipment Type', 'N') ON CONFLICT (company_id, code_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'MECH', 'Mechanical') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'ELEC', 'Electrical') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'INST', 'Instrument') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'UTIL', 'Utility') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;

-- [MAT_TYPE] Material Type (Inventory)
INSERT INTO code (company_id, code_id, name, delete_mark) VALUES ('1000', 'MAT_TYPE', 'Material Type', 'N') ON CONFLICT (company_id, code_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'MAT_TYPE', 'SPARE', 'Spare Parts') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'MAT_TYPE', 'CONS', 'Consumables') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'MAT_TYPE', 'TOOL', 'Tools') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;

-- [INSP_TYPE] Inspection Type
INSERT INTO code (company_id, code_id, name, delete_mark) VALUES ('1000', 'INSP_TYPE', 'Inspection Type', 'N') ON CONFLICT (company_id, code_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'INSP_TYPE', 'PATROL', 'Patrol Inspection') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'INSP_TYPE', 'MEASURE', 'Measurement') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'INSP_TYPE', 'PM', 'Preventive Maintenance') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;

-- [WO_TYPE] Work Order Type
INSERT INTO code (company_id, code_id, name, delete_mark) VALUES ('1000', 'WO_TYPE', 'Work Order Type', 'N') ON CONFLICT (company_id, code_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'BM', 'Breakdown Maint') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'PM', 'Preventive Maint') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'CM', 'Corrective Maint') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'EM', 'Emergency') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
