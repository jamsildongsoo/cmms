# CMMS 데이터베이스 사양서 (Database Specification)

> 본 문서는 CMMS 시스템의 데이터베이스 설계를 엔티티 관계, 컬럼 사양, 제약조건 중심으로 기술합니다.
> DDL은 `CMMS_TABLES.md`를 참고하고, 본 문서는 설계 의도와 관계 구조를 이해하는 데 중점을 둡니다.

---

## 1. 데이터베이스 개요

| 항목 | 사양 |
|------|------|
| **DBMS** | PostgreSQL 15.x+ (Neon Cloud) |
| **스키마 관리** | `schema.sql` (DDL 파일) — `spring.jpa.hibernate.ddl-auto=none` |
| **네이밍 규칙** | snake_case (테이블명, 컬럼명) |
| **복합 PK** | 대부분 `(company_id, entity_id)` 구조 — 멀티 테넌시 지원 |
| **Soft Delete** | `delete_mark` CHAR(1) DEFAULT 'N' — 'Y'로 설정 시 논리 삭제 |
| **감사 필드** | `created_at`, `created_by`, `updated_at`, `updated_by` — BaseEntity 상속 엔티티 |

---

## 2. ERD 개요 (Entity Relationship)

```
                    ┌──────────────────────────────────────────────────┐
                    │              SYSTEM / COMMON                     │
                    │  sequence · file_group · file_item · refresh_token│
                    └──────────────────────────────────────────────────┘
                                         │
    ┌────────────────────────────────────┼────────────────────────────────────┐
    │          STANDARD INFO             │           APPROVAL                 │
    │  company · plant · dept            │  approval ──► approval_step       │
    │  person · role                     │       ▲                            │
    │  code · code_item                  │       │ ref_entity / ref_id        │
    │  storage · bin · location          │       │                            │
    └───────────┬────────────────────────┼───────┼────────────────────────────┘
                │                        │       │
    ┌───────────▼────────────────────────┼───────┼────────────────────────────┐
    │          MASTER DATA               │       │                            │
    │  equipment · inventory             │       │                            │
    └───────────┬────────────────────────┼───────┼────────────────────────────┘
                │                        │       │
    ┌───────────▼────────────────────────┼───────┼────────────────────────────┐
    │         TRANSACTION                │       │                            │
    │  inspection ──► inspection_item    │───────┘                            │
    │  work_order ──► work_order_item    │                                    │
    │  work_permit ──► work_permit_item  │                                    │
    └───────────┬────────────────────────┼────────────────────────────────────┘
                │                        │
    ┌───────────▼────────────────────────┼────────────────────────────────────┐
    │         INVENTORY MGMT             │          MEMO                      │
    │  inventory_stock                   │  memo ──► memo_comment             │
    │  inventory_history                 │                                    │
    │  inventory_closing                 │                                    │
    └────────────────────────────────────┴────────────────────────────────────┘
```

---

## 3. 테이블 상세 사양

### 3.1 기준정보 (Standard Information)

#### company — 회사

| 컬럼 | 타입 | PK | NULL | 기본값 | 설명 |
|------|------|:--:|:----:|--------|------|
| company_id | VARCHAR(20) | ● | N | | 회사 코드 |
| name | VARCHAR(100) | | N | | 회사명 |
| bizno | VARCHAR(20) | | Y | | 사업자번호 |
| email | VARCHAR(100) | | Y | | 대표 이메일 |
| phone | VARCHAR(20) | | Y | | 대표 전화번호 |
| delete_mark | CHAR(1) | | | 'N' | 삭제 여부 |
| created_at | TIMESTAMP | | | CURRENT_TIMESTAMP | 생성일시 |
| created_by | VARCHAR(50) | | Y | | 생성자 |
| updated_at | TIMESTAMP | | | CURRENT_TIMESTAMP | 수정일시 |
| updated_by | VARCHAR(50) | | Y | | 수정자 |

**PK**: `(company_id)`

---

#### plant — 플랜트(사업장)

| 컬럼 | 타입 | PK | NULL | 기본값 | 설명 |
|------|------|:--:|:----:|--------|------|
| company_id | VARCHAR(20) | ● | N | | 회사 코드 |
| plant_id | VARCHAR(20) | ● | N | | 플랜트 코드 |
| name | VARCHAR(100) | | N | | 플랜트명 |
| delete_mark | CHAR(1) | | | 'N' | 삭제 여부 |
| created_at~updated_by | | | | | 감사 필드 |

**PK**: `(company_id, plant_id)`
**참조**: company_id → company

---

#### dept — 부서

| 컬럼 | 타입 | PK | NULL | 기본값 | 설명 |
|------|------|:--:|:----:|--------|------|
| company_id | VARCHAR(20) | ● | N | | 회사 코드 |
| dept_id | VARCHAR(20) | ● | N | | 부서 코드 |
| name | VARCHAR(100) | | N | | 부서명 |
| parent_id | VARCHAR(20) | | Y | | 상위 부서 (자기참조, 트리구조) |
| delete_mark~updated_by | | | | | 공통 필드 |

**PK**: `(company_id, dept_id)`
**자기참조**: parent_id → dept.dept_id (다단계 부서 구조)

---

#### role — 역할(권한 그룹)

| 컬럼 | 타입 | PK | NULL | 설명 |
|------|------|:--:|:----:|------|
| company_id | VARCHAR(20) | ● | N | 회사 코드 |
| role_id | VARCHAR(20) | ● | N | 역할 코드 |
| name | VARCHAR(100) | | N | 역할명 |
| note | TEXT | | Y | 비고 (권한 설명 등) |
| delete_mark~updated_by | | | | 공통 필드 |

**PK**: `(company_id, role_id)`

---

#### person — 사용자

| 컬럼 | 타입 | PK | NULL | 설명 |
|------|------|:--:|:----:|------|
| company_id | VARCHAR(20) | ● | N | 회사 코드 |
| person_id | VARCHAR(20) | ● | N | 사번 |
| role_id | VARCHAR(20) | | Y | 역할 FK |
| name | VARCHAR(100) | | N | 이름 |
| dept_id | VARCHAR(20) | | Y | 부서 FK |
| password_hash | VARCHAR(255) | | Y | 비밀번호 (BCrypt 해시) |
| email | VARCHAR(100) | | Y | 이메일 |
| phone | VARCHAR(20) | | Y | 전화번호 |
| position | VARCHAR(50) | | Y | 직위 (차장, 과장 등) |
| title | VARCHAR(50) | | Y | 직책 (팀장, 파트장 등) |
| note | TEXT | | Y | 비고 |
| last_login_ip | VARCHAR(50) | | Y | 마지막 접속 IP |
| last_login_at | TIMESTAMP | | Y | 마지막 접속 시간 |
| last_login_plant_id | VARCHAR(20) | | Y | 마지막 접속 플랜트 |
| delete_mark~updated_by | | | | 공통 필드 |

**PK**: `(company_id, person_id)`
**FK**: role_id → role, dept_id → dept

---

#### storage / bin / location — 창고 위치 3단계

**계층 구조**: Storage(창고) → Bin(구역) → Location(위치)

| 테이블 | PK | 핵심 컬럼 | 상위 참조 |
|--------|-----|-----------|-----------|
| storage | (company_id, storage_id) | name | - |
| bin | (company_id, bin_id) | name, storage_id | storage |
| location | (company_id, location_id) | name, storage_id, bin_id | storage, bin |

---

#### code / code_item — 공통코드

**Master-Detail 구조**: code(헤더) → code_item(아이템)

| 테이블 | PK | 핵심 컬럼 |
|--------|-----|-----------|
| code | (company_id, code_id) | name, delete_mark, 감사필드 |
| code_item | (company_id, code_id, item_id) | name |

**code_item은 감사필드 미보유** (경량 데이터)

---

### 3.2 마스터정보 (Master Data)

#### equipment — 설비

| 컬럼 | 타입 | PK | NULL | 설명 |
|------|------|:--:|:----:|------|
| company_id | VARCHAR(20) | ● | N | 회사 코드 |
| equipment_id | VARCHAR(20) | ● | N | 설비 코드 (EQ + yyyyMM + seq) |
| plant_id | VARCHAR(20) | | N | 플랜트 FK |
| name | VARCHAR(100) | | N | 설비명 |
| install_location | VARCHAR(100) | | Y | 설치 위치 |
| code_item | VARCHAR(20) | | Y | 설비 유형 (EQ_TYPE 코드 참조) |
| dept_id | VARCHAR(20) | | Y | 담당 부서 FK |
| maker_name | VARCHAR(100) | | Y | 제조사 |
| spec | TEXT | | Y | 규격/사양 |
| model | VARCHAR(100) | | Y | 모델명 |
| serial | VARCHAR(100) | | Y | 시리얼 번호 |
| install_date | DATE | | Y | 설치일 |
| depre_method | VARCHAR(20) | | Y | 감가상각 방법 |
| depre_period | INTEGER | | Y | 감가상각 기간(년) |
| purchase_cost | DECIMAL(18,2) | | Y | 취득 원가 |
| residual_value | DECIMAL(18,2) | | Y | 잔존 가치 |
| inspection_yn | CHAR(1) | | | 'Y' | 점검 대상 여부 |
| psm_yn | CHAR(1) | | | 'N' | PSM 대상 여부 |
| workpermit_yn | CHAR(1) | | | 'N' | 작업허가 필요 여부 |
| inspection_interval | INTEGER | | Y | 점검 주기 |
| inspection_unit | VARCHAR(10) | | Y | 주기 단위 (DAY, WEEK, MONTH 등) |
| last_inspection | DATE | | Y | 마지막 점검일 |
| next_inspection | DATE | | Y | 다음 점검 예정일 |
| note | TEXT | | Y | 비고 |
| file_group_id | VARCHAR(100) | | Y | 첨부파일 그룹 FK |
| status | CHAR(1) | | Y | 상태 코드 |
| delete_mark~updated_by | | | | 공통 필드 |

**PK**: `(company_id, equipment_id)`

---

#### inventory — 자재(부품)

| 컬럼 | 타입 | PK | NULL | 설명 |
|------|------|:--:|:----:|------|
| company_id | VARCHAR(20) | ● | N | 회사 코드 |
| inventory_id | VARCHAR(20) | ● | N | 자재 코드 (MT + yyyyMM + seq) |
| name | VARCHAR(100) | | N | 자재명 |
| code_item | VARCHAR(20) | | Y | 자재 유형 (MAT_TYPE 코드 참조) |
| dept_id | VARCHAR(20) | | Y | 담당 부서 FK |
| unit | VARCHAR(20) | | Y | 단위 (EA, SET, KG 등) |
| maker_name | VARCHAR(100) | | Y | 제조사 |
| spec | TEXT | | Y | 규격 |
| model | VARCHAR(100) | | Y | 모델명 |
| serial | VARCHAR(100) | | Y | 시리얼 번호 |
| note | TEXT | | Y | 비고 |
| file_group_id | VARCHAR(100) | | Y | 첨부파일 그룹 FK |
| status | CHAR(1) | | Y | 상태 코드 |
| delete_mark~updated_by | | | | 공통 필드 |

**PK**: `(company_id, inventory_id)`

---

### 3.3 트랜잭션 (Transaction Data)

#### inspection / inspection_item — 예방점검

**inspection (헤더)**

| 컬럼 | 타입 | NULL | 설명 |
|------|------|:----:|------|
| company_id + inspection_id | VARCHAR(20) | N | **PK** |
| plant_id | VARCHAR(20) | Y | 플랜트 FK |
| equipment_id | VARCHAR(20) | Y | 대상 설비 FK |
| name | VARCHAR(100) | N | 점검명 |
| stage | VARCHAR(20) | Y | PLN(계획) / ACT(실적) |
| code_item | VARCHAR(20) | Y | 점검 유형 (INSP_TYPE 코드) |
| dept_id | VARCHAR(20) | Y | 담당 부서 |
| person_id | VARCHAR(20) | Y | 담당자 |
| date | DATE | Y | 점검일 |
| due_date | DATE | Y | 예정일 (계획 시) |
| note | TEXT | Y | 비고 |
| file_group_id | VARCHAR(100) | Y | 첨부파일 |
| status | CHAR(1) | Y | T/A/C/R |
| ref_entity | VARCHAR(20) | Y | 참조 엔티티명 (계획→실적 연결) |
| ref_id | VARCHAR(20) | Y | 참조 ID |
| approval_id | VARCHAR(20) | Y | 결재 연동 ID |
| delete_mark~updated_by | | | 공통 필드 |

**inspection_item (상세항목)**

| 컬럼 | 타입 | NULL | 설명 |
|------|------|:----:|------|
| company_id + inspection_id + line_no | | N | **PK** |
| name | VARCHAR(100) | Y | 점검 항목명 |
| method | VARCHAR(100) | Y | 점검 방법 |
| min_val | DECIMAL(18,4) | Y | 최소 허용값 |
| max_val | DECIMAL(18,4) | Y | 최대 허용값 |
| std_val | DECIMAL(18,4) | Y | 기준값 |
| unit | VARCHAR(20) | Y | 단위 |
| result_val | DECIMAL(18,4) | Y | 실측값 (실적 입력 시) |

**관계**: inspection 1 : N inspection_item

---

#### work_order / work_order_item — 작업지시

**work_order (헤더)**

| 컬럼 | 타입 | NULL | 설명 |
|------|------|:----:|------|
| company_id + order_id | VARCHAR(20) | N | **PK** |
| plant_id, equipment_id | VARCHAR(20) | Y | 플랜트, 설비 FK |
| name | VARCHAR(100) | Y | 작업명 |
| stage | VARCHAR(20) | Y | PLN(계획) / ACT(실적) |
| code_item | VARCHAR(20) | Y | 작업 유형 (WO_TYPE 코드) |
| dept_id, person_id | VARCHAR(20) | Y | 부서, 담당자 |
| date | DATE | Y | 작업일 |
| **cost** | **DECIMAL(18,2)** | Y | **비용** (계획/실적 비교 핵심) |
| **time** | **DECIMAL(10,2)** | Y | **소요시간** (계획/실적 비교 핵심) |
| note | TEXT | Y | 비고 |
| file_group_id | VARCHAR(100) | Y | 첨부파일 |
| status | CHAR(1) | Y | T/A/C/R |
| ref_entity, ref_id | VARCHAR(20) | Y | 참조 문서 |
| approval_id | VARCHAR(20) | Y | 결재 연동 |
| delete_mark~updated_by | | | 공통 필드 |

**work_order_item (작업항목)**

| 컬럼 | 타입 | NULL | 설명 |
|------|------|:----:|------|
| company_id + order_id + line_no | | N | **PK** |
| name | VARCHAR(100) | Y | 항목명 |
| method | VARCHAR(100) | Y | 작업 방법 |
| result | TEXT | Y | 결과 |

---

#### work_permit / work_permit_item — 작업허가

**work_permit (헤더)**

| 컬럼 | 타입 | NULL | 설명 |
|------|------|:----:|------|
| company_id + permit_id | VARCHAR(20) | N | **PK** |
| plant_id, equipment_id | VARCHAR(20) | Y | 플랜트, 설비 FK |
| order_id | VARCHAR(20) | Y | 연관 작업지시 FK |
| name | VARCHAR(100) | Y | 허가서명 |
| stage | VARCHAR(20) | Y | PLN 기본 |
| **wp_types** | **VARCHAR(100)** | Y | **허가 유형 복수 선택** (예: "COM,HOT,CONF") |
| date | DATE | Y | 작업일 |
| start_dt | TIMESTAMP | Y | 작업 시작 시간 |
| end_dt | TIMESTAMP | Y | 작업 종료 시간 |
| location | VARCHAR(100) | Y | 작업 장소 |
| dept_id, person_id | VARCHAR(20) | Y | 부서, 담당자 |
| work_summary | TEXT | Y | 작업 개요 |
| hazard_factor | TEXT | Y | 위험 요인 |
| safety_factor | TEXT | Y | 안전 대책 |
| **checksheet_json_com** | **JSONB** | Y | **일반 체크리스트** |
| **checksheet_json_hot** | **JSONB** | Y | **화기작업 체크리스트** |
| **checksheet_json_conf** | **JSONB** | Y | **밀폐공간 체크리스트** |
| **checksheet_json_elec** | **JSONB** | Y | **전기작업 체크리스트** |
| **checksheet_json_high** | **JSONB** | Y | **고소작업 체크리스트** |
| **checksheet_json_dig** | **JSONB** | Y | **굴착작업 체크리스트** |
| file_group_id | VARCHAR(100) | Y | 첨부파일 |
| status | CHAR(1) | Y | T/A/C/R |
| parent_permit_id | VARCHAR(20) | Y | 상위 허가서 참조 (연관 추적) |
| approval_id | VARCHAR(20) | Y | 결재 연동 |
| delete_mark~updated_by | | | 공통 필드 |

> **JSONB 컬럼 설계 의도**: 허가 유형별 체크리스트 항목이 다르고, 사용자 정의가 필요하므로 유연한 스키마리스 저장 방식 채택. 프론트엔드 `wpTemplates.ts`에서 렌더링 템플릿 관리.

**work_permit_item (서명란)**

| 컬럼 | 타입 | NULL | 설명 |
|------|------|:----:|------|
| company_id + permit_id + line_no | | N | **PK** |
| sign_type | VARCHAR(20) | N | 서명 유형 (작업책임자, 안전관리자 등) |
| person_id | VARCHAR(20) | Y | 서명자 |
| name | VARCHAR(100) | Y | 서명자명 |
| signature | TEXT | Y | 서명 데이터 |
| signed_at | TIMESTAMP | Y | 서명 시각 |

---

### 3.4 재고관리 (Inventory Management)

#### inventory_stock — 재고 현황

| 컬럼 | 타입 | PK | NULL | 기본값 | 설명 |
|------|------|:--:|:----:|--------|------|
| company_id | VARCHAR(20) | ● | N | | 회사 코드 |
| storage_id | VARCHAR(20) | ● | N | | 창고 |
| bin_id | VARCHAR(20) | ● | N | | 구역 |
| location_id | VARCHAR(20) | ● | N | | 위치 |
| inventory_id | VARCHAR(20) | ● | N | | 자재 코드 |
| qty | DECIMAL(18,4) | | | 0 | 현재 수량 |
| amount | DECIMAL(18,2) | | | 0 | 현재 금액 |
| status | CHAR(1) | | Y | | 상태 |
| created_at~updated_by | | | | | 감사 필드 |

**PK**: `(company_id, storage_id, bin_id, location_id, inventory_id)` — 5개 복합키
**BaseEntity 미상속**: 재고 특성상 별도 감사필드 관리

---

#### inventory_history — 수불 이력

| 컬럼 | 타입 | PK | NULL | 설명 |
|------|------|:--:|:----:|------|
| company_id | VARCHAR(20) | ● | N | 회사 코드 |
| storage_id | VARCHAR(20) | ● | N | 창고 |
| bin_id | VARCHAR(20) | ● | N | 구역 |
| location_id | VARCHAR(20) | ● | N | 위치 |
| inventory_id | VARCHAR(20) | ● | N | 자재 코드 |
| history_id | VARCHAR(20) | ● | N | 이력 ID |
| tx_type | VARCHAR(20) | | Y | 거래 유형 |
| qty | DECIMAL(18,4) | | Y | 거래 수량 |
| amount | DECIMAL(18,2) | | Y | 거래 금액 |
| ref_entity | VARCHAR(20) | | Y | 참조 엔티티 |
| ref_id | VARCHAR(20) | | Y | 참조 ID |
| created_at | TIMESTAMP | | | CURRENT_TIMESTAMP | 거래일시 (=생성일시) |
| created_by | VARCHAR(50) | | Y | 처리자 |

**PK**: `(company_id, storage_id, bin_id, location_id, inventory_id, history_id)` — 6개 복합키

**tx_type 값**:

| 코드 | 의미 | 발생 시점 |
|------|------|-----------|
| IN | 입고 | 입고 처리 |
| OUT | 출고 | 출고 처리 |
| MOVE_OUT | 이동 출고 | 이동 시 출발지 |
| MOVE_IN | 이동 입고 | 이동 시 도착지 |
| ADJUST_IN | 실사 증가 | 실사 시 실재고 > 장부 |
| ADJUST_OUT | 실사 감소 | 실사 시 실재고 < 장부 |

---

#### inventory_closing — 월마감

| 컬럼 | 타입 | PK | NULL | 기본값 | 설명 |
|------|------|:--:|:----:|--------|------|
| company_id | VARCHAR(20) | ● | N | | 회사 코드 |
| storage_id | VARCHAR(20) | ● | N | | 창고 |
| inventory_id | VARCHAR(20) | ● | N | | 자재 코드 |
| yyyymm | VARCHAR(6) | ● | N | | 마감 연월 |
| in_qty / in_amount | | | | 0 | 입고 수량/금액 |
| out_qty / out_amount | | | | 0 | 출고 수량/금액 |
| move_qty / move_amount | | | | 0 | 이동 수량/금액 |
| adj_qty / adj_amount | | | | 0 | 조정 수량/금액 |
| end_qty / end_amount | | | | 0 | 기말 수량/금액 |
| status | CHAR(1) | | Y | | C=확정(수정불가) |
| created_at~updated_by | | | | | 감사 필드 |

**PK**: `(company_id, storage_id, inventory_id, yyyymm)`

---

### 3.5 결재 (Approval)

#### approval — 결재 문서

| 컬럼 | 타입 | PK | NULL | 설명 |
|------|------|:--:|:----:|------|
| company_id | VARCHAR(20) | ● | N | 회사 코드 |
| approval_id | VARCHAR(20) | ● | N | 결재 ID |
| title | VARCHAR(100) | | Y | 결재 제목 |
| content | TEXT | | Y | 결재 본문 (HTML) |
| requester_id | VARCHAR(20) | | Y | 기안자 ID |
| current_step | INTEGER | | | 1 | 현재 진행 단계 |
| file_group_id | VARCHAR(100) | | Y | 첨부파일 |
| status | CHAR(1) | | Y | T/A/C/R |
| ref_entity | VARCHAR(20) | | Y | 원문서 엔티티명 |
| ref_id | VARCHAR(20) | | Y | 원문서 ID |
| delete_mark~updated_by | | | | 공통 필드 |

**PK**: `(company_id, approval_id)`

#### approval_step — 결재선 (결재 단계)

| 컬럼 | 타입 | PK | NULL | 설명 |
|------|------|:--:|:----:|------|
| company_id | VARCHAR(20) | ● | N | 회사 코드 |
| approval_id | VARCHAR(20) | ● | N | 결재 ID |
| line_no | INTEGER | ● | N | 순번 (0=기안, 1~=결재자) |
| person_id | VARCHAR(20) | | Y | 결재자 ID |
| decision | VARCHAR(10) | | Y | 결재 유형 코드 |
| result | VARCHAR(10) | | Y | 처리 결과 |
| decided_at | TIMESTAMP | | Y | 처리 일시 |
| comment | TEXT | | Y | 의견 |

**PK**: `(company_id, approval_id, line_no)`

**decision 코드**:

| 코드 | 의미 |
|------|------|
| 00 (DRAFT) | 기안 |
| 01 (APPROVE) | 결재 |
| 02 (AGREE) | 합의 |
| 03 (NOTICE) | 참조/통보 |

**result 코드**:

| 코드 | 의미 |
|------|------|
| P (PENDING) | 미결/대기 |
| Y (APPROVED) | 승인 |
| N (REJECTED) | 반려 |

---

### 3.6 메모 (Memo)

#### memo — 운영 메모

| 컬럼 | 타입 | PK | NULL | 설명 |
|------|------|:--:|:----:|------|
| company_id | VARCHAR(20) | ● | N | 회사 코드 |
| memo_id | VARCHAR(20) | ● | N | 메모 ID |
| title | VARCHAR(100) | | Y | 제목 |
| content | TEXT | | Y | 내용 |
| file_group_id | VARCHAR(100) | | Y | 첨부파일 |
| status | CHAR(1) | | Y | T/C |
| ref_id | VARCHAR(20) | | Y | 참조 ID |
| is_notice | CHAR(1) | | | 'N' | 공지 여부 (Y=상단 고정) |
| approval_id | VARCHAR(20) | | Y | 결재 연동 (필요 시) |
| delete_mark~updated_by | | | | 공통 필드 |

**PK**: `(company_id, memo_id)`

#### memo_comment — 댓글

| 컬럼 | 타입 | PK | NULL | 설명 |
|------|------|:--:|:----:|------|
| company_id | VARCHAR(20) | ● | N | 회사 코드 |
| memo_id | VARCHAR(20) | ● | N | 메모 ID |
| comment_id | INTEGER | ● | N | 댓글 순번 |
| author_id | VARCHAR(20) | | Y | 작성자 ID |
| date | TIMESTAMP | | | CURRENT_TIMESTAMP | 작성일시 |
| content | TEXT | | Y | 댓글 내용 |

**PK**: `(company_id, memo_id, comment_id)`
**제약**: 1단계 댓글만 지원 (대댓글 없음), 본인 댓글만 삭제 가능

---

### 3.7 시스템/공통 (System & Common)

#### file_group / file_item — 첨부파일

**file_group (그룹)**

| 컬럼 | 타입 | PK | 설명 |
|------|------|:--:|------|
| company_id + file_group_id | VARCHAR | ● | 파일 그룹 ID (FG prefix) |
| ref_entity | VARCHAR(20) | | 참조 엔티티명 |
| ref_id | VARCHAR(20) | | 참조 ID |
| delete_mark~updated_by | | | 공통 필드 |

**file_item (파일)**

| 컬럼 | 타입 | PK | 설명 |
|------|------|:--:|------|
| company_id + file_group_id + line_no | | ● | 복합키 |
| original_name | VARCHAR(255) | | 원본 파일명 |
| stored_name | VARCHAR(255) | | 저장된 파일명 |
| ext | VARCHAR(10) | | 확장자 |
| mime | VARCHAR(100) | | MIME 타입 |
| size | BIGINT | | 파일 크기 (bytes) |
| checksum_sha256 | VARCHAR(64) | | SHA-256 체크섬 |
| storage_path | TEXT | | 저장 경로 |

---

#### sequence — 일련번호 채번

| 컬럼 | 타입 | PK | 기본값 | 설명 |
|------|------|:--:|--------|------|
| company_id | VARCHAR(20) | ● | | 회사 코드 |
| ref_entity | VARCHAR(20) | ● | | 엔티티명 (EQUIPMENT, INVENTORY 등) |
| date_key | VARCHAR(20) | ● | | 날짜키 (yyyyMM) |
| next_seq | BIGINT | | 1 | 다음 발행 번호 |

**PK**: `(company_id, ref_entity, date_key)`
**동작**: 채번 요청 시 next_seq 반환 후 +1 증가

---

#### refresh_token — 리프레시 토큰

| 컬럼 | 타입 | PK | 설명 |
|------|------|:--:|------|
| company_id | VARCHAR(20) | ● | 회사 코드 |
| person_id | VARCHAR(20) | ● | 사번 |
| token_value | VARCHAR(255) | | 토큰 값 (UUID) |
| expiry_date | TIMESTAMP | | 만료 일시 |

**PK**: `(company_id, person_id)` — 사용자당 1개의 Refresh Token만 유지
**Rotation**: 로그인/갱신 시 기존 토큰 삭제 후 신규 발급

---

## 4. 테이블 관계 요약

### 4.1 참조 관계 맵

```
company ──┬──► plant
          ├──► dept (self-ref: parent_id)
          ├──► role
          ├──► person ──► role, dept
          ├──► storage ──► bin ──► location
          ├──► code ──► code_item
          │
          ├──► equipment ──► plant, dept
          ├──► inventory ──► dept
          │
          ├──► inspection ──► plant, equipment, dept, person, approval
          │    └──► inspection_item
          ├──► work_order ──► plant, equipment, dept, person, approval
          │    └──► work_order_item
          ├──► work_permit ──► plant, equipment, work_order, dept, person, approval
          │    └──► work_permit_item
          │
          ├──► inventory_stock ──► storage, bin, location, inventory
          ├──► inventory_history ──► storage, bin, location, inventory
          ├──► inventory_closing ──► storage, inventory
          │
          ├──► approval ──► person(requester)
          │    └──► approval_step ──► person(approver)
          │
          ├──► memo
          │    └──► memo_comment
          │
          ├──► file_group
          │    └──► file_item
          ├──► sequence
          └──► refresh_token ──► person
```

### 4.2 ref_entity / ref_id 연동 패턴

여러 테이블에서 `ref_entity`와 `ref_id` 컬럼 조합으로 **다형성 참조(Polymorphic Reference)** 를 구현합니다:

| 사용 테이블 | ref_entity 값 예시 | 설명 |
|-------------|-------------------|------|
| approval | INSPECTION, WORK_ORDER, WORK_PERMIT, MEMO | 결재 원문서 참조 |
| inspection | INSPECTION | 계획→실적 연결 |
| work_order | WORK_ORDER | 계획→실적 연결 |
| inventory_history | WORK_ORDER, MOVE | 재고 이력의 원인 문서 |
| file_group | EQUIPMENT, INSPECTION, ... | 파일 소속 엔티티 |

---

## 5. 데이터 정책 요약

| 정책 | 내용 |
|------|------|
| **Soft Delete** | `delete_mark='Y'` — 물리 삭제 없음 |
| **감사 추적** | BaseEntity 상속 엔티티: created_at/by, updated_at/by 자동 기록 |
| **멀티 테넌시** | 모든 PK에 company_id 포함 — 회사 간 완전 격리 |
| **상태 관리** | T→A→C/R 공통 라이프사이클 |
| **토큰 보안** | Refresh Token: DB 저장 + 사용자당 1개 + 사용 시 회전(Rotation) |
| **일련번호** | sequence 테이블 기반 자동 채번 (PREFIX + yyyyMM + seq6) |
| **JSONB 활용** | 작업허가 체크리스트 — 유형별 유연한 스키마 저장 |
