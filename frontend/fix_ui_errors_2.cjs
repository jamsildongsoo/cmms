const fs = require('fs');
const path = require('path');

const safeReplacements = {
    'Header.tsx': [
        ['plant?.id', 'plant?.plantId'],
        ['plant?.name', 'plant?.name']
    ],
    'ApprovalRegisterPage.tsx': [
        ['items={filteredPersons}', 'items={filteredPersons.map((p: any) => ({ ...p, id: p.personId }))}']
    ],
    'EquipmentRegisterPage.tsx': [
        ['items={depts}', 'items={depts.map((d: any) => ({ ...d, id: d.deptId }))}']
    ],
    'InventoryProcessingPage.tsx': [
        ['import { standardService, StandardType, Warehouse', 'import { standardService, StandardType, Storage'],
        ['Warehouse[]', 'Storage[]'],
        ['<Warehouse>', '<Storage>'],
        ["'warehouse'", "'storage'"],
        ['item.id', 'item.storageId']
    ],
    'MaterialRegisterPage.tsx': [
        ['items={depts}', 'items={depts.map((d: any) => ({ ...d, id: d.deptId }))}']
    ],
    'InspectionRegisterPage.tsx': [
        ['item_id', 'itemId'],
        ['d.id', 'd.deptId'],
        ['items={depts}', 'items={depts.map((d: any) => ({ ...d, id: d.deptId }))}'],
        ['items={filteredPersons}', 'items={filteredPersons.map((p: any) => ({ ...p, id: p.personId }))}']
    ],
    'CodeItemRegisterPage.tsx': [
        ['"code_id"', '"codeId"'],
        ['"item_id"', '"itemId"'],
        ['code_id:', 'codeId:']
    ],
    'CodeListPage.tsx': [
        ['item.id', 'item.codeId']
    ],
    'CodeRegisterPage.tsx': [
        ['"id"', '"codeId"'],
        ['item_id:', 'itemId:']
    ],
    'CompanyListPage.tsx': [
        ['item.id', 'item.companyId']
    ],
    'CompanyRegisterPage.tsx': [
        ['"id"', '"companyId"']
    ],
    'DeptListPage.tsx': [
        ['item.id', 'item.deptId'],
        ['item.parent_id', 'item.parentId']
    ],
    'DeptRegisterPage.tsx': [
        ['"id"', '"deptId"'],
        ['"parent_id"', '"parentId"']
    ],
    'PlantListPage.tsx': [
        ['item.id', 'item.plantId']
    ],
    'PlantRegisterPage.tsx': [
        ['"id"', '"plantId"']
    ],
    'ProfilePage.tsx': [
        ['dept?.id', 'dept?.deptId']
    ],
    'StorageListPage.tsx': [
        ['item.id', 'item.storageId'],
        ['p.id', 'p.plantId']
    ],
    'WarehouseListPage.tsx': [
        ['Warehouse', 'Storage'],
        ['warehouse', 'storage'],
        ['item.id', 'item.storageId'],
        ['p.id', 'p.plantId']
    ],
    'WarehouseRegisterPage.tsx': [
        ['Warehouse', 'Storage'],
        ['warehouse', 'storage'],
        ['"id"', '"storageId"'],
        ['p.id', 'p.plantId']
    ],
    'StorageRegisterPage.tsx': [
        ['"id"', '"storageId"'],
        ['errors.id', 'errors.storageId'],
        ['p.id', 'p.plantId']
    ],
    'UserRegisterPage.tsx': [
        ['"password_hash"', '"passwordHash"'],
        ['errors.password_hash', 'errors.passwordHash'],
        ['items={depts}', 'items={depts.map((d: any) => ({ ...d, id: d.deptId }))}'],
        ['"role_id"', '"roleId"']
    ],
    'WorkOrderRegisterPage.tsx': [
        ['items={depts}', 'items={depts.map((d: any) => ({ ...d, id: d.deptId }))}'],
        ['items={filteredPersons}', 'items={filteredPersons.map((p: any) => ({ ...p, id: p.personId }))}']
    ],
    'WorkPermitRegisterPage.tsx': [
        ['items={depts}', 'items={depts.map((d: any) => ({ ...d, id: d.deptId }))}'],
        ['items={filteredPersons}', 'items={filteredPersons.map((p: any) => ({ ...p, id: p.personId }))}']
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
console.log('UI Fixes complete.');
