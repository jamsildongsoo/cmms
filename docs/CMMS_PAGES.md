# CMMS Page & API Mapping List

이 문서는 프론트엔드 페이지와 호출되는 백엔드 API, 그리고 파라미터 타입에 대한 매핑 정보를 포함합니다.

## 1. 기준 정보 (Standard Information)

| 페이지명 | 파일 경로 | 주요 API 서비스 | 호출 Endpoint | 파라미터 타입 |
| :--- | :--- | :--- | :--- | :--- |
| 회사 목록 | `standard/CompanyListPage.tsx` | `standardService.getAll('company')` | `GET /api/v1/companies` | - |
| 회사 등록/수정 | `standard/CompanyRegisterPage.tsx` | `standardService.create('company', ...)` | `POST /api/v1/companies` | `Company` |
| 공장 목록 | `standard/PlantListPage.tsx` | `standardService.getAll('plant')` | `GET /api/std/plants?companyId={id}` | - |
| 공장 등록/수정 | `standard/PlantRegisterPage.tsx` | `standardService.create('plant', ...)` | `POST /api/std/plants` | `Plant` |
| 부서 목록 | `standard/DeptListPage.tsx` | `standardService.getAll('dept')` | `GET /api/std/depts?companyId={id}` | - |
| 부서 등록/수정 | `standard/DeptRegisterPage.tsx` | `standardService.create('dept', ...)` | `POST /api/std/depts` | `Dept` |
| 사용자 목록 | `standard/UserListPage.tsx` | `standardService.getAll('person')` | `GET /api/std/persons?companyId={id}` | - |
| 사용자 등록/수정 | `standard/UserRegisterPage.tsx` | `standardService.create('person', ...)` | `POST /api/std/persons` | `Person` |
| 창고 목록 | `standard/WarehouseListPage.tsx` | `standardService.getAll('warehouse')` | `GET /api/std/storages?companyId={id}` | - |
| 창고 등록/수정 | `standard/WarehouseRegisterPage.tsx` | `standardService.create('warehouse', ...)` | `POST /api/std/storages` | `Warehouse` |
| 코드 목록 | `standard/CodeListPage.tsx` | `standardService.getAll('code')` | `GET /api/std/codes?companyId={id}` | - |
| 코드 등록/수정 | `standard/CodeRegisterPage.tsx` | `standardService.create('code', ...)` | `POST /api/std/codes` | `Code` |
| 코드 아이템 등록 | `standard/CodeItemRegisterPage.tsx` | `standardService.saveCodeItem(...)` | `POST /api/std/code-items` | `CodeItem` |

## 2. 설비 관리 (Equipment Management)

| 페이지명 | 파일 경로 | 주요 API 서비스 | 호출 Endpoint | 파라미터 타입 |
| :--- | :--- | :--- | :--- | :--- |
| 설비 목록 | `equipment/EquipmentListPage.tsx` | `equipmentService.getAll()` | `GET /api/master/equipment?companyId={id}` | - |
| 설비 상세 | `equipment/EquipmentDetailPage.tsx` | `equipmentService.getById(id)` | `GET /api/master/equipment/{companyId}/{id}` | - |
| 설비 등록/수정 | `equipment/EquipmentRegisterPage.tsx` | `equipmentService.create/update` | `POST /api/master/equipment` | `Equipment` |

## 3. 자재 관리 (Inventory Management)

| 페이지명 | 파일 경로 | 주요 API 서비스 | 호출 Endpoint | 파라미터 타입 |
| :--- | :--- | :--- | :--- | :--- |
| 자재 마스터 목록 | `inventory/MaterialMasterPage.tsx` | `inventoryService.getAllMaterials()` | `GET /api/master/inventory?companyId={id}` | - |
| 자재 등록/수정 | `inventory/MaterialRegisterPage.tsx` | `inventoryService.create/updateMaterial` | `POST /api/master/inventory` | `Material` |
| 재고 현황 | `inventory/InventoryStatusPage.tsx` | `inventoryService.getAllMaterials()` | `GET /api/master/inventory?companyId={id}` | - |
| 입출고 처리 | `inventory/InventoryProcessingPage.tsx` | `inventoryService.processTransaction` | `POST /api/inv/transactions` | `InventoryTransactionRequest` |
| 수불 이력 | `inventory/InventoryTransactionPage.tsx` | `inventoryService.getAllTransactions()` | `GET /api/inv/history?companyId={id}` | - |

## 4. 예방 보전 (Preventive Maintenance)

| 페이지명 | 파일 경로 | 주요 API 서비스 | 호출 Endpoint | 파라미터 타입 |
| :--- | :--- | :--- | :--- | :--- |
| 점검 목록 | `pm/InspectionListPage.tsx` | `inspectionService.getAll()` | `GET /api/tx/inspections?companyId={id}` | - |
| 점검 상세 | `pm/InspectionDetailPage.tsx` | `inspectionService.getById(id)` | `GET /api/tx/inspections/{companyId}/{id}` | - |
| 점검 등록/수정 | `pm/InspectionRegisterPage.tsx` | `inspectionService.create/update` | `POST /api/tx/inspections` | `InspectionRequest` |

## 5. 작업 오더 (Work Order)

| 페이지명 | 파일 경로 | 주요 API 서비스 | 호출 Endpoint | 파라미터 타입 |
| :--- | :--- | :--- | :--- | :--- |
| 작업 오더 목록 | `wo/WorkOrderListPage.tsx` | `workOrderService.getAll()` | `GET /api/tx/work-orders?companyId={id}` | - |
| 작업 오더 상세 | `wo/WorkOrderDetailPage.tsx` | `workOrderService.getById(id)` | `GET /api/tx/work-orders/{companyId}/{id}` | - |
| 작업 오더 등록/수정| `wo/WorkOrderRegisterPage.tsx` | `workOrderService.create/update` | `POST /api/tx/work-orders` | `WorkOrderRequest` |

## 6. 안전 작업 허가 (Work Permit)

| 페이지명 | 파일 경로 | 주요 API 서비스 | 호출 Endpoint | 파라미터 타입 |
| :--- | :--- | :--- | :--- | :--- |
| 작업 허가 목록 | `wp/WorkPermitListPage.tsx` | `workPermitService.getAll()` | `GET /api/tx/work-permits?companyId={id}` | - |
| 작업 허가 상세 | `wp/WorkPermitDetailPage.tsx` | `workPermitService.getById(id)` | `GET /api/tx/work-permits/{companyId}/{id}` | - |
| 작업 허가 등록/수정| `wp/WorkPermitRegisterPage.tsx` | `workPermitService.create/update` | `POST /api/tx/work-permits` | `WorkPermitRequest` |

## 7. 결재 관리 (Approval Management)

| 페이지명 | 파일 경로 | 주요 API 서비스 | 호출 Endpoint | 파라미터 타입 |
| :--- | :--- | :--- | :--- | :--- |
| 결재 수신함 | `approval/ApprovalInboxPage.tsx` | `approvalService.getList(..., 'inbox-pending')` | `GET /api/approval/inbox` | `companyId`, `personId`, `type` |
| 결재 발신함 | `approval/ApprovalOutboxPage.tsx` | `approvalService.getList(..., 'outbox')` | `GET /api/approval/outbox` | `companyId`, `personId` |
| 결재 상세 | `approval/ApprovalDetailPage.tsx` | `approvalService.getById(id)` | `GET /api/approval/{id}` | `companyId` |
| 결재 상신 | `approval/ApprovalRegisterPage.tsx` | `approvalService.save(...)` | `POST /api/approval` | `ApprovalRequest` |

## 8. 기타 (Others)

| 페이지명 | 파일 경로 | 주요 API 서비스 | 호출 Endpoint | 파라미터 타입 |
| :--- | :--- | :--- | :--- | :--- |
| 로그인 | `auth/LoginPage.tsx` | `authService.login(...)` | `POST /api/auth/login` | `LoginRequest` |
| 메모 목록 | `memo/MemoListPage.tsx` | `memoService.getAll()` | `GET /api/memo?companyId={id}` | - |
| 메모 등록 | `memo/MemoRegisterPage.tsx` | `memoService.create(...)` | `POST /api/memo` | `Memo` |

---

## 백엔드 API 일치 여부 점검 결과

점검 결과 대체로 프론트엔드와 백엔드 API가 잘 매핑되어 있으나, 다음과 같은 몇 가지 개선/확인 필요 사항이 발견되었습니다.

1.  **Query Parameter 무시**: 
    - 프론트엔드는 `getAll` 계열 호출 시 대부분 `?companyId=...`를 전달하고 있으나, 백엔드 컨트롤러의 `GET` 메서드(예: `StandardInfoController.getPlants()`)들 중 상당수가 이 파라미터를 명시적으로 받지 않고 전체 목록을 반환하고 있습니다. (다만, `Service` 레이어에서 필터링이 구현되어 있는지 확인 필요)
2.  **Inventory Service 오타**:
    - `inventoryService.ts`의 `getAllMaterials` 메서드에서 URL 문자열 내에 공백이 포함되어 있습니다: `` `/ api / master / inventory ? companyId = ${companyId} ` ``. 이는 실제 호출 시 오류를 유발할 수 있습니다.
3.  **Transaction API 구조**:
    - `TransactionController` 하나에서 `Inspection`, `WorkOrder`, `WorkPermit`을 모두 처리하고 있으며, 각각의 엔티티 단독 처리가 아닌 `DTO`(`WorkOrderRequest` 등)를 통해 헤더와 아이템을 함께 처리하는 구조로 프론트엔드와 일치합니다.
4.  **Endpoint 일관성**:
    - 기준정보에서 회사는 `/api/v1/companies`를 사용하고, 나머지는 `/api/std/...`를 사용하는 등 약간의 일관성 차이가 있습니다.
5.  **Storage vs Warehouse**:
    - 프론트엔드 UI와 서비스에서는 `Warehouse`라는 명칭을 주로 사용하나, 백엔드 엔티티 및 엔드포인트는 `Storage`(/api/std/storages)를 사용하고 있습니다.
