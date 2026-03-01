const fs = require('fs');
const path = require('path');

const replacements = [
    // Header.tsx
    ['plant.id', 'plant.plantId'],
    ['plant.name', 'plant.name'], // Just for reference

    // InventoryProcessingPage.tsx
    ['storage.id', 'storage.storageId'],

    // pm/InspectionRegisterPage.tsx
    ['d.id', 'd.deptId'],
    ['p.id', 'p.personId'],

    // CodeRegisterPage.tsx
    ['errors.id', 'errors.codeId'],
    ['id:', 'codeId:'],

    // CompanyRegisterPage.tsx
    ['errors.id', 'errors.companyId'],
    ['setError("id"', 'setError("companyId"'],

    // DeptRegisterPage.tsx
    ['errors.id', 'errors.deptId'],
    ['setError("id"', 'setError("deptId"'],

    // PlantRegisterPage.tsx
    ['errors.id', 'errors.plantId'],
    ['setError("id"', 'setError("plantId"'],

    // StorageRegisterPage.tsx
    ['errors.id', 'errors.storageId'],
    ['setError("id"', 'setError("storageId"'],
    ['p.id', 'p.plantId'],

    // StorageListPage.tsx
    ['p.id', 'p.plantId'],

    // ProfilePage.tsx
    ['d.id', 'd.deptId'],

    // UserRegisterPage.tsx
    ['errors.id', 'errors.personId'],
    ['setError("id"', 'setError("personId"'],

    // approvalService.ts
    ['!user.id', '!user.personId'],

    // mapping arrays for SearchableSelectItem (e.g. people.map(p => ({ ...p, id: p.personId }))
    // But since Types error on directly assigning, let's just create a generic map for the SearchableSelect calls.
    // Instead of replacing in all 15 components, we will adapt SearchableSelect.tsx itself if possible, OR map it.
];

function processComponent(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;

    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }

    // Fix SearchableSelectItem mapping errors.
    // In ApprovalRegisterPage.tsx: items={users} -> items={users.map(u => ({...u, id: u.personId}))}
    // But regex is tricky. Let's do some common maps:
    content = content.replace(/items=\{depts\}/g, "items={depts.map(d => ({ ...d, id: d.deptId }))}");
    content = content.replace(/items=\{persons\}/g, "items={persons.map(p => ({ ...p, id: p.personId }))}");
    content = content.replace(/items=\{users\}/g, "items={users.map(u => ({ ...u, id: u.personId }))}");
    content = content.replace(/items=\{plants\}/g, "items={plants.map(p => ({ ...p, id: p.plantId }))}");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated UI: ${filePath}`);
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

