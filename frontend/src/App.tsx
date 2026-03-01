
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Standard (기준정보)
import CompanyListPage from '@/pages/standard/CompanyListPage';
import CompanyRegisterPage from '@/pages/standard/CompanyRegisterPage';
import PlantListPage from '@/pages/standard/PlantListPage';
import PlantRegisterPage from '@/pages/standard/PlantRegisterPage';
import DeptListPage from '@/pages/standard/DeptListPage';
import DeptRegisterPage from '@/pages/standard/DeptRegisterPage';
import StorageListPage from '@/pages/standard/StorageListPage';
import StorageRegisterPage from '@/pages/standard/StorageRegisterPage';
import UserListPage from '@/pages/standard/UserListPage';
import UserRegisterPage from '@/pages/standard/UserRegisterPage';
import CodeListPage from '@/pages/standard/CodeListPage';
import CodeRegisterPage from '@/pages/standard/CodeRegisterPage';
import CodeItemRegisterPage from '@/pages/standard/CodeItemRegisterPage';
import ProfilePage from '@/pages/standard/ProfilePage';
import PasswordPage from '@/pages/standard/PasswordPage';

// Master Data
import EquipmentListPage from '@/pages/equipment/EquipmentListPage';
import EquipmentRegisterPage from '@/pages/equipment/EquipmentRegisterPage';
import EquipmentDetailPage from '@/pages/equipment/EquipmentDetailPage';
import MaterialMasterPage from '@/pages/inventory/MaterialMasterPage';
import MaterialRegisterPage from '@/pages/inventory/MaterialRegisterPage';

// TM (Memo)
import MemoListPage from '@/pages/memo/MemoListPage';
import MemoRegisterPage from '@/pages/memo/MemoRegisterPage';
import MemoDetailPage from '@/pages/memo/MemoDetailPage';

// PM (Inspection)
import InspectionListPage from '@/pages/pm/InspectionListPage';
import InspectionRegisterPage from '@/pages/pm/InspectionRegisterPage';
import InspectionDetailPage from '@/pages/pm/InspectionDetailPage';

// WO (Work Order)
import WorkOrderListPage from '@/pages/wo/WorkOrderListPage';
import WorkOrderRegisterPage from '@/pages/wo/WorkOrderRegisterPage';
import WorkOrderDetailPage from '@/pages/wo/WorkOrderDetailPage';

// WP (Work Permit)
import WorkPermitListPage from '@/pages/wp/WorkPermitListPage';
import WorkPermitRegisterPage from '@/pages/wp/WorkPermitRegisterPage';
import WorkPermitDetailPage from '@/pages/wp/WorkPermitDetailPage';

// Inventory
import InventoryProcessingPage from '@/pages/inventory/InventoryProcessingPage';
import InventoryStatusPage from '@/pages/inventory/InventoryStatusPage';
import InventoryTransactionPage from '@/pages/inventory/InventoryTransactionPage';

// Approval Routes
import ApprovalRegisterPage from '@/pages/approval/ApprovalRegisterPage';
import ApprovalInboxPage from '@/pages/approval/ApprovalInboxPage';
import ApprovalOutboxPage from '@/pages/approval/ApprovalOutboxPage';
import ApprovalDetailPage from '@/pages/approval/ApprovalDetailPage';

// Common
import PlaceholderPage from '@/components/common/PlaceholderPage';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { Toaster } from '@/components/ui/toaster';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />

            {/* Standard Routes (기준정보) */}
            <Route path="standard/company" element={<CompanyListPage />} />
            <Route path="standard/company/new" element={<CompanyRegisterPage />} />
            <Route path="standard/company/:id/edit" element={<CompanyRegisterPage />} />

            <Route path="standard/plant" element={<PlantListPage />} />
            <Route path="standard/plant/new" element={<PlantRegisterPage />} />
            <Route path="standard/plant/:id/edit" element={<PlantRegisterPage />} />

            <Route path="standard/dept" element={<DeptListPage />} />
            <Route path="standard/dept/new" element={<DeptRegisterPage />} />
            <Route path="standard/dept/:id/edit" element={<DeptRegisterPage />} />

            <Route path="standard/storage" element={<StorageListPage />} />
            <Route path="standard/storage/new" element={<StorageRegisterPage />} />
            <Route path="standard/storage/:id/edit" element={<StorageRegisterPage />} />

            <Route path="standard/user" element={<UserListPage />} />
            <Route path="standard/user/new" element={<UserRegisterPage />} />
            <Route path="standard/user/:id/edit" element={<UserRegisterPage />} />

            <Route path="standard/role" element={<PlaceholderPage title="권한 관리" />} />

            <Route path="standard/code" element={<CodeListPage />} />
            <Route path="standard/code/new" element={<CodeRegisterPage />} />
            <Route path="standard/code/:id/edit" element={<CodeRegisterPage />} />
            <Route path="standard/code/:groupId/item/new" element={<CodeItemRegisterPage />} />
            <Route path="standard/code/:groupId/item/:itemId" element={<CodeItemRegisterPage />} />

            <Route path="profile" element={<ProfilePage />} />
            <Route path="password" element={<PasswordPage />} />

            {/* Master Routes */}
            <Route path="master/equipment" element={<EquipmentListPage />} />
            <Route path="master/equipment/new" element={<EquipmentRegisterPage />} />
            <Route path="master/equipment/:id" element={<EquipmentDetailPage />} />
            <Route path="master/equipment/:id/edit" element={<EquipmentRegisterPage />} />

            <Route path="master/inventory" element={<MaterialMasterPage />} />
            <Route path="master/material/new" element={<MaterialRegisterPage />} />
            <Route path="master/material/:id/edit" element={<MaterialRegisterPage />} />

            {/* TM Memo */}
            <Route path="memo" element={<MemoListPage />} />
            <Route path="memo/new" element={<MemoRegisterPage />} />
            <Route path="memo/:id" element={<MemoDetailPage />} />
            <Route path="memo/:id/edit" element={<MemoRegisterPage />} />

            {/* PM Routes (Inspection) */}
            <Route path="pm/inspection" element={<InspectionListPage />} />
            <Route path="pm/inspection/new" element={<InspectionRegisterPage />} />
            <Route path="pm/inspection/result/new" element={<InspectionRegisterPage />} />
            <Route path="pm/inspection/:id" element={<InspectionDetailPage />} />
            <Route path="pm/inspection/:id/edit" element={<InspectionRegisterPage />} />

            {/* WO Routes (Work Order) */}
            <Route path="wo/work-order" element={<WorkOrderListPage />} />
            <Route path="wo/work-order/new" element={<WorkOrderRegisterPage />} />
            <Route path="wo/work-order/result/new" element={<WorkOrderRegisterPage />} />
            <Route path="wo/work-order/:id" element={<WorkOrderDetailPage />} />
            <Route path="wo/work-order/:id/edit" element={<WorkOrderRegisterPage />} />

            {/* WP Routes (Work Permit) */}
            <Route path="wp/work-permit" element={<WorkPermitListPage />} />
            <Route path="wp/work-permit/new" element={<WorkPermitRegisterPage />} />
            <Route path="wp/work-permit/:id" element={<WorkPermitDetailPage />} />
            <Route path="wp/work-permit/:id/edit" element={<WorkPermitRegisterPage />} />

            {/* Inventory Routes */}
            <Route path="inventory/processing" element={<InventoryProcessingPage />} />
            <Route path="inventory/status" element={<InventoryStatusPage />} />
            <Route path="inventory/transaction" element={<InventoryTransactionPage />} />

            {/* Approval Routes */}
            <Route path="approval/new" element={<ApprovalRegisterPage />} />
            <Route path="approval/outbox" element={<ApprovalOutboxPage />} />
            <Route path="approval/inbox" element={<ApprovalInboxPage />} />
            <Route path="approval/:id" element={<ApprovalDetailPage />} />

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
