const fs = require('fs');
const path = require('path');

const safeReplacements = {
    'Header.tsx': [
        [/p\.id/g, 'p.plantId']
    ],
    'InventoryProcessingPage.tsx': [
        [/,\s*Warehouse\b/g, ', Storage'],
        [/\bWarehouse\b/g, 'Storage'] // also replaces <Warehouse>
    ],
    'InspectionRegisterPage.tsx': [
        [/items=\{filteredPersons\}/g, 'items={filteredPersons.map((p: any) => ({ ...p, id: p.personId }))}']
    ],
    'CodeItemRegisterPage.tsx': [
        [/"code_id"/g, '"codeId"'],
        [/"item_id"/g, '"itemId"'],
        [/'code_id'/g, "'codeId'"],
        [/'item_id'/g, "'itemId'"]
    ],
    'CodeRegisterPage.tsx': [
        [/"id"/g, '"codeId"'],
        [/'id'/g, "'codeId'"]
    ],
    'CompanyRegisterPage.tsx': [
        [/"id"/g, '"companyId"'],
        [/'id'/g, "'companyId'"]
    ],
    'DeptRegisterPage.tsx': [
        [/"id"/g, '"deptId"'],
        [/'id'/g, "'deptId'"],
        [/"parent_id"/g, '"parentId"'],
        [/'parent_id'/g, "'parentId'"]
    ],
    'PlantRegisterPage.tsx': [
        [/"id"/g, '"plantId"'],
        [/'id'/g, "'plantId'"]
    ],
    'ProfilePage.tsx': [
        [/dept\.id/g, 'dept.deptId'],
        [/dept\?\.id/g, 'dept?.deptId']
    ],
    'StorageListPage.tsx': [
        [/codeId/g, 'storageId'], // wait, StorageListPage has TS6133 'codeId' is declared.
        [/id\s*=\s*/g, 'storageId = '],
        [/code_id/g, 'storageId']
    ],
    'WarehouseListPage.tsx': [
        [/plant\.id/g, 'plant.plantId']
    ],
    'StorageRegisterPage.tsx': [
        [/"id"/g, '"storageId"'],
        [/'id'/g, "'storageId'"],
        [/errors\.id/g, 'errors.storageId'],
        [/plant\.id/g, 'plant.plantId'],
        [/{ codeId: string }/g, '{ id: string }'] // fix for useParams<{ codeId: string }>() back to id
    ],
    'WarehouseRegisterPage.tsx': [
        [/"id"/g, '"storageId"'],
        [/'id'/g, "'storageId'"],
        [/errors\.id/g, 'errors.storageId'],
        [/plant\.id/g, 'plant.plantId']
    ],
    'UserRegisterPage.tsx': [
        [/"password_hash"/g, '"passwordHash"'],
        [/'password_hash'/g, "'passwordHash'"],
        [/errors\.password_hash/g, 'errors.passwordHash'],
        [/"role_id"/g, '"roleId"'],
        [/'role_id'/g, "'roleId'"]
    ]
};

function processComponent(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    const filename = path.basename(filePath);
    if (!safeReplacements[filename]) return;

    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;

    for (const [search, replace] of safeReplacements[filename]) {
        content = content.replace(search, replace);
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
console.log('UI Fixes 4 complete.');
