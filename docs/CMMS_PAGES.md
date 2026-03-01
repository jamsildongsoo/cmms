# CMMS Page & API Mapping List

이 문서는 프론트엔드 페이지와 호출되는 백엔드 API, 파라미터 타입, 리턴 값 및 컨트롤러 매핑 정보를 포함합니다.

## 1. 기준 정보 (Standard Information)

| 페이지명 | 파일 경로 | 호출 API (Frontend) | Endpoint | Input (Params/Body) | Return | Backend Controller | 오류/특이사항 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 회사 목록 | `standard/CompanyListPage.tsx` | `standardService.getAll('company')` | `GET /api/v1/companies` | - | `List<Company>` | `CompanyController` | - |
| 회사 등록/수정 | `standard/CompanyRegisterPage.tsx` | `standardService.create('company', ...)` | `POST /api/v1/companies` | `Company` (Body) | `Company` | `CompanyController` | - |
| 공장 목록 | `standard/PlantListPage.tsx` | `standardService.getAll('plant')` | `GET /api/std/plants` | `companyId` (Query) | `List<Plant>` | `StandardInfoController` | - |
| 공장 등록/수정 | `standard/PlantRegisterPage.tsx` | `standardService.create('plant', ...)` | `POST /api/std/plants` | `Plant` (Body) | `Plant` | `StandardInfoController` | - |
| 부서 목록 | `standard/DeptListPage.tsx` | `standardService.getAll('dept')` | `GET /api/std/depts` | `companyId` (Query) | `List<Dept>` | `StandardInfoController` | - |
| 부서 등록/수정 | `standard/DeptRegisterPage.tsx` | `standardService.create('dept', ...)` | `POST /api/std/depts` | `Dept` (Body) | `Dept` | `StandardInfoController` | - |
| 사용자 목록 | `standard/UserListPage.tsx` | `standardService.getAll('person')` | `GET /api/std/persons` | `companyId` (Query) | `List<Person>` | `StandardInfoController` | - |
| 사용자 등록/수정 | `standard/UserRegisterPage.tsx` | `standardService.create('person', ...)` | `POST /api/std/persons` | `Person` (Body) | `Person` | `StandardInfoController` | - |
| 저장소 목록 | `standard/StorageListPage.tsx` | `standardService.getAll('storage')` | `GET /api/std/storages` | `companyId` (Query) | `List<Storage>` | `StandardInfoController` | - |
| 저장소 등록/수정 | `standard/StorageRegisterPage.tsx` | `standardService.create('storage', ...)` | `POST /api/std/storages` | `Storage` (Body) | `Storage` | `StandardInfoController` | - |
| 코드 목록 | `standard/CodeListPage.tsx` | `standardService.getAll('code')` | `GET /api/std/codes` | `companyId` (Query) | `List<Code>` | `StandardInfoController` | - |
| 코드 등록/수정 | `standard/CodeRegisterPage.tsx` | `standardService.create('code', ...)` | `POST /api/std/codes` | `Code` (Body) | `Code` | `StandardInfoController` | - |
| 코드 아이템 등록 | `standard/CodeItemRegisterPage.tsx` | `standardService.saveCodeItem(...)` | `POST /api/std/codes/{companyId}/{codeId}/items` | `CodeItem` (Body) | `CodeItem` | `StandardInfoController` | - |

## 2. 마스터 데이터 (Master Data)

| 페이지명 | 파일 경로 | 호출 API (Frontend) | Endpoint | Input (Params/Body) | Return | Backend Controller | 오류/특이사항 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 설비 목록 | `equipment/EquipmentListPage.tsx` | `equipmentService.getAll()` | `GET /api/master/equipment` | `companyId` (Query) | `List<Equipment>` | `MasterDataController` | - |
| 설비 상세 | `equipment/EquipmentDetailPage.tsx` | `equipmentService.getById(id)` | `GET /api/master/equipment/{companyId}/{id}` | `companyId, id` (Path) | `Equipment` | `MasterDataController` | - |
| 설비 등록/수정 | `equipment/EquipmentRegisterPage.tsx` | `equipmentService.create/update` | `POST /api/master/equipment` | `Equipment` (Body) | `Equipment` | `MasterDataController` | - |
| 자재 마스터 목록 | `inventory/MaterialMasterPage.tsx` | `inventoryService.getAllMaterials()` | `GET /api/master/inventory` | `companyId` (Query) | `List<Inventory>` | `MasterDataController` | - |
| 자재 등록/수정 | `inventory/MaterialRegisterPage.tsx` | `inventoryService.create/updateMaterial` | `POST /api/master/inventory` | `Inventory` (Body) | `Inventory` | `MasterDataController` | - |

## 3. 트랜잭션 (TX - Transaction)

| 페이지명 | 파일 경로 | 호출 API (Frontend) | Endpoint | Input (Params/Body) | Return | Backend Controller | 오류/특이사항 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 점검 목록 | `pm/InspectionListPage.tsx` | `inspectionService.getAll()` | `GET /api/tx/inspections` | `companyId` (Query) | `List<Inspection>` | `TransactionController` | - |
| 점검 상세 | `pm/InspectionDetailPage.tsx` | `inspectionService.getById(id)` | `GET /api/tx/inspections/{companyId}/{id}` | `companyId, id` (Path) | `Inspection` | `TransactionController` | - |
| 점검 등록/수정 | `pm/InspectionRegisterPage.tsx` | `inspectionService.create/update` | `POST /api/tx/inspections` | `InspectionRequest` (Body) | `Inspection` | `TransactionController` | - |
| 작업 오더 목록 | `wo/WorkOrderListPage.tsx` | `workOrderService.getAll()` | `GET /api/tx/work-orders` | `companyId` (Query) | `List<WorkOrder>` | `TransactionController` | - |
| 작업 오더 상세 | `wo/WorkOrderDetailPage.tsx` | `workOrderService.getById(id)` | `GET /api/tx/work-orders/{companyId}/{id}` | `companyId, id` (Path) | `WorkOrder` | `TransactionController` | - |
| 작업 오더 등록/수정 | `wo/WorkOrderRegisterPage.tsx` | `workOrderService.create/update` | `POST /api/tx/work-orders` | `WorkOrderRequest` (Body) | `WorkOrder` | `TransactionController` | - |
| 작업 허가 목록 | `wp/WorkPermitListPage.tsx` | `workPermitService.getAll()` | `GET /api/tx/work-permits` | `companyId` (Query) | `List<WorkPermit>` | `TransactionController` | - |
| 작업 허가 상세 | `wp/WorkPermitDetailPage.tsx` | `workPermitService.getById(id)` | `GET /api/tx/work-permits/{companyId}/{id}` | `companyId, id` (Path) | `WorkPermit` | `TransactionController` | - |
| 작업 허가 등록/수정 | `wp/WorkPermitRegisterPage.tsx` | `workPermitService.create/update` | `POST /api/tx/work-permits` | `WorkPermitRequest` (Body) | `WorkPermit` | `TransactionController` | - |

## 4. 재고 관리 (Inventory - Master Data 제외)

| 페이지명 | 파일 경로 | 호출 API (Frontend) | Endpoint | Input (Params/Body) | Return | Backend Controller | 오류/특이사항 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 재고 현황 | `inventory/InventoryStatusPage.tsx` | `inventoryService.getAllMaterials()` | `GET /api/master/inventory` | `companyId` (Query) | `List<Inventory>` | `MasterDataController` | 현재 재고량 합산 로직 필요 |
| 입출고 처리 | `inventory/InventoryProcessingPage.tsx` | `inventoryService.processTransaction` | `POST /api/inv/transactions` | `InventoryTransactionRequest` (Body) | `void` | `InventoryController` | - |
| 수불 이력 | `inventory/InventoryTransactionPage.tsx` | `inventoryService.getAllTransactions()` | `GET /api/inv/history` | `companyId` (Query) | `List<InventoryHistory>` | `InventoryController` | - |

## 5. 메모 (Memo)

| 페이지명 | 파일 경로 | 호출 API (Frontend) | Endpoint | Input (Params/Body) | Return | Backend Controller | 오류/특이사항 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 메모 목록 | `memo/MemoListPage.tsx` | `memoService.getAllMemos(companyId)` | `GET /api/memo` | `companyId` (Query) | `List<Memo>` | `MemoController` | - |
| 메모 상세 | `memo/MemoDetailPage.tsx` | `memoService.getMemoById(...)` | `GET /api/memo/{id}` | `id` (Path), `companyId` (Query) | `Memo` | `MemoController` | - |
| 메모 등록/수정 | `memo/MemoRegisterPage.tsx` | `memoService.createMemo(...)` | `POST /api/memo` | `Memo` (Body) | `Memo` | `MemoController` | - |
| 댓글 목록 | - | `memoService.getComments(id)` | `GET /api/memo/{id}/comments` | `id` (Path), `companyId` (Query) | `List<MemoComment>` | `MemoController` | - |
| 댓글 등록 | - | `memoService.addComment(id, ...)` | `POST /api/memo/{id}/comments` | `id` (Path), `companyId` (Query), `authorId/content` (Body) | `MemoComment` | `MemoController` | - |

## 6. 결재 관리 (Approval)

| 페이지명 | 파일 경로 | 호출 API (Frontend) | Endpoint | Input (Params/Body) | Return | Backend Controller | 오류/특이사항 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 결재 수신함 | `approval/ApprovalInboxPage.tsx` | `approvalService.getList(..., 'inbox-pending')` | `GET /api/approval/inbox` | `companyId, personId, type` (Query) | `List<Approval>` | `ApprovalController` | - |
| 결재 발신함 | `approval/ApprovalOutboxPage.tsx` | `approvalService.getList(..., 'outbox')` | `GET /api/approval/outbox` | `companyId, personId` (Query) | `List<Approval>` | `ApprovalController` | - |
| 결재 상세 | `approval/ApprovalDetailPage.tsx` | `approvalService.getById(id)` | `GET /api/approval/{id}` | `id` (Path), `companyId` (Query) | `Approval` | `ApprovalController` | - |
| 결재 상신 | `approval/ApprovalRegisterPage.tsx` | `approvalService.save(...)` | `POST /api/approval` | `ApprovalRequest` (Body) | `Approval` | `ApprovalController` | - |
| 결재 결정 | - | `approvalService.processDecision(...)` | `POST /api/approval/decision` | `DecisionRequest` (Body) | `void` | `ApprovalController` | - |

---

## 파라미터 및 타입 불일치/오류 사항 요약

1.  **Inventory Controller 파라미터 누락 (Critical)**:
    - `InventoryController.java`의 `getStocks()`와 `getHistory()` 메서드가 `@RequestParam String companyId`를 받지 않고 전체 목록을 반환하고 있습니다. 프론트엔드에서는 `companyId`를 필터로 전달하고 있어 데이터 노출 범위 오류가 발생할 수 있습니다.
2.  **Inventory Service 호출 도구 불일치**:
    - `inventoryService.ts`의 `processTransaction` 메서드에서 다른 서비스들과 달리 `api` 유틸리티 대신 `axios`를 직접 사용하고 있습니다. 이는 인터셉터나 기본 설정(Base URL 등)을 우회할 위험이 있습니다.
3.  **Snake Case vs Camel Case (Naming Convention)**:
    - 프론트엔드 인터페이스와 API 페이로드는 대부분 `snake_case`(`company_id`, `person_id` 등)를 사용하고 있으나, 백엔드 DTO와 도메인 객체는 `camelCase`를 선호하는 경향이 있어 매핑 시 주의가 필요합니다. (일부 서비스에서 수동 매핑 로직 존재)
4.  **Standard Info API 구조적 차이**:
    - `StandardInfoController`의 `getBins()`와 `getLocations()`는 `companyId` 파라미터가 없으나, 다른 기준정보 API들은 모두 `companyId`를 필수로 요구하고 있어 일관성이 부족합니다.
