\-- 1\. 기준 정보 (Standard Information)

CREATE TABLE company (  
    company\_id VARCHAR(20) NOT NULL,  
    name VARCHAR(100) NOT NULL,  
    bizno VARCHAR(20),  
    email VARCHAR(100),  
    phone VARCHAR(20),  
    delete\_mark CHAR(1) DEFAULT 'N',  
    CONSTRAINT pk\_company PRIMARY KEY (company\_id)  
);

CREATE TABLE plant (  
    company\_id VARCHAR(20) NOT NULL,  
    plant\_id VARCHAR(20) NOT NULL,  
    name VARCHAR(100) NOT NULL,  
    delete\_mark CHAR(1) DEFAULT 'N',  
    CONSTRAINT pk\_plant PRIMARY KEY (company\_id, plant\_id)  
);

CREATE TABLE dept (  
    company\_id VARCHAR(20) NOT NULL,  
    dept\_id VARCHAR(20) NOT NULL,  
    name VARCHAR(100) NOT NULL,  
    parent\_id VARCHAR(20),  
    delete\_mark CHAR(1) DEFAULT 'N',  
    CONSTRAINT pk\_dept PRIMARY KEY (company\_id, dept\_id)  
);

CREATE TABLE role (  
    company\_id VARCHAR(20) NOT NULL,  
    role\_id VARCHAR(20) NOT NULL,  
    name VARCHAR(100) NOT NULL,  
    note TEXT,  
    delete\_mark CHAR(1) DEFAULT 'N',  
    CONSTRAINT pk\_role PRIMARY KEY (company\_id, role\_id)  
);

CREATE TABLE person (  
    company\_id VARCHAR(20) NOT NULL,  
    person\_id VARCHAR(20) NOT NULL,  
    role\_id VARCHAR(20),  
    name VARCHAR(100) NOT NULL,  
    dept\_id VARCHAR(20),  
    password\_hash VARCHAR(255),  
    email VARCHAR(100),  
    phone VARCHAR(20),  
    position VARCHAR(50),  
    title VARCHAR(50),  
    note TEXT,  
    delete\_mark CHAR(1) DEFAULT 'N',  
    last\_login\_at TIMESTAMP,  
    last\_login\_ip VARCHAR(50),  
    CONSTRAINT pk\_person PRIMARY KEY (company\_id, person\_id)  
);

CREATE TABLE storage (  
    company\_id VARCHAR(20) NOT NULL,  
    storage\_id VARCHAR(20) NOT NULL,  
    name VARCHAR(100) NOT NULL,  
    delete\_mark CHAR(1) DEFAULT 'N',  
    CONSTRAINT pk\_storage PRIMARY KEY (company\_id, storage\_id)  
);

CREATE TABLE bin (  
    company\_id VARCHAR(20) NOT NULL,  
    bin\_id VARCHAR(20) NOT NULL,  
    name VARCHAR(100) NOT NULL,  
    storage\_id VARCHAR(20) NOT NULL,  
    CONSTRAINT pk\_bin PRIMARY KEY (company\_id, bin\_id)  
);

CREATE TABLE location (  
    company\_id VARCHAR(20) NOT NULL,  
    location\_id VARCHAR(20) NOT NULL,  
    name VARCHAR(100) NOT NULL,  
    storage\_id VARCHAR(20) NOT NULL,  
    bin\_id VARCHAR(20) NOT NULL,  
    CONSTRAINT pk\_location PRIMARY KEY (company\_id, location\_id)  
);

CREATE TABLE code (  
    company\_id VARCHAR(20) NOT NULL,  
    code\_id VARCHAR(20) NOT NULL,  
    name VARCHAR(100) NOT NULL,  
    delete\_mark CHAR(1) DEFAULT 'N',  
    CONSTRAINT pk\_code PRIMARY KEY (company\_id, code\_id)  
);

CREATE TABLE code\_item (  
    company\_id VARCHAR(20) NOT NULL,  
    code\_id VARCHAR(20) NOT NULL,  
    item\_id VARCHAR(20) NOT NULL,  
    name VARCHAR(100) NOT NULL,  
    CONSTRAINT pk\_code\_item PRIMARY KEY (company\_id, code\_id, item\_id)  
);

\-- 2\. 마스터 정보 (Master Data)

CREATE TABLE equipment (  
    company\_id VARCHAR(20) NOT NULL,  
    plant\_id VARCHAR(20) NOT NULL,  
    equipment\_id VARCHAR(20) NOT NULL,  
    name VARCHAR(100) NOT NULL,  
    code\_item VARCHAR(20), \-- 설비 유형 (기계, 발전기 등)  
    dept\_id VARCHAR(20),  
    maker\_name VARCHAR(100),  
    spec TEXT,  
    model VARCHAR(100),  
    serial VARCHAR(100),  
    install\_date DATE,  
    depre\_method VARCHAR(20), \-- 01:정액법, 02:정률법  
    depre\_period INTEGER,  
    purchase\_cost NUMERIC(18, 2),  
    residual\_value NUMERIC(18, 2),  
    inspection\_yn CHAR(1) DEFAULT 'Y',  
    psm\_yn CHAR(1) DEFAULT 'N',  
    workpermit\_yn CHAR(1) DEFAULT 'N',  
    inspection\_interval INTEGER,  
    inspection\_unit VARCHAR(10), \-- 01:일, 05:월 등  
    last\_inspection DATE,  
    next\_inspection DATE,  
    file\_group\_id VARCHAR(100),  
    delete\_mark CHAR(1) DEFAULT 'N',  
    status CHAR(1), \-- T:임시, A:결재중, C:확정  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by VARCHAR(50),  
    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    updated\_by VARCHAR(50),  
    CONSTRAINT pk\_equipment PRIMARY KEY (company\_id, equipment\_id)  
);

CREATE TABLE inventory (  
    company\_id VARCHAR(20) NOT NULL,  
    inventory\_id VARCHAR(20) NOT NULL,  
    name VARCHAR(100) NOT NULL,  
    code\_item VARCHAR(20), \-- 자재 유형 (소모품, 교체부품 등)  
    dept\_id VARCHAR(20),  
    unit VARCHAR(20),  
    maker\_name VARCHAR(100),  
    spec TEXT,  
    model VARCHAR(100),  
    serial VARCHAR(100),  
    file\_group\_id VARCHAR(100),  
    delete\_mark CHAR(1) DEFAULT 'N',  
    status CHAR(1),  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by VARCHAR(20),  
    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    updated\_by VARCHAR(20),  
    CONSTRAINT pk\_inventory PRIMARY KEY (company\_id, inventory\_id)  
);

\-- 3\. 트랜잭션 정보 (Transaction Data)

CREATE TABLE inspection (  
    company\_id VARCHAR(20) NOT NULL,  
    inspection\_id VARCHAR(20) NOT NULL,  
    plant\_id VARCHAR(20),  
    name VARCHAR(100) NOT NULL,  
    stage VARCHAR(20), \-- PLN:계획, ACT:실적  
    code\_item VARCHAR(20), \-- 점검 유형 (순찰, 계측값점검 등)  
    dept\_id VARCHAR(20),  
    person\_id VARCHAR(20),  
    date DATE,  
    file\_group\_id VARCHAR(100),  
    delete\_mark CHAR(1) DEFAULT 'N',  
    status CHAR(1), \-- T:임시, A:결재, C:확정  
    ref\_entity VARCHAR(20),  
    ref\_id VARCHAR(20), \-- 계획 참조 시 번호  
    approval\_id VARCHAR(20),  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by VARCHAR(20),  
    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    updated\_by VARCHAR(20),  
    CONSTRAINT pk\_inspection PRIMARY KEY (company\_id, inspection\_id)  
);

CREATE TABLE inspection\_item (  
    company\_id VARCHAR(20) NOT NULL,  
    inspection\_id VARCHAR(20) NOT NULL,  
    line\_no INTEGER NOT NULL,  
    name VARCHAR(100),  
    method VARCHAR(100),  
    min\_val NUMERIC(18, 4),  
    max\_val NUMERIC(18, 4),  
    std\_val NUMERIC(18, 4),  
    unit VARCHAR(20),  
    result\_val NUMERIC(18, 4),  
    CONSTRAINT pk\_inspection\_item PRIMARY KEY (company\_id, inspection\_id, line\_no)  
);

CREATE TABLE work\_order (  
    company\_id VARCHAR(20) NOT NULL,  
    order\_id VARCHAR(20) NOT NULL,  
    plant\_id VARCHAR(20),  
    equipment\_id VARCHAR(20),  
    name VARCHAR(100),  
    stage VARCHAR(20),  
    code\_item VARCHAR(20), \-- 작업 유형 (긴급점검, 정기수리 등)  
    dept\_id VARCHAR(20),  
    person\_id VARCHAR(20),  
    date DATE,  
    cost NUMERIC(18, 2),  
    time NUMERIC(10, 2), \-- ManDay  
    file\_group\_id VARCHAR(100),  
    delete\_mark CHAR(1) DEFAULT 'N',  
    status CHAR(1),  
    ref\_id VARCHAR(20),  
    approval\_id VARCHAR(20),  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by VARCHAR(20),  
    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    updated\_by VARCHAR(20),  
    CONSTRAINT pk\_work\_order PRIMARY KEY (company\_id, order\_id)  
);

CREATE TABLE work\_order\_item (  
    company\_id VARCHAR(20) NOT NULL,  
    order\_id VARCHAR(20) NOT NULL,  
    line\_no INTEGER NOT NULL,  
    name VARCHAR(100),  
    method VARCHAR(100),  
    result TEXT,  
    CONSTRAINT pk\_work\_order\_item PRIMARY KEY (company\_id, order\_id, line\_no)  
);

CREATE TABLE work\_permit (  
    company\_id VARCHAR(20) NOT NULL,  
    permit\_id VARCHAR(20) NOT NULL,  
    plant\_id VARCHAR(20),  
    equipment\_id VARCHAR(20),  
    name VARCHAR(100),  
    stage VARCHAR(20),  
    code\_item VARCHAR(20), \-- 작업허가 유형 (일반, 고소, 밀폐)  
    dept\_id VARCHAR(20),  
    person\_id VARCHAR(20),  
    work\_summary TEXT,  
    hazard\_factor TEXT,  
    safety\_factor TEXT,  
    checksheet\_json JSONB, \-- JSON 형식 지원  
    file\_group\_id VARCHAR(100),  
    delete\_mark CHAR(1) DEFAULT 'N',  
    status CHAR(1),  
    ref\_id VARCHAR(20),  
    approval\_id VARCHAR(20),  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by VARCHAR(20),  
    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    updated\_by VARCHAR(20),  
    CONSTRAINT pk\_work\_permit PRIMARY KEY (company\_id, permit\_id)  
);

CREATE TABLE work\_permit\_item (  
    company\_id VARCHAR(20) NOT NULL,  
    permit\_id VARCHAR(20) NOT NULL,  
    line\_no INTEGER NOT NULL,  
    name VARCHAR(100), \-- 서명자 이름 또는 역할  
    signature TEXT, \-- 서명 데이터 (Base64 or Path)  
    CONSTRAINT pk\_work\_permit\_item PRIMARY KEY (company\_id, permit\_id, line\_no)  
);

\-- 4\. 재고 관리 (Inventory Management)

CREATE TABLE inventory\_stock (  
    company\_id VARCHAR(20) NOT NULL,  
    storage\_id VARCHAR(20) NOT NULL,  
    inventory\_id VARCHAR(20) NOT NULL,  
    qty NUMERIC(18, 4\) DEFAULT 0,  
    amount NUMERIC(18, 2\) DEFAULT 0,  
    status CHAR(1),  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by VARCHAR(20),  
    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    updated\_by VARCHAR(20),  
    CONSTRAINT pk\_inventory\_stock PRIMARY KEY (company\_id, storage\_id, inventory\_id)  
);

CREATE TABLE inventory\_history (  
    company\_id VARCHAR(20) NOT NULL,  
    storage\_id VARCHAR(20) NOT NULL,  
    inventory\_id VARCHAR(20) NOT NULL,  
    history\_id VARCHAR(20) NOT NULL, \-- PK를 위해 추가 (문서에는 없으나 고유식별 필요)  
    tx\_type VARCHAR(20), \-- IN, OUT, MOVE, ADJUST  
    tx\_date TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    qty NUMERIC(18, 4),  
    amount NUMERIC(18, 2),  
    ref\_entity VARCHAR(20),  
    ref\_id VARCHAR(20),  
    CONSTRAINT pk\_inventory\_history PRIMARY KEY (company\_id, storage\_id, inventory\_id, history\_id)  
);

CREATE TABLE inventory\_closing (  
    company\_id VARCHAR(20) NOT NULL,  
    storage\_id VARCHAR(20) NOT NULL,  
    inventory\_id VARCHAR(20) NOT NULL,  
    yyyymm VARCHAR(6) NOT NULL,  
    in\_qty NUMERIC(18, 4\) DEFAULT 0,  
    in\_amount NUMERIC(18, 2\) DEFAULT 0,  
    out\_qty NUMERIC(18, 4\) DEFAULT 0,  
    out\_amount NUMERIC(18, 2\) DEFAULT 0,  
    move\_qty NUMERIC(18, 4\) DEFAULT 0,  
    move\_amount NUMERIC(18, 2\) DEFAULT 0,  
    adj\_qty NUMERIC(18, 4\) DEFAULT 0,  
    adj\_amount NUMERIC(18, 2\) DEFAULT 0,  
    end\_qty NUMERIC(18, 4\) DEFAULT 0,  
    end\_amount NUMERIC(18, 2\) DEFAULT 0,  
    status CHAR(1),  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by VARCHAR(20),  
    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    updated\_by VARCHAR(20),  
    CONSTRAINT pk\_inventory\_closing PRIMARY KEY (company\_id, storage\_id, inventory\_id, yyyymm)  
);

\-- 5\. 공통 및 시스템 기능 (General & System)

CREATE TABLE memo (  
    company\_id VARCHAR(20) NOT NULL,  
    memo\_id VARCHAR(20) NOT NULL,  
    title VARCHAR(100),  
    content TEXT,  
    file\_group\_id VARCHAR(100),  
    delete\_mark CHAR(1) DEFAULT 'N',  
    status CHAR(1),  
    ref\_id VARCHAR(20),  
    approval\_id VARCHAR(20),  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by VARCHAR(20),  
    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    updated\_by VARCHAR(20),  
    CONSTRAINT pk\_memo PRIMARY KEY (company\_id, memo\_id)  
);

CREATE TABLE approval (  
    company\_id VARCHAR(20) NOT NULL,  
    approval\_id VARCHAR(20) NOT NULL,  
    title VARCHAR(100),  
    content TEXT,  
    file\_group\_id VARCHAR(100),  
    delete\_mark CHAR(1) DEFAULT 'N',  
    status CHAR(1),  
    ref\_entity VARCHAR(20), \-- INSPC, WPERM 등  
    ref\_id VARCHAR(20),  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by VARCHAR(20),  
    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    updated\_by VARCHAR(20),  
    CONSTRAINT pk\_approval PRIMARY KEY (company\_id, approval\_id)  
);

CREATE TABLE approval\_step (  
    company\_id VARCHAR(20) NOT NULL,  
    approval\_id VARCHAR(20) NOT NULL,  
    line\_no INTEGER NOT NULL,  
    person\_id VARCHAR(20),  
    decision VARCHAR(10), \-- 01:결재, 02:합의, 03:통보  
    result VARCHAR(10),  
    decided\_at TIMESTAMP,  
    comment TEXT,  
    CONSTRAINT pk\_approval\_step PRIMARY KEY (company\_id, approval\_id, line\_no)  
);

CREATE TABLE file\_group (  
    company\_id VARCHAR(20) NOT NULL,  
    file\_group\_id VARCHAR(100) NOT NULL,  
    ref\_entity VARCHAR(20),  
    ref\_id VARCHAR(20),  
    delete\_mark CHAR(1) DEFAULT 'N',  
    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    created\_by VARCHAR(20),  
    updated\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,  
    updated\_by VARCHAR(20),  
    CONSTRAINT pk\_file\_group PRIMARY KEY (company\_id, file\_group\_id)  
);

CREATE TABLE file\_item (  
    company\_id VARCHAR(20) NOT NULL,  
    file\_group\_id VARCHAR(100) NOT NULL,  
    line\_no INTEGER NOT NULL,  
    original\_name VARCHAR(255),  
    stored\_name VARCHAR(255),  
    ext VARCHAR(10),  
    mime VARCHAR(100),  
    size BIGINT,  
    checksum\_sha256 VARCHAR(64),  
    storage\_path TEXT,  
    CONSTRAINT pk\_file\_item PRIMARY KEY (company\_id, file\_group\_id, line\_no)  
);

CREATE TABLE sequence (  
    company\_id VARCHAR(20) NOT NULL,  
    ref\_entity VARCHAR(20) NOT NULL, \-- equipment, inventory 등  
    date\_key VARCHAR(20) NOT NULL, \-- 년월일 혹은 prefix  
    next\_seq BIGINT DEFAULT 1,  
    CONSTRAINT pk\_sequence PRIMARY KEY (company\_id, ref\_entity, date\_key)  
);  
