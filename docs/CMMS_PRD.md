# CMMS 개발 제품 요구사항 문서 (PRD)

## 1. 개요 (Overview)
본 프로젝트는 설비 유지보수 프로세스를 디지털화하여 체계적으로 관리하고, 설비 가동률 극대화 및 유지보수 비용 절감을 목표로 하는 **CMMS(Computerized Maintenance Management System)** 개발을 목적으로 합니다.

## 2. 기술 스펙 및 버전 (Technical Stack & Versions)
최신 LTS 및 안정화 버전을 기준으로 개발 환경을 구성합니다.

*   **Language**: Java 21 LTS
*   **Framework**: Spring Boot 3.3.x (Java 21 호환)
*   **Frontend Env**: Node.js v22.22.0, NPM v10.9.4
*   **Frontend Lib**: React v19.2.4, Tailwind CSS
*   **Database**: PostgreSQL 15.x 이상 (JSONB 지원 및 최적화). 단, 개발 단계에서는 H2 Database 활용 가능
*   **Naming Rule**: 
    *   **Database**: `snake_case`
    *   **Backend**: `camelCase` (Internal & API JSON Strategy)
    *   **Frontend**: `camelCase` (Data Types/API & UI Logic)
    *   **API Endpoints**: 
        *   회원/사(Company): `/api/v1/companies`
        *   기준정보(Standard Info): `/api/v1/std` (플랜트, 부서, 사용자, 코드 등)
        *   마스터(Master Data): `/api/v1/master` (설비 등)
        *   재고/자재(Inventory): `/api/v1/inv` (마스터 외 수불, 마감 등)
        *   트랜잭션(Transaction): `/api/v1/tx` (점검, 작업지시, 작업허가 등)
*   **Security**: 백엔드는 Spring Security와 JWT(JSON Web Token)를 이용하여 무상태(Stateless) API 접근 제어를 수행하고, 프론트엔드는 발급받은 JWT와 사용자 정보를 Zustand로 메모리에서 안전하게 관리하며 API 호출 시마다 Authorization 헤더(Bearer 토큰)에 실어 보낸다.

## 3. 기능 분류 및 화면 흐름 정책
데이터의 성격에 따라 사용자의 접근 방식과 화면 흐름(Flow)을 차별화합니다.
삭제는 소프트삭제로 처리하며, 마스터 정보나 트랜잭션 정보는 감사필드 기능을 관리한다.
### A. 기준 정보 (Standard Information)
*   **대상**: Company, Plant, Dept, Person, Role, Code
*   **특징**: 시스템 초기 설정 시 관리자만 주로 사용. soft delete 적용하며 감사필드없음
*   **화면 흐름**: 목록(List) → 수정(Edit Form)
    *   별도의 조회(Read-only) 화면 없이, 목록에서 항목 클릭 시 바로 수정 가능한 폼으로 이동하여 신속한 관리 지원. 등록과 수정 화면은 동일한 폼을 사용하고, 저장/목록/삭제 버튼만 존재.

### B. 마스터 정보 (Master Data)
*   **대상**: Equipment, Inventory
*   **특징**: 일반 사용자의 단순 조회 빈도가 높음. 오입력 방지를 위해 조회와 수정을 분리. soft delete 적용하며 감사필드있음
*   **화면 흐름**: 목록(List) → 조회(View) → 수정(Edit)
    *   목록 클릭 시 '읽기 전용' 화면으로 진입.
    *   등록 화면에는 저장/목록 버튼, 수정 화면에는 저장/목록/삭제 버튼, 조회 화면에는 수정/목록 버튼. 

### C. 트랜잭션 정보 (Transaction Data)
*   **대상**: Inspection, Work Order, Work Permit
*   **특징**: 업무의 진행 상태(Status) 관리가 핵심. soft delete 적용하며 감사필드있음
*   **화면 흐름**: 목록(List) → 조회(View) → 수정(Edit)
    *   목록 클릭 시 '읽기 전용' 화면으로 진입.
    *   등록 화면에는 저장(임시)/확정(완료)/상신(결재)/목록 버튼, 수정 화면에는 저장(임시)/확정(완료)/상신(결재)/목록/삭제 버튼, 조회 화면에는 수정/목록/출력 버튼.
*   **상태(Status) 코드**:
    *   **T (Temporary)**: 임시저장 (수정/삭제 가능)
    *   **A (Approval)**: 결재 진행 중 (수정/삭제 불가)
    *   **C (Confirm)**: 확정 완료 (최종 상태)
*   **버튼**:
    *   **저장(임시)**: 상태를 T로 저장. 필수값 체크를 완화하여 작성 중 저장 허용.
    *   **확정(완료)**: (팀장급 권한) 결재 절차 없이 즉시 완료 처리. 상태를 C로 변경.
    *   **상신(결재)**: 전자결재를 요청함. 상태를 A로 변경하며, 이후 수정 불가.
    *   **삭제**: 작성자 본인만 가능하며, 상태가 T(임시)일 때만 노출.
    *   **목록**: 목록 화면으로 복귀.
    *   **수정**: 편집 모드로 전환.
    *   **출력**: 출력 화면으로 이동.
*   **작업허가 템플릿**: `\frontend\src\constants\wpTemplates.ts` 참조

### D. 결재 (Approval)
*   **대상**: Approval, Approval Step
*   **특징**: 문서 의사결정 프로세스 관리 및 추적.
*   **화면 흐름**:
    *   **기안 작성**: 트랜잭션 문서(WO, WP 등) 연동 또는 별도 기안 작성.
    *   **상신함**: 본인이 기안한 문서의 상태(T:임시저장, A:결재중, C:완결, R:반려) 관리.
    *   **결재함**: 결재선(Step) 정보를 참조하여 본인이 처리할 문서 조회.
        *   구분: **미결**(결재함), **기결**(기결함), **반려**(반려함), **참조**(통보/참조함)로 필터링 가능.
    *   **결재 처리**: 본인 차례인 경우 상세 화면에서 **결재/반려** 버튼 활성화 및 코멘트 입력.

### E. 메모 (Memo / Notice)
*   **대상**: Memo
*   **특징**: 당일 운영 현황 및 발생 문제를 전파하기 위한 용도. (자유게시판 아님)
*   **요구사항**: 
    *   **공유 중시**: 작성 시 임시저장, 확정 버튼을 두고 확정(status=C)는 접속자가 작성자와 동일하여도 수정이나 삭제 불가
    *   **댓글 기능**: 공유된 내용에 대해 1단계 댓글을 통한 추가 정보 및 조치 현황 기록.본인인 경우 삭제 가능.
    *   **수정 불가**: 신뢰성 있는 현황 기록을 위해 **수정이 불가**하며, 변경이 필요한 경우 추가 댓글이나 신규 메모로 작성.
    *   **삭제**: 원칙은 불가하나 특정 조건하(관리자)에 제한적으로 허용.

### F. 대시보드 (Dashboard)
*   **대상**: 당월 종합 현황 밀도 요약 (Summary & Calendar Base)
*   **특징**: 시스템 접속 시 가장 먼저 노출되는 첫 화면으로, 플랜트(사업장)의 유지보수 활동(PM, WO, WP) 성과율과 일정을 한눈에 제공
*   **화면 구성**:
    *   **상단 요약 카드 (Summary Cards)**:
        *   **당월 예방점검(PM) 실적**: 완료/계획 건수 및 달성률(%)
        *   **당월 작업지시(WO) 실적**: 완료/계획 건수 및 조치율(%)
        *   **당월 작업허가(WP) 건수**: 승인 완료 건수 및 총 신청 건수
    *   **일정 캘린더 (Calendar)**: 
        *   FullCalendar 기반으로 한 눈에 당월 일정 관리. 
        *   탭으로 기능(예방점검, 작업지시, 작업허가)을 전환하며, 계획(Plan)/단순신청건과 완료(Actual)/승인건의 색상을 구분하여 시각화.
    *   **설비별 TOP 5 통계 (Bar Chart)**:
        *   **작업지시 TOP 5**: 설비별 건수, 발생 비용, 소요 시간 기준(Select 박스) 랭킹
        *   **작업허가 TOP 5**: 설비별 허가 건수 기준 랭킹
*   **주요 로직**:
    *   **플랜트/날짜 기반 조회**: 당월(`yyyy-MM`)을 기준으로 데이터를 서버 사이드에서 통계/집계 및 캘린더 이벤트로 가공 반환
    *   **다이렉트 라우팅**: 캘린더의 각 이벤트를 클릭 시, 해당 문서의 튜플 ID를 가지고 해당하는 모듈의 상세 화면(`/:module/.../:id`)으로 즉시 이동

---

## 4. 공통 상태(Status) 코드 체계
트랜잭션 및 결재 등 문서의 진행 상태를 나타내는 공통 코드 체계입니다.
*   **T (Temporary)**: 임시저장 (작성자 수정/삭제 가능)
*   **A (Approval)**: 상신 / 결재 진행 중 (수정/삭제 불가)
*   **C (Confirm)**: 승인 / 확정 완료 (최종 상태, 수정 불가)
*   **R (Reject)**: 반려 (반려사유 확인 및 재기안(T 상태로 복귀) 가능)
*   **X (Cancel)**: 취소 / 폐기

---

## 5. 상세 기능 요구사항 (Detailed Functional Requirements)
기준정보(Standard Info)는 Base entity를 상속하지 않고 `delete_mark`를 통해 soft delete 처리하며, 마스터 데이터나 트랜잭션, 결재, 메모는 Base entity를 상속하여 감사필드(`created_at`, `updated_by` 등) 기능을 구현한다. 
Inventory_history, Inventory_closing, Inventory_stock는 Base entity를 상속하지 않고 별도로 관리한다. 
### 5.1 기준정보 관리
*   다단계 부서 구조(Parent-Child) 및 플랜트/사이트 관리.
*   사용자 및 역할 기반 권한 관리 (페이지별 CRUD 권한).
*   공통 코드 관리 (헤더-아이템 구조).
(예시)
설비유형 (EQ_TYPE): MECH(기계), ELEC(전기), INST(계장), UTIL(유틸리티)
자재유형 (MAT_TYPE): SPARE(예비품), CONS(소모품), TOOL(공구)
점검유형 (INSP_TYPE): PATROL(순찰), MEASURE(계측), PM(예방정비)
작업유형 (WO_TYPE): BM(고장), PM(예방), CM(개량), EM(긴급)
허가유형 (WP_TYPE): HOT(화기), CONF(밀폐), ELEC(전기), HIGH(고소) 등
### 5.2 마스터정보 관리
*   설비 마스터 등록, 수정, 삭제 및 상태 관리: 기준정보(번호,이름, 위치, 분류코드, 부서, 담당자 등), 제조사정보(메이커, 시리얼, 모델 등), 재무정보(상각법, 설치일, 취득가, 잔존가 등), 운영정보(점검대상여부, PSM대상여부, 예방점검대상여부, 점검주기, 주기단위, 마지막 점검일, 다음 점검일 등), 기타(비고, 첨부 등)
*   재고 마스터 등록, 수정, 삭제 및 상태 관리: 기준정보(번호,이름, 위치, 분류코드, 부서, 단위 등), 제조사정보(메이커, 시리얼, 모델 등), 기타(비고, 첨부 등)

### 5.3 예방점검 관리 
*   예방점검 계획 등록 (Stage = PLN), 결재 상신 처리(T->A->C)
*   예방점검 실적 등록 (Stage = ACT), 결재 상신 처리(T->A->C)
    원칙은 계획을 기반으로 실적 등록하며, 계획 떄 입력한 점검 항목을 기준으로 실측 값 입력 하므로 계획정보의 item 값을 실적 기본값으로 가져와야 함
    동일한 점검 계획을 기반으로 다수의 실적을 입력할 수 있고 계획 없이도 입력 가능함 (예: 2026 설비 A의 연간 점검 계획 --> 월 별 실적 입력, 불시 점검 등록 등. 1:N구조 )

### 5.4 작업지시 관리
*   작업지시 계획 등록 (Stage = PLN), 결재 상신 처리(T->A->C)
*   작업지시 실적 등록 (Stage = ACT), 결재 상신 처리(T->A->C)
    작업지시는 별도의 예산 확보가 중요하고 계약 기초 자료이므로 계획을 기반으로 실적을 입력하며, 계획 cost, time 대비 실적 cost, time 분석을 위해 관리하는 목적임

### 5.5 작업허가 관리
*   작업허가 계획 등록 (Stage = PLN), 결재 상신 처리(T->A->C)    
    별도의 실적은 사용자 선택 사항이며, 허가서는 일반을 기본으로 하고 고소, 밀폐, 굴착, 화기 등 항목별로 별도로 작성해야 하므로 사용자가 선택을 하고 그에 맞는 양식을 만들 수 있도록 사용자 정의가 가능해야 함

### 5.6 부품 및 재고 관리
*   부품 마스터 관리 및 3단계 위치 관리(창고-스토리지빈-로케이션).
*   입/출고, 이동, 조정 이력 관리 및 월마감(Closing) 기능.
*   최소/최대 재고 알림.

### 5.7 결재 및 공통
*   문서별 결재 프로세스(결재, 합의, 통보) 연동.
*   첨부파일 그룹 관리 및 일련번호(Sequence) 자동 생성.

### 5.8 TM 메모 관리
*   게시판 형태로 당일 운영 현황을 기록하고 부서 내 공유가 가능하도록 함. 첨부와 1단계 댓글기능 추가 
---

## 6. 프로젝트 디렉토리 구조 (Proposed)
```
cmms/
├── backend/ (Spring Boot)
│   ├── src/main/java/com/cmms/
│   │   ├── domain/ (Entities)
│   │   ├── repository/
│   │   ├── service/
│   │   ├── controller/ (API Endpoints)
│   │   └── common/ (Security, Config, Utils)
│   └── src/main/resources/
├── frontend/ (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/ (API Calls)
│   │   └── store/ (State Management)
├── mobile/ (React Native)
└── docs/
    ├── CMMS_PRD.md
    ├── CMMS_TABLES.md
    └── CMMS_UI.md
```

## 7. 기술적 특이사항 (Technical Specifics)

### 7.1 일련번호 규칙
*   **포맷**: `{PREFIX}{YYYYMM}{SEQ}` (총 14자리)
*   **구성**: Prefix(2자리) + 년월(6자리) + 일련번호(6자리)
*   **Prefix 정의**:
    *   설비: `EQ` (예: `EQ202402000001`)
    *   자재: `MT`
    *   점검: `IN`
    *   작업지시: `WO`
    *   작업허가: `WP`
    *   파일그룹: `FG`

### 7.2 보안 및 데이터 정책
*   **보안 (Security)**: 
    *   역할 기반 접근 제어(RBAC)
    *   비밀번호 단방향 해싱(BCrypt)
    *   무상태(Stateless) JWT 기반 인증
*   **데이터 무결성 및 추적 (Data Policy)**: 
    *   **공통 삭제 정책**: 모든 삭제는 Soft Delete(`delete_mark = 'Y'`) 처리 원칙.
    *   **BaseEntity (감사 필드)**: 마스터 데이터 트랜잭션 등 데이터 중요도가 높은 엔티티는 통합 BaseEntity를 상속하여 생성자(`created_by`), 생성일(`created_at`), 수정자(`updated_by`), 수정일(`updated_at`)을 자동 기록함 (기준정보 제외).
