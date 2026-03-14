# CMMS 기술사용서 (Technical Guide)

> 본 문서는 CMMS(설비유지보수관리시스템)의 전체 아키텍처, 모듈별 동작 원리, 핵심 설계 패턴을 설명합니다.
> 신규 개발자가 시스템 전체 구조를 빠르게 파악할 수 있도록 핵심 위주로 기술합니다.

---

## 1. 시스템 개요

### 1.1 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| **Backend** | Spring Boot + JPA | 3.4.0 / Java 21 |
| **Frontend** | React + TypeScript + Vite | React 19 / Vite 7 |
| **상태관리** | Zustand | 5.x |
| **UI 프레임워크** | Tailwind CSS + shadcn/ui | 4.x |
| **Database** | PostgreSQL (Neon Cloud) | 15.x+ |
| **인증** | JWT + Refresh Token (HttpOnly Cookie) | JJWT 0.12.3 |
| **Excel** | Apache POI | 5.2.5 |
| **차트** | Recharts + FullCalendar | - |

### 1.2 프로젝트 구조 요약

```
cmms/
├── backend/                          # Spring Boot API Server (port 8080)
│   └── src/main/java/com/cmms/
│       ├── common/                   # 공통 모듈 (BaseEntity, Security, Enum, Converter)
│       ├── config/                   # SecurityConfig, WebConfig
│       ├── controller/               # REST API Endpoints
│       ├── domain/                   # JPA Entity 클래스
│       ├── dto/                      # Request/Response DTO
│       ├── repository/               # JPA Repository
│       ├── security/                 # JWT Filter, Token Provider
│       └── service/                  # 비즈니스 로직
│
├── frontend/                         # React SPA (dev port 3000 → proxy → 8080)
│   └── src/
│       ├── components/               # layout(Header,Sidebar), common(ErrorBoundary 등), ui(shadcn)
│       ├── pages/                    # 화면별 페이지 컴포넌트
│       ├── services/                 # API 호출 레이어
│       ├── store/                    # Zustand 전역 상태 (useUiStore)
│       ├── features/auth/            # 인증 상태 (useAuthStore)
│       ├── constants/                # 상태코드, WP 템플릿
│       ├── types/                    # TypeScript 인터페이스
│       └── utils/                    # Axios 인스턴스, 유틸리티
│
└── docs/                             # 프로젝트 문서
```

### 1.3 멀티 테넌시 설계

모든 엔티티의 PK에 `company_id`가 포함된 **복합키(Composite Key)** 구조로, 회사 간 데이터가 완전히 격리됩니다.

```
PK 예시: (company_id, person_id), (company_id, equipment_id), ...
```

- 백엔드에서 `SecurityUtil.validateCompanyId()`로 JWT의 회사 정보와 요청 데이터의 company_id 일치 여부를 검증
- 모든 쿼리에 company_id 필터 자동 적용

---

## 2. 인증 및 보안 (Authentication & Security)

### 2.1 인증 아키텍처

```
┌─────────────┐                    ┌──────────────┐
│  Frontend   │                    │   Backend    │
│  (React)    │                    │ (Spring Boot)│
├─────────────┤                    ├──────────────┤
│ Access Token│◄── JWT 발급 ──────│ JwtProvider  │
│ (Zustand +  │                    │              │
│  localStorage)                   │              │
│             │                    │              │
│ Refresh Token ── HttpOnly ──────►│ DB 저장      │
│ (Cookie)    │    Cookie          │ (refresh_token│
│             │                    │  테이블)      │
└─────────────┘                    └──────────────┘
```

### 2.2 로그인 플로우

```
1. POST /api/auth/login  {companyId, personId, password}
2. 서버: BCrypt 비밀번호 검증 → JWT Access Token 생성 (12시간)
3. 서버: Refresh Token 생성 → DB 저장 + HttpOnly Cookie 설정 (7일)
4. 서버: 로그인 메타데이터 기록 (lastLoginAt, lastLoginIp, lastLoginPlantId)
5. 응답: {accessToken, person정보, previousLoginAt, previousLoginIp}
6. 프론트: accessToken → Zustand(메모리) + localStorage 저장
7. 프론트: 이전 접속 정보 표시 (보안 알림 용도)
```

### 2.3 Silent Refresh (자동 토큰 갱신)

```
API 호출 → 401 응답 수신
  ↓
Axios Response Interceptor 감지
  ↓
POST /api/auth/refresh (withCredentials: true, Cookie 자동 전송)
  ↓
서버: Refresh Token 검증 → 새 Access Token + 새 Refresh Token 발급 (Rotation)
  ↓
실패한 원래 요청을 새 토큰으로 재시도
  ↓
(Refresh도 실패 시 → logout + /login 리다이렉트)
```

**동시 요청 처리**: 여러 API가 동시에 401을 받으면, 첫 번째만 refresh를 실행하고 나머지는 큐에 대기 → refresh 완료 후 일괄 재시도

### 2.4 Spring Security 설정

```
공개 엔드포인트 (인증 불필요):
  /api/auth/**            ← 로그인, 리프레시, 로그아웃
  GET /api/v1/companies/** ← 회사 조회 (로그인 화면에서 사용)
  /api/sys/files/**       ← 파일 다운로드

보호 엔드포인트:
  그 외 모든 /api/** 요청 → JwtAuthenticationFilter → 토큰 검증 필수
```

- CSRF: 비활성 (Stateless API)
- Session: STATELESS
- CORS: `app.cors.allowed-origins` 설정 기반

### 2.5 JWT 토큰 구조

```json
{
  "sub": "companyId:personId",
  "companyId": "C001",
  "personId": "admin",
  "iat": 1709856000,
  "exp": 1709899200
}
```
- 알고리즘: HMAC SHA256
- Subject 형식: `companyId:personId` (콜론 구분)

---

## 3. 공통 모듈 (Core & Common)

### 3.1 BaseEntity (감사 필드 + Soft Delete)

모든 주요 엔티티가 상속하는 추상 클래스:

```java
@MappedSuperclass
public abstract class BaseEntity {
    private String deleteMark = "N";    // Soft Delete ('Y'이면 삭제 처리)

    @CreatedDate
    private LocalDateTime createdAt;     // 생성일시 (자동)
    @CreatedBy
    private String createdBy;            // 생성자 (JWT에서 자동 추출)
    @LastModifiedDate
    private LocalDateTime updatedAt;     // 수정일시 (자동)
    @LastModifiedBy
    private String updatedBy;            // 수정자 (JWT에서 자동 추출)
}
```

**적용 제외**: `inventory_stock`, `inventory_history`, `inventory_closing` (도메인 특성상 별도 관리)

### 3.2 공통 상태 코드 (CommonStatus)

| 코드 | 의미 | 수정 가능 | 삭제 가능 |
|------|------|-----------|-----------|
| **T** | 임시저장 (Temporary) | O | O (작성자만) |
| **A** | 결재중 (Approval) | X | X |
| **C** | 확정 (Confirmed) | X | X |
| **R** | 반려 (Rejected) | △ 재기안 | X |
| **X** | 취소 (Canceled) | X | X |

### 3.3 Soft Delete 패턴

```java
// 조회: delete_mark = 'N'인 것만 반환
repository.findAllByCompanyIdAndDeleteMark(companyId, "N");

// 삭제: 실제 삭제 대신 마킹
entity.setDeleteMark("Y");
repository.save(entity);
```

### 3.4 일련번호 생성 규칙

```
포맷: {PREFIX}{YYYYMM}{SEQ 6자리}  (총 14자리)
예시: EQ202603000001, WO202603000012

PREFIX 정의:
  EQ: 설비    MT: 자재    IN: 점검
  WO: 작업지시  WP: 작업허가  FG: 파일그룹
```

`sequence` 테이블에서 `(company_id, ref_entity, date_key)` 기준으로 자동 채번

### 3.5 프론트엔드 공통 패턴

#### 전역 로딩 (Global Loading)

```
API 요청 시작 → Axios Request Interceptor → useUiStore.setLoading(true) → 로딩 카운터 증가
API 응답 수신 → Axios Response Interceptor → useUiStore.setLoading(false) → 로딩 카운터 감소
카운터 > 0 → GlobalLoading 컴포넌트 표시 (전역 오버레이)
```

동시 다중 요청 시에도 카운터 기반으로 마지막 응답이 올 때까지 로딩 유지

#### Error Boundary

최상위 `ErrorBoundary` 컴포넌트가 런타임 에러를 캐치하여 사용자 친화적 에러 페이지 제공 (새로고침/홈 이동 버튼)

#### 주요 공통 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `SearchableSelect` | 부서, 담당자, 설비 등 검색 가능한 드롭다운 |
| `FileAttachment` | file_group 기반 파일 업로드/다운로드 |
| `ExcelUploadModal` | Excel 업로드 모달 (템플릿 다운로드, 결과 표시) |
| `RichTextEditor` | TipTap 기반 리치텍스트 에디터 (테이블, 서식) |
| `*Print` | 점검/작업지시/작업허가/결재 인쇄용 컴포넌트 |

---

## 4. API 엔드포인트 구조

### 4.1 엔드포인트 체계

```
/api/auth/**          ← 인증 (login, refresh, logout)
/api/v1/companies/**  ← 회사 정보
/api/std/**           ← 기준정보 (plant, dept, person, role, code, storage, bin, location)
/api/master/**        ← 마스터정보 (equipment, inventory) + Excel 업/다운로드
/api/tx/**            ← 트랜잭션 (inspection, work-order, work-permit)
/api/inv/**           ← 재고관리 (stock, history, closing, transaction)
/api/approval/**      ← 결재 (inbox, outbox, decision)
/api/memo/**          ← 메모 + 댓글
/api/v1/dashboard/**  ← 대시보드 (summary, calendar, top5)
/api/sys/**           ← 시스템 (파일 업로드/다운로드)
```

### 4.2 주요 API 상세

#### 인증 (`/api/auth`)
| Method | Path | 설명 |
|--------|------|------|
| POST | `/login` | 로그인 |
| POST | `/refresh` | 토큰 갱신 |
| POST | `/logout` | 로그아웃 |
| PUT | `/plant` | 접속 플랜트 변경 |

#### 기준정보 (`/api/std`)
| Method | Path | 설명 |
|--------|------|------|
| GET/POST | `/plants` | 플랜트 목록/등록 |
| GET/PUT/DELETE | `/plants/{id}` | 플랜트 조회/수정/삭제 |
| GET/POST | `/depts` | 부서 목록/등록 |
| GET/POST | `/persons` | 사용자 목록/등록 |
| PUT | `/persons/{id}/password` | 비밀번호 변경 |
| GET/POST | `/roles` | 역할 목록/등록 |
| GET/POST | `/codes` | 공통코드 목록/등록 |
| GET/POST | `/codes/{id}/items` | 코드 아이템 목록/등록 |
| GET/POST | `/storages`, `/bins`, `/locations` | 창고/빈/위치 관리 |

#### 마스터정보 (`/api/master`)
| Method | Path | 설명 |
|--------|------|------|
| GET/POST | `/equipment` | 설비 목록/등록·수정 |
| GET/DELETE | `/equipment/{id}` | 설비 조회/삭제 |
| POST | `/equipment/upload` | 설비 Excel 업로드 |
| POST | `/equipment/download` | 설비 Excel 다운로드 |
| GET/POST | `/inventory` | 자재 목록/등록·수정 |
| POST | `/inventory/upload`, `/inventory/download` | 자재 Excel 처리 |

#### 트랜잭션 (`/api/tx`)
| Method | Path | 설명 |
|--------|------|------|
| GET/POST | `/inspections` | 점검 목록/등록·수정 |
| GET/DELETE | `/inspections/{id}` | 점검 조회/삭제 |
| GET/POST | `/work-orders` | 작업지시 목록/등록·수정 |
| GET/DELETE | `/work-orders/{id}` | 작업지시 조회/삭제 |
| GET/POST | `/work-permits` | 작업허가 목록/등록·수정 |
| GET/DELETE | `/work-permits/{id}` | 작업허가 조회/삭제 |

#### 결재 (`/api/approval`)
| Method | Path | 설명 |
|--------|------|------|
| GET | `/outbox` | 상신함 (내가 기안한 문서) |
| GET | `/inbox?type=pending\|completed\|reference` | 결재함 (미결/기결/참조) |
| GET | `/{id}` | 결재 상세 |
| GET | `/{id}/steps` | 결재선 상세 (결재자 정보 포함) |
| POST | `/` | 결재 저장/상신 |
| POST | `/decision` | 결재 처리 (승인/반려) |

#### 재고관리 (`/api/inv`)
| Method | Path | 설명 |
|--------|------|------|
| GET/POST | `/stocks` | 재고현황 목록/등록 |
| POST | `/transactions` | 수불 처리 (입고/출고/이동/조정) |
| GET/POST | `/history` | 수불 이력 |
| GET/POST | `/closings` | 월마감 처리 |

#### 대시보드 (`/api/v1/dashboard`)
| Method | Path | 설명 |
|--------|------|------|
| GET | `/summary?month=yyyyMM` | 당월 요약 (PM/WO/WP 실적) |
| GET | `/calendar/inspection?month=yyyyMM` | 점검 캘린더 이벤트 |
| GET | `/calendar/work-order?month=yyyyMM` | 작업지시 캘린더 이벤트 |
| GET | `/calendar/work-permit?month=yyyyMM` | 작업허가 캘린더 이벤트 |
| GET | `/wo-top5?year=yyyy&criteria=count\|cost` | 설비별 작업지시 TOP5 |
| GET | `/wp-top5?year=yyyy&criteria=count` | 설비별 작업허가 TOP5 |

---

## 5. 기준정보 모듈 (Standard Information)

### 5.1 대상 엔티티

Company, Plant, Dept, Person, Role, Code(+CodeItem), Storage, Bin, Location

### 5.2 화면 흐름

```
목록(List) ──클릭──► 수정 폼(Edit Form)
                     [저장] [목록] [삭제]
```

별도 조회(View) 화면 없이, 목록에서 바로 수정 폼으로 이동하는 **빠른 관리 패턴**

### 5.3 핵심 특징

- **공통코드**: 헤더-아이템 Master-Detail 구조 (좌: 코드 헤더, 우: 코드 아이템)
- **부서**: 다단계 Parent-Child 트리 구조 (`parent_id` 참조)
- **사용자(Person)**: 비밀번호 BCrypt 해싱, 역할(`role_id`) 기반 권한
- **창고 위치**: Storage → Bin → Location 3단계 계층 구조

### 5.4 주요 코드 분류

| 코드 그룹 | 항목 예시 | 용도 |
|-----------|-----------|------|
| EQ_TYPE | MECH, ELEC, INST, UTIL | 설비 유형 |
| MAT_TYPE | SPARE, CONS, TOOL | 자재 유형 |
| INSP_TYPE | PATROL, MEASURE, PM | 점검 유형 |
| WO_TYPE | BM, PM, CM, EM | 작업 유형 |
| WP_TYPE | HOT, CONF, ELEC, HIGH | 허가 유형 |

---

## 6. 마스터정보 모듈 (Master Data)

### 6.1 대상 엔티티

Equipment (설비), Inventory (자재)

### 6.2 화면 흐름

```
목록(List) ──클릭──► 조회(View) ──수정 버튼──► 수정(Edit)
                     [수정] [목록]              [저장] [목록] [삭제]
```

오입력 방지를 위해 **조회와 수정을 분리**

### 6.3 설비 마스터 (Equipment)

| 정보 그룹 | 주요 필드 |
|-----------|-----------|
| 기준정보 | equipment_id, name, plant_id, dept_id, install_location, code_item(유형) |
| 제조사정보 | maker_name, model, serial, spec |
| 재무정보 | purchase_cost, residual_value, depre_method, depre_period, install_date |
| 운영정보 | inspection_yn, psm_yn, workpermit_yn, inspection_interval/unit, last/next_inspection |

### 6.4 자재 마스터 (Inventory)

기준정보(번호, 이름, 유형, 단위, 부서) + 제조사정보 + 현재고 요약(재고 테이블 Join)

### 6.5 Excel 일괄 처리

- **업로드**: Excel 파일 → 서버 파싱 → 일괄 등록/수정 (결과: 성공/실패 건수 + 오류 상세)
- **다운로드**: 조회 데이터 → Excel 파일 생성 → 다운로드

---

## 7. 트랜잭션 모듈 (Transaction)

### 7.1 대상 엔티티

Inspection (예방점검), WorkOrder (작업지시), WorkPermit (작업허가)

### 7.2 공통 화면 흐름

```
목록(List) ──클릭──► 조회(View) ──수정 버튼──► 수정(Edit)
                     [수정] [목록] [출력]       [임시저장] [확정] [상신] [목록] [삭제]
```

### 7.3 상태 관리 (Status Lifecycle)

```
        ┌──── 확정(팀장) ────►  C (확정/완료)
        │
T (임시) ─┤
        │                      ┌──► C (확정)
        └──── 상신(결재) ──► A (결재중) ─┤
                                        └──► R (반려) ──► 재기안 가능
```

| 버튼 | 동작 | 조건 |
|------|------|------|
| 임시저장 | status = T, 필수값 체크 완화 | 작성자 |
| 확정(완료) | status = C, 결재 없이 즉시 완료 | 팀장급 권한 |
| 상신(결재) | status = A, 결재선 지정 후 상신 | 작성자 |
| 삭제 | soft delete | 작성자 본인 + status = T일 때만 |
| 출력 | 인쇄용 화면 이동 | 조회 모드에서만 |

### 7.4 예방점검 (Inspection)

- **Stage**: PLN (계획) / ACT (실적)
- **계획-실적 관계**: 1:N (하나의 연간 계획에 월별 실적 다수 입력 가능)
- **실적 등록 시**: 계획의 점검 항목(inspection_item)을 기본값으로 가져옴
- **점검 항목**: 항목명, 점검방법, 최소/최대/기준값, 단위 → 실측값 입력

### 7.5 작업지시 (WorkOrder)

- **Stage**: PLN (계획) / ACT (실적)
- **핵심 관리 항목**: cost(비용), time(소요시간) — 계획 대비 실적 분석용
- **계획 기반 실적**: 예산 확보와 계약 기초 자료 목적

### 7.6 작업허가 (WorkPermit)

- **Stage**: PLN 기본 (실적은 선택 사항)
- **허가 유형**: 일반(COM), 화기(HOT), 밀폐(CONF), 전기(ELEC), 고소(HIGH), 굴착(DIG), 중량물(HEAVY)
- **체크리스트**: `checksheet_json_*` 컬럼에 JSONB로 저장 → 프론트에서 `wpTemplates.ts` 기반 동적 렌더링
- **유형별 양식**: 사용자가 유형을 선택하면 해당 체크리스트 양식이 동적으로 표시

```
wp_types 예시: "COM,HOT,CONF"
→ COM 체크시트 + HOT 체크시트 + CONF 체크시트 모두 표시
```

---

## 8. 결재 모듈 (Approval)

### 8.1 결재 아키텍처

```
기안자 → 결재자1 → 결재자2 → ... → 참조자(통보)
 (기안)   (결재)    (합의)          (참조)
```

### 8.2 결재 유형 코드

| Decision Type | 의미 | Step 자동 처리 |
|---------------|------|---------------|
| `00` | 기안 | 자동 승인 (lineNo=0) |
| `01` | 결재 | 수동 처리 필요 |
| `02` | 합의 | 수동 처리 필요 |
| `03` | 참조/통보 | 자동 건너뜀 (알림 용도) |

### 8.3 결재 처리 플로우

```
1. 기안 등록 (POST /api/approval)
   ├─ Approval 생성 (status=A)
   ├─ Step 0: 기안자 자동 승인 처리
   ├─ Step 1~: 결재자/합의자 → result='P'(미결)
   └─ 참조 Step: 자동 건너뜀 (연속된 참조 스텝 일괄 처리)

2. 결재 처리 (POST /api/approval/decision)
   ├─ 승인(Y): currentStep 증가 → 다음 스텝으로
   │   └─ 마지막 스텝이면 → Approval status=C, 원문서 status=C
   └─ 반려(N): Approval status=R, 원문서 status=R

3. 완료 이벤트 (ApprovalEventListener)
   └─ refEntity/refId로 원문서(Inspection, WorkOrder 등) 상태 자동 반영
```

### 8.4 화면 구성

| 화면 | 설명 | 필터 |
|------|------|------|
| **상신함** (Outbox) | 내가 기안한 문서 | T/A/C/R 상태별 |
| **결재함** (Inbox) | 내가 처리할 문서 | pending(미결), completed(기결), reference(참조) |
| **결재 상세** | 원문서 내용 + 결재선 + 의견란 | 본인 차례일 때만 결재/반려 버튼 활성화 |

### 8.5 원문서 연동

결재 생성 시 `ref_entity`와 `ref_id`로 원문서를 참조하며, 결재 완료/반려 시 이벤트를 통해 원문서의 status를 자동 변경합니다.

```
ref_entity 종류: INSPECTION, WORK_ORDER, WORK_PERMIT, MEMO 등
```

---

## 9. 메모 모듈 (Memo)

### 9.1 용도

당일 운영 현황 및 발생 문제를 부서 내 전파하기 위한 **운영 메모** (자유게시판이 아님)

### 9.2 핵심 정책

| 정책 | 설명 |
|------|------|
| **수정 불가** | 확정(C) 후에는 작성자도 수정/삭제 불가 (신뢰성 보장) |
| **임시저장** | status=T 상태에서만 수정/삭제 가능 |
| **댓글** | 1단계 댓글 지원 (본인 댓글만 삭제 가능) |
| **공지** | `is_notice='Y'`이면 목록 상단 고정 |
| **관리자 삭제** | 특정 조건 하 제한적 허용 |

### 9.3 API

```
POST   /api/memo           ← 메모 작성
GET    /api/memo            ← 메모 목록
GET    /api/memo/{id}       ← 메모 상세
DELETE /api/memo/{id}       ← 메모 삭제 (작성자 + 미확정)
GET    /api/memo/{id}/comments      ← 댓글 목록
POST   /api/memo/{id}/comments      ← 댓글 작성
DELETE /api/memo/{id}/comments/{cid} ← 댓글 삭제 (본인만)
```

---

## 10. 재고관리 모듈 (Inventory)

### 10.1 위치 계층 구조

```
Storage (창고) → Bin (구역) → Location (위치)
```

재고는 `(storage_id, bin_id, location_id, inventory_id)` 4개 키로 위치별 수량 관리

### 10.2 수불 처리 유형

| 유형 | 동작 | 이력 기록 |
|------|------|----------|
| **IN** (입고) | 재고 수량 증가 | IN |
| **OUT** (출고) | 재고 수량 감소 (재고 부족 검증) | OUT |
| **MOVE** (이동) | 출발지 감소 + 도착지 증가 | MOVE_OUT + MOVE_IN |
| **ADJUST** (실사) | 실재고와 차이 보정 | ADJUST_IN 또는 ADJUST_OUT |

### 10.3 수불 처리 요청 구조

```json
{
  "companyId": "C001",
  "type": "IN",            // IN, OUT, MOVE, ADJUST
  "date": "2026-03-08",
  "items": [
    {
      "storageId": "WH01",
      "binId": "B01",
      "locationId": "L01",
      "inventoryId": "MT202603000001",
      "qty": 100,
      "unitPrice": 5000,
      "toStorageId": null,   // MOVE 시 사용
      "toBinId": null,
      "toLocationId": null
    }
  ],
  "refEntity": "WORK_ORDER",  // 참조 문서 (선택)
  "refId": "WO202603000001"
}
```

### 10.4 월마감 (Closing)

- 대상 연월(`yyyymm`) 기준으로 입/출/이동/조정 수량·금액 집계
- 마감 확정(status=C) 후에는 해당 기간 수불 이력 수정 불가
- `inventory_closing` 테이블에 기간별 스냅샷 저장

---

## 11. 대시보드 (Dashboard)

### 11.1 화면 구성

```
┌─────────────────────────────────────────────────────────┐
│ [PM 달성률 카드] [WO 조치율 카드] [WP 승인 건수 카드]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│         FullCalendar (월간 뷰)                           │
│         [PM 탭] [WO 탭] [WP 탭]                          │
│         계획=연한색, 완료=진한색                            │
│                                                         │
├──────────────────────────┬──────────────────────────────┤
│  WO TOP 5 (바 차트)       │  WP TOP 5 (바 차트)          │
│  [건수/비용/시간 Select]   │  [건수 기준]                  │
└──────────────────────────┴──────────────────────────────┘
```

### 11.2 주요 기능

- **플랜트/날짜 기반 조회**: 당월(`yyyyMM`) 기준 서버 사이드 집계
- **캘린더 이벤트 클릭**: 해당 문서의 상세 화면으로 다이렉트 라우팅
- **TOP 5 통계**: 설비별 건수, 비용, 소요시간 기준 랭킹 (Recharts 바 차트)

---

## 12. 파일 관리 (File System)

### 12.1 구조

```
file_group (1) ←→ (N) file_item
```

- `file_group_id`: 자동 채번 (FG prefix)
- 엔티티의 `file_group_id` 필드로 참조
- 파일별 `checksum_sha256` 저장 (무결성 검증)

### 12.2 API

```
POST /api/sys/files/upload      ← 파일 업로드 (multipart/form-data)
GET  /api/sys/files/{groupId}   ← 파일 그룹 메타데이터 조회
GET  /api/sys/files/download/... ← 파일 다운로드
```

- 업로드 제한: 단일 파일 10MB, 요청 전체 10MB
- 저장 경로: `file.upload-dir=uploads` (서버 로컬)

---

## 13. 프론트엔드 라우팅 구조

```
/ (ProtectedRoute → MainLayout)
├── /                          → DashboardPage
├── /standard/company          → CompanyListPage / register / edit
├── /standard/plant            → PlantListPage / register / edit
├── /standard/dept             → DeptListPage / register / edit
├── /standard/user             → UserListPage / register / edit
├── /standard/role             → RoleListPage / register / edit
├── /standard/code             → CodeListPage / register / edit
├── /standard/storage          → StorageListPage / register / edit
├── /standard/profile          → ProfilePage
├── /standard/password         → PasswordPage
├── /master/equipment          → EquipmentListPage / detail / register / edit
├── /master/inventory          → MaterialMasterPage / detail / register / edit
├── /memo                      → MemoListPage / register / detail / edit
├── /pm/inspection             → InspectionListPage / register / detail / edit
├── /wo/work-order             → WorkOrderListPage / register / detail / edit
├── /wp/work-permit            → WorkPermitListPage / register / detail / edit
├── /inventory/processing      → InventoryProcessingPage
├── /inventory/status          → InventoryStatusPage
├── /inventory/transaction     → InventoryTransactionPage
├── /approval/new              → ApprovalRegisterPage
├── /approval/outbox           → ApprovalOutboxPage
├── /approval/inbox            → ApprovalInboxPage
├── /approval/:id              → ApprovalDetailPage
└── /qr/equipment/:id          → EquipmentQrLandingPage

/login                         → LoginPage (PublicRoute)
```

---

## 14. 개발 환경 및 실행

### 14.1 로컬 실행

```bash
# 백엔드 (port 8080)
cd backend
./gradlew bootRun

# 프론트엔드 (port 3000 → proxy → 8080)
cd frontend
npm run dev
```

프론트엔드 Vite 설정에서 `/api` 요청을 `http://127.0.0.1:8080`으로 프록시

### 14.2 주요 설정 파일

| 파일 | 역할 |
|------|------|
| `backend/src/main/resources/application-dev.properties` | DB 연결, JWT 설정, CORS, 파일 업로드 |
| `frontend/vite.config.ts` | 빌드 설정, 경로 alias(@→src), 프록시 |
| `frontend/tailwind.config.js` | UI 테마 설정 |
| `backend/build.gradle` | 의존성 관리 |

### 14.3 환경 설정 요약

```properties
# DB (Neon Cloud PostgreSQL)
spring.datasource.url=jdbc:postgresql://...neon.tech/cmmsdb
spring.jpa.hibernate.ddl-auto=none   # 스키마는 schema.sql로 관리

# JWT
jwt.expiration=43200000              # Access Token 12시간
# Refresh Token은 코드 내 7일 설정

# CORS
app.cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

---

## 15. 핵심 설계 요약

| 항목 | 설계 |
|------|------|
| 인증 | JWT Access(메모리) + Refresh(HttpOnly Cookie + DB), Silent Refresh |
| 멀티 테넌시 | 복합키(company_id + entity_id) 기반 데이터 격리 |
| 삭제 정책 | 전체 Soft Delete (`delete_mark='Y'`) |
| 감사 추적 | BaseEntity 상속 → createdAt/By, updatedAt/By 자동 기록 |
| 상태 관리 | T → A → C/R 공통 상태 플로우 |
| 결재 처리 | 이벤트 기반 원문서 상태 자동 반영 |
| 재고 처리 | 위치 기반(4레벨 키) + 수불 이력 불변 로그 |
| 프론트엔드 상태 | Zustand (auth: persist, ui: 비persist) |
| UI 패턴 | 기준정보(목록→수정) / 마스터·트랜잭션(목록→조회→수정) |
