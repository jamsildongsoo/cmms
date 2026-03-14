# CMMS Project Guide

프로젝트 루트의 `docs/CMMS_PRD.md`, `docs/CMMS_DB.md`, `docs/CMMS_TECHNICAL_GUIDE.md`를 먼저 분석하고 그 내용에 기반하여 작업하십시오.

## Project Stack
- Backend: Spring Boot 3.4.0 + JPA + PostgreSQL (Neon Cloud)
- Frontend: React + TypeScript + Vite + Zustand
- Auth: JWT (3h access, memory only) + Refresh Token (7-day, DB + HttpOnly Cookie, path=/api/auth)

## Key Conventions
- Multi-tenancy: companyId from JWT via SecurityUtil.getCompanyId(auth) — 프론트에서 미전송
- Soft delete: deleteMark='Y' 패턴 (전 엔티티)
- ID generation: `{PREFIX}{yyyyMM}{6-digit seq}` via SystemService.generateId()
- Enums: CommonStatus(T,A,C,R,X), DecisionType, StepResult with JPA converter
- Password: 최소 8자, backend validatePassword() + frontend minLength:8

## Dev Environment
- CORS origins: localhost:5173, 175.45.200.235, 175.45.200.235:5173
- External dev server: nginx (80) → frontend + backend proxy
- data.sql 기본 비밀번호: "12345678"

## UI/UX Patterns
- Submit: `type="button"` + `onClick={() => onSave('A')}` + `getValues()` — `type="submit"` + state 방식은 React 비동기 배치 타이밍 이슈
- Select: SearchableSelect로 통일 (Radix Select는 disabled 전달 문제)
- 실적 입력: refId/refEntity 있으면 결과/비고만 편집 가능 (`isRefLocked` 패턴)
- 인쇄: 웹 콘텐츠에 `print:hidden`, Print 컴포넌트에 `hidden print:block` — 중복 출력 방지
- 출력 양식: 헤더 레이아웃 통일, `equipmentId / equipmentName` 형식
- 직급/직책 → 하나의 "직급/직책" 필드(position)로 병합 (DB title 컬럼 유지)

## Backend Enrichment
- @Transient 필드(equipmentName, personName, deptName) → TransactionService에서 batch enrichment
- NameMaps record + loadNameMaps()로 N+1 회피
- DTO 필드명은 camelCase 엄수 — 프론트에서 snake_case 전송 시 NPE 발생

## Work Permit (작업허가서)
- 7종 템플릿: GEN(일반), HOT(화기), CONF(밀폐), ELEC(정전), DIG(굴착), HIGH(고소), HEAVY(중량물)
- GEN은 항상 기본 선택, template id는 `com` (DB `checksheet_json_com`, 하위호환)
- JSON 저장: `toJsonKey()` 헬퍼로 template.id → camelCase key 변환
- 출력: 1페이지(기본정보) + 각 유형별 별도 페이지 (2열 체크시트+서명란)

## Approval (결재)
- 결재본문 HTML: Thymeleaf 템플릿 (`backend/src/main/resources/templates/approval/`)
- `ApprovalHtmlService.java`에서 refEntity별 템플릿 선택 및 렌더링
- 결재 제목: `[점검 계획/실적]`, `[작업지시 계획/실적]`, `[안전작업 허가]` + name

## Inventory (재고관리)
- 이동평균법: 창고 단가 = `SUM(amount)/SUM(qty)` per (companyId, storageId, inventoryId)
- IN: 수량+금액 직접 입력 / OUT: 창고 단가 자동계산 / MOVE: FROM 단가 적용 / ADJUST: 차이분 계산
- historyId: `SystemService.generateId(companyId, "INV_HISTORY", "GLOBAL")` — 트랜잭션 단위 동일 ID
- MOVE 양방향: MOVE_OUT.refId=moveInHistoryId, MOVE_IN.refId=moveOutHistoryId (처리 전 미리 채번)
- 소급 입력 불가 (txDate 제거, createdAt만 사용)
- Excel 업로드: 2-pass (validate → save), ID 서버 채번

## Auth/Security
- JWT subject: `companyId:personId`, 만료 3h
- Refresh Token: DB + HttpOnly Cookie (path=/api/auth), UUID, 7일 만료, 로테이션
- Brute-force: IP별 5회 실패 시 5분 잠금 (인메모리 ConcurrentHashMap)
- Cookie secure: dev=false, prod=true
