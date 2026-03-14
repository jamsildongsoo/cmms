-- 1. Company
INSERT INTO company (company_id, name, delete_mark) VALUES ('1000', '테스트 회사', 'N') ON CONFLICT (company_id) DO NOTHING;

-- 2. Plant
INSERT INTO plant (company_id, plant_id, name, delete_mark) VALUES ('1000', 'P0001', '서울 공장', 'N') ON CONFLICT (company_id, plant_id) DO NOTHING;
INSERT INTO plant (company_id, plant_id, name, delete_mark) VALUES ('1000', 'P0002', '경기 공장', 'N') ON CONFLICT (company_id, plant_id) DO NOTHING;
INSERT INTO plant (company_id, plant_id, name, delete_mark) VALUES ('1000', 'P0003', '광주 공장', 'N') ON CONFLICT (company_id, plant_id) DO NOTHING;

-- 3. Dept
INSERT INTO dept (company_id, dept_id, name, parent_id, delete_mark) VALUES ('1000', 'D0000', '대표이사', NULL, 'N') ON CONFLICT (company_id, dept_id) DO NOTHING;
INSERT INTO dept (company_id, dept_id, name, parent_id, delete_mark) VALUES ('1000', 'D1001', '경영지원팀', 'D0000', 'N') ON CONFLICT (company_id, dept_id) DO NOTHING;
INSERT INTO dept (company_id, dept_id, name, parent_id, delete_mark) VALUES ('1000', 'D2001', '발전운영팀', 'D0000', 'N') ON CONFLICT (company_id, dept_id) DO NOTHING;
INSERT INTO dept (company_id, dept_id, name, parent_id, delete_mark) VALUES ('1000', 'M1001', '설비관리팀', 'D2001', 'N') ON CONFLICT (company_id, dept_id) DO NOTHING;

-- 4. Storage / Bin / Location
INSERT INTO storage (company_id, storage_id, name, delete_mark) VALUES ('1000', 'S0001', '서울 창고', 'N') ON CONFLICT (company_id, storage_id) DO NOTHING;
INSERT INTO storage (company_id, storage_id, name, delete_mark) VALUES ('1000', 'S0002', '경기 창고', 'N') ON CONFLICT (company_id, storage_id) DO NOTHING;

INSERT INTO bin (company_id, bin_id, name, storage_id) VALUES ('1000', 'B0001', '랙 A', 'S0001') ON CONFLICT (company_id, bin_id) DO NOTHING;
INSERT INTO bin (company_id, bin_id, name, storage_id) VALUES ('1000', 'B0002', '랙 B', 'S0002') ON CONFLICT (company_id, bin_id) DO NOTHING;

INSERT INTO location (company_id, location_id, name, storage_id, bin_id) VALUES ('1000', 'L0001', '선반 1', 'S0001', 'B0001') ON CONFLICT (company_id, location_id) DO NOTHING;
INSERT INTO location (company_id, location_id, name, storage_id, bin_id) VALUES ('1000', 'L0002', '선반 2', 'S0002', 'B0002') ON CONFLICT (company_id, location_id) DO NOTHING;

-- 5. Role
INSERT INTO role (company_id, role_id, name, note, delete_mark) VALUES ('1000', 'SYSTEM', '시스템 관리자', '전체 시스템 접근 권한', 'N') ON CONFLICT (company_id, role_id) DO NOTHING;
INSERT INTO role (company_id, role_id, name, note, delete_mark) VALUES ('1000', 'ADMIN', '관리자', '회사 관리자 권한', 'N') ON CONFLICT (company_id, role_id) DO NOTHING;
INSERT INTO role (company_id, role_id, name, note, delete_mark) VALUES ('1000', 'MANAGER', '매니저', '매니저 권한', 'N') ON CONFLICT (company_id, role_id) DO NOTHING;
INSERT INTO role (company_id, role_id, name, note, delete_mark) VALUES ('1000', 'USER', '일반 사용자', '일반 사용자 권한', 'N') ON CONFLICT (company_id, role_id) DO NOTHING;

-- 6. Person
-- BCrypt hashed password for '12345678' is '$2b$10$096phPw9qzLYD72PVkSAwu7gT.D57L1hy6HbEFjhMuuUKUN4rlBVG'
INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position, delete_mark) 
VALUES ('1000', 'admin', '최고관리자', 'D0000', 'ADMIN', '$2b$10$096phPw9qzLYD72PVkSAwu7gT.D57L1hy6HbEFjhMuuUKUN4rlBVG', 'admin@test.com', 'Manager', 'N') ON CONFLICT (company_id, person_id) DO NOTHING;

INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position, delete_mark) 
VALUES ('1000', 'user1', '책임자', 'D1001', 'USER', '$2b$10$096phPw9qzLYD72PVkSAwu7gT.D57L1hy6HbEFjhMuuUKUN4rlBVG', 'user1@test.com', 'Staff', 'N') ON CONFLICT (company_id, person_id) DO NOTHING;

INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position, delete_mark) 
VALUES ('1000', 'user2', '운영자', 'D2001', 'USER', '$2b$10$096phPw9qzLYD72PVkSAwu7gT.D57L1hy6HbEFjhMuuUKUN4rlBVG', 'user2@test.com', 'Engineer', 'N') ON CONFLICT (company_id, person_id) DO NOTHING;

INSERT INTO person (company_id, person_id, name, dept_id, role_id, password_hash, email, position, delete_mark) 
VALUES ('1000', 'user3', '설비관리자', 'M1001', 'USER', '$2b$10$096phPw9qzLYD72PVkSAwu7gT.D57L1hy6HbEFjhMuuUKUN4rlBVG', 'user3@test.com', 'Technician', 'N') ON CONFLICT (company_id, person_id) DO NOTHING;


-- 6. Common Code (Code & CodeItem)

-- [EQ_TYPE] Equipment Type
INSERT INTO code (company_id, code_id, name, delete_mark) VALUES ('1000', 'EQ_TYPE', '설비 유형', 'N') ON CONFLICT (company_id, code_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'MECH', '기계') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'ELEC', '전기') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'INST', '계측') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'EQ_TYPE', 'UTIL', '유틸리티') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;

-- [MAT_TYPE] Material Type (Inventory)
INSERT INTO code (company_id, code_id, name, delete_mark) VALUES ('1000', 'MAT_TYPE', '자재 유형', 'N') ON CONFLICT (company_id, code_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'MAT_TYPE', 'SPARE', '예비품') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'MAT_TYPE', 'CONS', '소모품') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'MAT_TYPE', 'TOOL', '공구') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;

-- [INSP_TYPE] Inspection Type
INSERT INTO code (company_id, code_id, name, delete_mark) VALUES ('1000', 'INSP_TYPE', '점검 유형', 'N') ON CONFLICT (company_id, code_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'INSP_TYPE', 'PATROL', '순회점검') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'INSP_TYPE', 'MEASURE', '측정점검') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'INSP_TYPE', 'PM', '예방점검') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;

-- [WO_TYPE] Work Order Type
INSERT INTO code (company_id, code_id, name, delete_mark) VALUES ('1000', 'WO_TYPE', '작업 유형', 'N') ON CONFLICT (company_id, code_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'BM', '고장보전') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'PM', '예방보전') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'CM', '수정보전') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
INSERT INTO code_item (company_id, code_id, item_id, name) VALUES ('1000', 'WO_TYPE', 'EM', '긴급보전') ON CONFLICT (company_id, code_id, item_id) DO NOTHING;
