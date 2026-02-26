-- 1. 기준 정보 (Standard Information)

CREATE TABLE company (
    company_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    bizno VARCHAR(20),
    email VARCHAR(100),
    phone VARCHAR(20),
    delete_mark CHAR(1) DEFAULT 'N',
    CONSTRAINT pk_company PRIMARY KEY (company_id)
);

CREATE TABLE plant (
    company_id VARCHAR(20) NOT NULL,
    plant_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    delete_mark CHAR(1) DEFAULT 'N',
    CONSTRAINT pk_plant PRIMARY KEY (company_id, plant_id)
);

CREATE TABLE dept (
    company_id VARCHAR(20) NOT NULL,
    dept_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_id VARCHAR(20),
    delete_mark CHAR(1) DEFAULT 'N',
    CONSTRAINT pk_dept PRIMARY KEY (company_id, dept_id)
);

CREATE TABLE role (
    company_id VARCHAR(20) NOT NULL,
    role_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    note TEXT,
    delete_mark CHAR(1) DEFAULT 'N',
    CONSTRAINT pk_role PRIMARY KEY (company_id, role_id)
);

CREATE TABLE person (
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
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    CONSTRAINT pk_person PRIMARY KEY (company_id, person_id)
);

CREATE TABLE storage (
    company_id VARCHAR(20) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    delete_mark CHAR(1) DEFAULT 'N',
    CONSTRAINT pk_storage PRIMARY KEY (company_id, storage_id)
);

CREATE TABLE bin (
    company_id VARCHAR(20) NOT NULL,
    bin_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    CONSTRAINT pk_bin PRIMARY KEY (company_id, bin_id)
);

CREATE TABLE location (
    company_id VARCHAR(20) NOT NULL,
    location_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    bin_id VARCHAR(20) NOT NULL,
    CONSTRAINT pk_location PRIMARY KEY (company_id, location_id)
);

CREATE TABLE code (
    company_id VARCHAR(20) NOT NULL,
    code_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    delete_mark CHAR(1) DEFAULT 'N',
    CONSTRAINT pk_code PRIMARY KEY (company_id, code_id)
);

CREATE TABLE code_item (
    company_id VARCHAR(20) NOT NULL,
    code_id VARCHAR(20) NOT NULL,
    item_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_code_item PRIMARY KEY (company_id, code_id, item_id)
);

-- 2. 마스터 정보 (Master Data)

CREATE TABLE equipment (
    company_id VARCHAR(20) NOT NULL,
    plant_id VARCHAR(20) NOT NULL,
    equipment_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    install_location VARCHAR(100),
    code_item VARCHAR(20), -- 설비 유형 (기계, 발전기 등)
    dept_id VARCHAR(20),
    maker_name VARCHAR(100),
    spec TEXT,
    model VARCHAR(100),
    serial VARCHAR(100),
    install_date DATE,
    depre_method VARCHAR(20), -- 01:정액법, 02:정률법
    depre_period INTEGER,
    purchase_cost NUMERIC(18, 2),
    residual_value NUMERIC(18, 2),
    inspection_yn CHAR(1) DEFAULT 'Y',
    psm_yn CHAR(1) DEFAULT 'N',
    workpermit_yn CHAR(1) DEFAULT 'N',
    inspection_interval INTEGER,
    inspection_unit VARCHAR(10), -- 01:일, 05:월 등
    last_inspection DATE, -- 실적 확정시 업데이트
    next_inspection DATE, -- 실적 확정시 업데이트
    note TEXT,
    file_group_id VARCHAR(100),
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1), -- T:임시, A:결재중, C:확정
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    CONSTRAINT pk_equipment PRIMARY KEY (company_id, equipment_id)
);

CREATE TABLE inventory (
    company_id VARCHAR(20) NOT NULL,
    inventory_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code_item VARCHAR(20), -- 자재 유형 (소모품, 교체부품 등)
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
    created_by VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20),
    CONSTRAINT pk_inventory PRIMARY KEY (company_id, inventory_id)
);

-- 3. 트랜잭션 정보 (Transaction Data)

CREATE TABLE inspection (
    company_id VARCHAR(20) NOT NULL,
    inspection_id VARCHAR(20) NOT NULL,
    plant_id VARCHAR(20),
    name VARCHAR(100) NOT NULL,
    stage VARCHAR(20), -- PLN:계획, ACT:실적
    code_item VARCHAR(20), -- 점검 유형 (순찰, 계측값점검 등)
    dept_id VARCHAR(20),
    person_id VARCHAR(20),
    date DATE,
    due_date DATE, -- 예정일 (equipment의 next_inspection날짜 가져옴)
    note TEXT,
    file_group_id VARCHAR(100),
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1), -- T:임시, A:결재, C:확정
    ref_entity VARCHAR(20),
    ref_id VARCHAR(20), -- 계획 참조 시 번호
    approval_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20),
    CONSTRAINT pk_inspection PRIMARY KEY (company_id, inspection_id)
);

CREATE TABLE inspection_item (
    company_id VARCHAR(20) NOT NULL,
    inspection_id VARCHAR(20) NOT NULL,
    line_no INTEGER NOT NULL,
    name VARCHAR(100),
    method VARCHAR(100),
    min_val NUMERIC(18, 4),
    max_val NUMERIC(18, 4),
    std_val NUMERIC(18, 4),
    unit VARCHAR(20),
    result_val NUMERIC(18, 4),
    CONSTRAINT pk_inspection_item PRIMARY KEY (company_id, inspection_id, line_no)
);

CREATE TABLE work_order (
    company_id VARCHAR(20) NOT NULL,
    order_id VARCHAR(20) NOT NULL,
    plant_id VARCHAR(20),
    equipment_id VARCHAR(20),
    name VARCHAR(100),
    stage VARCHAR(20),
    code_item VARCHAR(20), -- 작업 유형 (긴급점검, 정기수리 등)
    dept_id VARCHAR(20),
    person_id VARCHAR(20),
    date DATE,
    note TEXT,
    cost NUMERIC(18, 2),
    time NUMERIC(10, 2), -- ManDay
    file_group_id VARCHAR(100),
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1),
    ref_entity VARCHAR(20),
    ref_id VARCHAR(20),
    approval_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20),
    CONSTRAINT pk_work_order PRIMARY KEY (company_id, order_id)
);

CREATE TABLE work_order_item (
    company_id VARCHAR(20) NOT NULL,
    order_id VARCHAR(20) NOT NULL,
    line_no INTEGER NOT NULL,
    name VARCHAR(100),
    method VARCHAR(100),
    result TEXT,
    CONSTRAINT pk_work_order_item PRIMARY KEY (company_id, order_id, line_no)
);

CREATE TABLE work_permit (
    company_id VARCHAR(20) NOT NULL,
    permit_id VARCHAR(20) NOT NULL, -- WP + YYYYMM + SEQ
    plant_id VARCHAR(20),
    equipment_id VARCHAR(20),
    order_id VARCHAR(20), -- 연관된 작업지시(WO)와 직접 연결
    name VARCHAR(100),
    stage VARCHAR(20),
    wp_types VARCHAR(100), -- HOT(화기), CONF(밀폐), ELEC(정전), DIG(굴착), HIGH(고소), HEVY(중량물), GEN(일반)
    
    -- 작업 기간 (PDF 서식의 '시 부터 시 까지' 반영)
    start_dt TIMESTAMP,
    end_dt TIMESTAMP,
    location VARCHAR(100),

    dept_id VARCHAR(20), -- 신청부서
    person_id VARCHAR(20), -- 신청인
    
    work_summary TEXT, -- 작업개요
    hazard_factor TEXT, -- 위험요인
    safety_factor TEXT, -- 안전조치
    
    -- 특별 작업 유형 (다중 선택 가능 공통 : COM, 화기 : HOT, 밀폐 : CONF, 전기 : ELEC, 고소 : HIGH, 굴착 : DIG 등)
    checksheet_json_com JSON,
    checksheet_json_hot JSON,
    checksheet_json_conf JSON,
    checksheet_json_elec JSON,
    checksheet_json_high JSON,
    checksheet_json_dig JSON,
    
    file_group_id VARCHAR(100), -- 굴착 작업 스케치나 현장 사진 [cite: 80]
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1), -- T:임시, A:결재중, C:확정 
    
    parent_permit_id VARCHAR(20), -- 보충 허가 연결용
    approval_id VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20),
    CONSTRAINT pk_work_permit PRIMARY KEY (company_id, permit_id)
);

CREATE TABLE work_permit_item (
    company_id VARCHAR(20) NOT NULL,
    permit_id VARCHAR(20) NOT NULL,
    line_no INTEGER NOT NULL,
    
    -- 서명 유형 (PDF 서식의 다양한 서명란 구분)
    -- APPLICANT(신청인), INSPECTOR(점검자), WITNESS(입회자), 
    -- MANAGER(책임자), REVIEWER(검토자), APPROVER(승인자), COOP(협조자)
    sign_type VARCHAR(20) NOT NULL, 
    
    person_id VARCHAR(20), -- 시스템 사용자일 경우 연결
    name VARCHAR(100),     -- 서명자 성명 [cite: 15, 66]
    signature TEXT,        -- Base64 이미지 데이터 또는 서명 경로 [cite: 16, 67]
    signed_at TIMESTAMP,   -- 서명 일시
    
    CONSTRAINT pk_work_permit_item PRIMARY KEY (company_id, permit_id, line_no)
);

-- 4. 재고 관리 (Inventory Management)
-- Modified to include bin/location granularity

CREATE TABLE inventory_stock (
    company_id VARCHAR(20) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    bin_id VARCHAR(20) NOT NULL,       -- Added
    location_id VARCHAR(20) NOT NULL,  -- Added
    inventory_id VARCHAR(20) NOT NULL,
    qty NUMERIC(18, 4) DEFAULT 0,
    amount NUMERIC(18, 2) DEFAULT 0,
    status CHAR(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20),
    CONSTRAINT pk_inventory_stock PRIMARY KEY (company_id, storage_id, bin_id, location_id, inventory_id)
);

CREATE TABLE inventory_history (
    company_id VARCHAR(20) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    bin_id VARCHAR(20) NOT NULL,       -- Added
    location_id VARCHAR(20) NOT NULL,  -- Added
    inventory_id VARCHAR(20) NOT NULL,
    history_id VARCHAR(20) NOT NULL,
    tx_type VARCHAR(20), -- IN, OUT, MOVE, ADJUST
    tx_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    qty NUMERIC(18, 4),
    amount NUMERIC(18, 2),
    ref_entity VARCHAR(20),
    ref_id VARCHAR(20),
    CONSTRAINT pk_inventory_history PRIMARY KEY (company_id, storage_id, bin_id, location_id, inventory_id, history_id)
);

CREATE TABLE inventory_closing (
    company_id VARCHAR(20) NOT NULL,
    storage_id VARCHAR(20) NOT NULL,
    inventory_id VARCHAR(20) NOT NULL,
    yyyymm VARCHAR(6) NOT NULL,
    in_qty NUMERIC(18, 4) DEFAULT 0,
    in_amount NUMERIC(18, 2) DEFAULT 0,
    out_qty NUMERIC(18, 4) DEFAULT 0,
    out_amount NUMERIC(18, 2) DEFAULT 0,
    move_qty NUMERIC(18, 4) DEFAULT 0,
    move_amount NUMERIC(18, 2) DEFAULT 0,
    adj_qty NUMERIC(18, 4) DEFAULT 0,
    adj_amount NUMERIC(18, 2) DEFAULT 0,
    end_qty NUMERIC(18, 4) DEFAULT 0,
    end_amount NUMERIC(18, 2) DEFAULT 0,
    status CHAR(1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20),
    CONSTRAINT pk_inventory_closing PRIMARY KEY (company_id, storage_id, inventory_id, yyyymm)
);

-- 5. 공통 및 시스템 기능 (General & System)

CREATE TABLE memo (
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
    created_by VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20),
    CONSTRAINT pk_memo PRIMARY KEY (company_id, memo_id)
);

CREATE TABLE memo_comment (
    company_id VARCHAR(20) NOT NULL,
    memo_id VARCHAR(20) NOT NULL,
    comment_id INTEGER NOT NULL,
    author_id VARCHAR(20),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT    
);

CREATE TABLE approval (
    company_id VARCHAR(20) NOT NULL,
    approval_id VARCHAR(20) NOT NULL,
    title VARCHAR(100),
    content TEXT,
    requester_id VARCHAR(20), -- 기안자
    current_step INTEGER DEFAULT 1, -- 현재 결재 순번
    file_group_id VARCHAR(100),
    delete_mark CHAR(1) DEFAULT 'N',
    status CHAR(1), -- T:임시, A:결재중, C:확정, R:반려 
    ref_entity VARCHAR(20), -- IN, WO 등
    ref_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20),
    CONSTRAINT pk_approval PRIMARY KEY (company_id, approval_id)
);

CREATE TABLE approval_step (
    company_id VARCHAR(20) NOT NULL,
    approval_id VARCHAR(20) NOT NULL,
    line_no INTEGER NOT NULL,
    person_id VARCHAR(20),
    decision VARCHAR(10), -- 00: 기안, 01:결재, 02:합의, 03:통보, 04:반려
    result VARCHAR(10), -- 00: 미결, 01:결재승인, 02:합의승인, 03:통보승인, 04:반려
    decided_at TIMESTAMP,
    comment TEXT,
    CONSTRAINT pk_approval_step PRIMARY KEY (company_id, approval_id, line_no)
);

CREATE TABLE file_group (
    company_id VARCHAR(20) NOT NULL,
    file_group_id VARCHAR(100) NOT NULL,
    ref_entity VARCHAR(20),
    ref_id VARCHAR(20),
    delete_mark CHAR(1) DEFAULT 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20),
    CONSTRAINT pk_file_group PRIMARY KEY (company_id, file_group_id)
);

CREATE TABLE file_item (
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

CREATE TABLE sequence (
    company_id VARCHAR(20) NOT NULL,
    ref_entity VARCHAR(20) NOT NULL, -- equipment, inventory 등
    date_key VARCHAR(20) NOT NULL, -- 년월일 혹은 prefix
    next_seq BIGINT DEFAULT 1,
    CONSTRAINT pk_sequence PRIMARY KEY (company_id, ref_entity, date_key)
);
