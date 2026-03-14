-- 1. 기준 정보 (Standard Information)

CREATE TABLE IF NOT EXISTS company (
    company_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    bizno VARCHAR(20),
    email VARCHAR(100),
    phone VARCHAR(20),
    delete_mark CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_company PRIMARY KEY (company_id)
);

CREATE TABLE IF NOT EXISTS plant (
    company_id VARCHAR(20) NOT NULL,
    plant_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    delete_mark CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_plant PRIMARY KEY (company_id, plant_id)
);

CREATE TABLE IF NOT EXISTS dept (
    company_id VARCHAR(20) NOT NULL,
    dept_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_id VARCHAR(20),
    delete_mark CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_dept PRIMARY KEY (company_id, dept_id)
);

CREATE TABLE IF NOT EXISTS role (
    company_id VARCHAR(20) NOT NULL,
    role_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    note TEXT,
    delete_mark CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_role PRIMARY KEY (company_id, role_id)
);

CREATE TABLE IF NOT EXISTS person (
    company_id VARCHAR(20) NOT NULL,
    person_id VARCHAR(20) NOT NULL,
    role_id VARCHAR(20),
    name VARCHAR(100) NOT NULL,
    dept_id VARCHAR(20),
    password_hash VARCHAR(255),
    email VARCHAR(100),
    phone VARCHAR(20),
    position VARCHAR(50),
    title VARCHAR(50),
    note TEXT,
    delete_mark CHAR(1) DEFAULT 'N',
    last_login_ip VARCHAR(50),
    last_login_at TIMESTAMP,
    last_login_plant_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_person PRIMARY KEY (company_id, person_id)
);

CREATE TABLE IF NOT EXISTS storage (
    company_id VARCHAR(20) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    delete_mark CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_storage PRIMARY KEY (company_id, storage_id)
);

CREATE TABLE IF NOT EXISTS bin (
    company_id VARCHAR(20) NOT NULL,
    bin_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    delete_mark CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_bin PRIMARY KEY (company_id, bin_id)
);

CREATE TABLE IF NOT EXISTS location (
    company_id VARCHAR(20) NOT NULL,
    location_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    bin_id VARCHAR(20) NOT NULL,
    delete_mark CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_location PRIMARY KEY (company_id, location_id)
);

CREATE TABLE IF NOT EXISTS code (
    company_id VARCHAR(20) NOT NULL,
    code_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    delete_mark CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_code PRIMARY KEY (company_id, code_id)
);

CREATE TABLE IF NOT EXISTS code_item (
    company_id VARCHAR(20) NOT NULL,
    code_id VARCHAR(20) NOT NULL,
    item_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_code_item PRIMARY KEY (company_id, code_id, item_id)
);

-- 2. 마스터 정보 (Master Data)

CREATE TABLE IF NOT EXISTS equipment (
    company_id VARCHAR(20) NOT NULL,
    plant_id VARCHAR(20) NOT NULL,
    equipment_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    install_location VARCHAR(100),
    code_item VARCHAR(20), -- 설비 유형
    dept_id VARCHAR(20),
    maker_name VARCHAR(100),
    spec TEXT,
    model VARCHAR(100),
    serial VARCHAR(100),
    install_date DATE,
    depre_method VARCHAR(20),
    depre_period INTEGER,
    purchase_cost DECIMAL(18, 2),
    residual_value DECIMAL(18, 2),
    inspection_yn CHAR(1) DEFAULT 'Y',
    psm_yn CHAR(1) DEFAULT 'N',
    workpermit_yn CHAR(1) DEFAULT 'N',
    inspection_interval INTEGER,
    inspection_unit VARCHAR(10),
    last_inspection DATE,
    next_inspection DATE,
    note TEXT,
    file_group_id VARCHAR(100),
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_equipment PRIMARY KEY (company_id, plant_id, equipment_id)
);

CREATE TABLE IF NOT EXISTS inventory (
    company_id VARCHAR(20) NOT NULL,
    inventory_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code_item VARCHAR(20),
    dept_id VARCHAR(20),
    unit VARCHAR(20),
    maker_name VARCHAR(100),
    spec TEXT,
    model VARCHAR(100),
    serial VARCHAR(100),
    note TEXT,
    file_group_id VARCHAR(100),
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_inventory PRIMARY KEY (company_id, inventory_id)
);

-- 3. 트랜잭션 정보 (Transaction Data)

CREATE TABLE IF NOT EXISTS inspection (
    company_id VARCHAR(20) NOT NULL,
    inspection_id VARCHAR(20) NOT NULL,
    plant_id VARCHAR(20),
    equipment_id VARCHAR(20),
    name VARCHAR(100) NOT NULL,
    stage VARCHAR(20),
    code_item VARCHAR(20),
    dept_id VARCHAR(20),
    person_id VARCHAR(20),
    date DATE,
    due_date DATE,
    note TEXT,
    file_group_id VARCHAR(100),
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1),
    ref_entity VARCHAR(20),
    ref_id VARCHAR(20),
    approval_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_inspection PRIMARY KEY (company_id, inspection_id)
);

CREATE TABLE IF NOT EXISTS inspection_item (
    company_id VARCHAR(20) NOT NULL,
    inspection_id VARCHAR(20) NOT NULL,
    line_no INTEGER NOT NULL,
    name VARCHAR(100),
    method VARCHAR(100),
    min_val DECIMAL(18, 4),
    max_val DECIMAL(18, 4),
    std_val DECIMAL(18, 4),
    unit VARCHAR(20),
    result_val DECIMAL(18, 4),
    CONSTRAINT pk_inspection_item PRIMARY KEY (company_id, inspection_id, line_no)
);

CREATE TABLE IF NOT EXISTS work_order (
    company_id VARCHAR(20) NOT NULL,
    order_id VARCHAR(20) NOT NULL,
    plant_id VARCHAR(20),
    equipment_id VARCHAR(20),
    name VARCHAR(100),
    stage VARCHAR(20),
    code_item VARCHAR(20),
    dept_id VARCHAR(20),
    person_id VARCHAR(20),
    date DATE,
    note TEXT,
    cost DECIMAL(18, 2),
    time DECIMAL(10, 2),
    file_group_id VARCHAR(100),
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1),
    ref_entity VARCHAR(20),
    ref_id VARCHAR(20),
    approval_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_work_order PRIMARY KEY (company_id, order_id)
);

CREATE TABLE IF NOT EXISTS work_order_item (
    company_id VARCHAR(20) NOT NULL,
    order_id VARCHAR(20) NOT NULL,
    line_no INTEGER NOT NULL,
    name VARCHAR(100),
    method VARCHAR(100),
    result TEXT,
    CONSTRAINT pk_work_order_item PRIMARY KEY (company_id, order_id, line_no)
);

CREATE TABLE IF NOT EXISTS work_permit (
    company_id VARCHAR(20) NOT NULL,
    permit_id VARCHAR(20) NOT NULL,
    plant_id VARCHAR(20),
    equipment_id VARCHAR(20),
    order_id VARCHAR(20),
    name VARCHAR(100),
    stage VARCHAR(20),
    wp_types VARCHAR(100),
    date DATE,
    start_dt TIMESTAMP,
    end_dt TIMESTAMP,
    location VARCHAR(100),
    dept_id VARCHAR(20),
    person_id VARCHAR(20),
    work_summary TEXT,
    hazard_factor TEXT,
    safety_factor TEXT,
    checksheet_json_com JSONB,
    checksheet_json_hot JSONB,
    checksheet_json_conf JSONB,
    checksheet_json_elec JSONB,
    checksheet_json_high JSONB,
    checksheet_json_dig JSONB,
    checksheet_json_heavy JSONB,
    file_group_id VARCHAR(100),
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1),
    parent_permit_id VARCHAR(20),
    approval_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_work_permit PRIMARY KEY (company_id, permit_id)
);

CREATE TABLE IF NOT EXISTS work_permit_item (
    company_id VARCHAR(20) NOT NULL,
    permit_id VARCHAR(20) NOT NULL,
    line_no INTEGER NOT NULL,
    sign_type VARCHAR(20) NOT NULL, 
    person_id VARCHAR(20),
    name VARCHAR(100),
    signature TEXT,
    signed_at TIMESTAMP,
    CONSTRAINT pk_work_permit_item PRIMARY KEY (company_id, permit_id, line_no)
);

-- 4. 재고 관리 (Inventory Management)

CREATE TABLE IF NOT EXISTS inventory_stock (
    company_id VARCHAR(20) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    bin_id VARCHAR(20) NOT NULL,
    location_id VARCHAR(20) NOT NULL,
    inventory_id VARCHAR(20) NOT NULL,
    qty DECIMAL(18, 4) DEFAULT 0,
    amount DECIMAL(18, 2) DEFAULT 0,
    status CHAR(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_inventory_stock PRIMARY KEY (company_id, storage_id, bin_id, location_id, inventory_id)
);

CREATE TABLE IF NOT EXISTS inventory_history (
    company_id VARCHAR(20) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    bin_id VARCHAR(20) NOT NULL,
    location_id VARCHAR(20) NOT NULL,
    inventory_id VARCHAR(20) NOT NULL,
    history_id VARCHAR(20) NOT NULL,
    tx_type VARCHAR(20),
    qty DECIMAL(18, 4),
    amount DECIMAL(18, 2),
    ref_entity VARCHAR(20),
    ref_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    CONSTRAINT pk_inventory_history PRIMARY KEY (company_id, storage_id, bin_id, location_id, inventory_id, history_id)
);

CREATE TABLE IF NOT EXISTS inventory_closing (
    company_id VARCHAR(20) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    inventory_id VARCHAR(20) NOT NULL,
    yyyymm VARCHAR(6) NOT NULL,
    in_qty DECIMAL(18, 4) DEFAULT 0,
    in_amount DECIMAL(18, 2) DEFAULT 0,
    out_qty DECIMAL(18, 4) DEFAULT 0,
    out_amount DECIMAL(18, 2) DEFAULT 0,
    move_qty DECIMAL(18, 4) DEFAULT 0,
    move_amount DECIMAL(18, 2) DEFAULT 0,
    adj_qty DECIMAL(18, 4) DEFAULT 0,
    adj_amount DECIMAL(18, 2) DEFAULT 0,
    end_qty DECIMAL(18, 4) DEFAULT 0,
    end_amount DECIMAL(18, 2) DEFAULT 0,
    status CHAR(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_inventory_closing PRIMARY KEY (company_id, storage_id, inventory_id, yyyymm)
);

-- 5. 공통 및 시스템 기능 (General & System)

CREATE TABLE IF NOT EXISTS memo (
    company_id VARCHAR(20) NOT NULL,
    memo_id VARCHAR(20) NOT NULL,
    title VARCHAR(100),
    content TEXT,
    file_group_id VARCHAR(100),
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1),
    ref_id VARCHAR(20),
    is_notice CHAR(1) DEFAULT 'N',
    approval_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_memo PRIMARY KEY (company_id, memo_id)
);

CREATE TABLE IF NOT EXISTS memo_comment (
    company_id VARCHAR(20) NOT NULL,
    memo_id VARCHAR(20) NOT NULL,
    comment_id INTEGER NOT NULL,
    author_id VARCHAR(20),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT,
    CONSTRAINT pk_memo_comment PRIMARY KEY (company_id, memo_id, comment_id)
);

CREATE TABLE IF NOT EXISTS approval (
    company_id VARCHAR(20) NOT NULL,
    approval_id VARCHAR(20) NOT NULL,
    title VARCHAR(100),
    content TEXT,
    requester_id VARCHAR(20),
    current_step INTEGER DEFAULT 1,
    file_group_id VARCHAR(100),
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1),
    ref_entity VARCHAR(20),
    ref_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_approval PRIMARY KEY (company_id, approval_id)
);

CREATE TABLE IF NOT EXISTS approval_step (
    company_id VARCHAR(20) NOT NULL,
    approval_id VARCHAR(20) NOT NULL,
    line_no INTEGER NOT NULL,
    person_id VARCHAR(20),
    decision VARCHAR(10),
    result VARCHAR(10),
    decided_at TIMESTAMP,
    comment TEXT,
    CONSTRAINT pk_approval_step PRIMARY KEY (company_id, approval_id, line_no)
);

CREATE TABLE IF NOT EXISTS file_group (
    company_id VARCHAR(20) NOT NULL,
    file_group_id VARCHAR(100) NOT NULL,
    ref_entity VARCHAR(20),
    ref_id VARCHAR(20),
    delete_mark CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_file_group PRIMARY KEY (company_id, file_group_id)
);

CREATE TABLE IF NOT EXISTS file_item (
    company_id VARCHAR(20) NOT NULL,
    file_group_id VARCHAR(100) NOT NULL,
    line_no INTEGER NOT NULL,
    original_name VARCHAR(255),
    stored_name VARCHAR(255),
    ext VARCHAR(10),
    mime VARCHAR(100),
    size BIGINT,
    checksum_sha256 VARCHAR(64),
    storage_path TEXT,
    CONSTRAINT pk_file_item PRIMARY KEY (company_id, file_group_id, line_no)
);

CREATE TABLE IF NOT EXISTS sequence (
    company_id VARCHAR(20) NOT NULL,
    ref_entity VARCHAR(20) NOT NULL,
    date_key VARCHAR(20) NOT NULL,
    next_seq BIGINT DEFAULT 1,
    CONSTRAINT pk_sequence PRIMARY KEY (company_id, ref_entity, date_key)
);

CREATE TABLE IF NOT EXISTS refresh_token (
    company_id VARCHAR(20) NOT NULL,
    person_id VARCHAR(20) NOT NULL,
    token_value VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    CONSTRAINT pk_refresh_token PRIMARY KEY (company_id, person_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_token_value ON refresh_token (token_value);

-- Migration: Add checksheet_json_heavy column to work_permit
ALTER TABLE work_permit ADD COLUMN IF NOT EXISTS checksheet_json_heavy JSONB;
