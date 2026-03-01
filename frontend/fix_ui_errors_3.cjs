const fs = require('fs');
const path = require('path');

const safeReplacements = {
    'Header.tsx': [
        ['plant?.id', 'plant?.plantId'],
        ['plant?.name', 'plant?.name'],
        ['plant.id', 'plant.plantId']
    ],
    'ApprovalRegisterPage.tsx': [
        ['items={persons}', 'items={persons.map((p: any) => ({ ...p, id: p.personId }))}']
    ],
    'EquipmentRegisterPage.tsx': [
        ['items={departments}', 'items={departments.map((d: any) => ({ ...d, id: d.deptId }))}']
    ],
    'InventoryProcessingPage.tsx': [
        ['import { standardService, StandardType, Warehouse }', 'import { standardService, StandardType, Storage }'],
        ['Warehouse[]', 'Storage[]'],
        ['Warehouse>', 'Storage>'],
        ['Warehouse,', 'Storage,'],
        ["'warehouse'", "'storage'"]
    ],
    'MaterialRegisterPage.tsx': [
        ['items={departments}', 'items={departments.map((d: any) => ({ ...d, id: d.deptId }))}']
    ],
    'InspectionRegisterPage.tsx': [
        ['items={departments}', 'items={departments.map((d: any) => ({ ...d, id: d.deptId }))}'],
        ['items={persons}', 'items={persons.map((p: any) => ({ ...p, id: p.personId }))}']
    ],
    'CodeItemRegisterPage.tsx': [
        ['"code_id"', '"codeId"'],
        ['"item_id"', '"itemId"']
    ],
    'CodeRegisterPage.tsx': [
        ['"id"', '"codeId"']
    ],
    'CompanyRegisterPage.tsx': [
        ['"id"', '"companyId"']
    ],
    'DeptRegisterPage.tsx': [
        ['"id"', '"deptId"'],
        ['"parent_id"', '"parentId"']
    ],
    'PlantRegisterPage.tsx': [
        ['"id"', '"plantId"']
    ],
    'ProfilePage.tsx': [
        ['dept.id', 'dept.deptId'],
        ['dept?.id', 'dept?.deptId']
    ],
    'StorageListPage.tsx': [
        ['"id"', '"storageId"'],
        ['p.id', 'p.plantId'],
        ['item.id', 'item.storageId']
    ],
    'WarehouseListPage.tsx': [
        ['p.id', 'p.plantId'],
        ['item.id', 'item.storageId'] // actually warehouse has no id? Wait, standardService has storageId, not warehouseId. So it returns `storageId`.
    ],
    'StorageRegisterPage.tsx': [
        ['"id"', '"storageId"'],
        ['errors.id', 'errors.storageId'],
        ['p.id', 'p.plantId']
    ],
    'WarehouseRegisterPage.tsx': [
        ['"id"', '"storageId"'],
        ['errors.id', 'errors.storageId'],
        ['p.id', 'p.plantId']
    ],
    'UserRegisterPage.tsx': [
        ['"password_hash"', '"passwordHash"'],
        ['errors.password_hash', 'errors.passwordHash'],
        ['items={departments}', 'items={departments.map((d: any) => ({ ...d, id: d.deptId }))}'],
        ['"role_id"', '"roleId"']
    ],
    'WorkOrderRegisterPage.tsx': [
        ['items={departments}', 'items={departments.map((d: any) => ({ ...d, id: d.deptId }))}'],
        ['items={persons}', 'items={persons.map((p: any) => ({ ...p, id: p.personId }))}']
    ],
    'WorkPermitRegisterPage.tsx': [
        ['items={departments}', 'items={departments.map((d: any) => ({ ...d, id: d.deptId }))}'],
        ['items={persons}', 'items={persons.map((p: any) => ({ ...p, id: p.personId }))}']
    ]
};

function processComponent(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    const filename = path.basename(filePath);
    if (!safeReplacements[filename]) return;

    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;

    for (const [search, replace] of safeReplacements[filename]) {
        content = content.split(search).join(replace);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed UI: ${filePath}`);
    }
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

const targetDir = path.join(__dirname, 'src');
walkDir(targetDir, processComponent);
console.log('UI Fixes 3 complete.');
