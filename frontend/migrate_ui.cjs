const fs = require('fs');
const path = require('path');

const fileReplacements = {
    'PlantListPage.tsx': { 'item.id': 'item.plantId' },
    'CompanyListPage.tsx': { 'item.id': 'item.companyId' },
    'DeptListPage.tsx': { 'item.id': 'item.deptId' },
    'StorageListPage.tsx': { 'item.id': 'item.storageId' },
    'CodeListPage.tsx': { 'item.id': 'item.codeId', 'item.item_id': 'item.itemId' },
};

const regexReplacements = {
    'delete_mark': 'deleteMark',
    'parent_id': 'parentId',
    'item_id': 'itemId',
    'code_id': 'codeId',
    'role_id': 'roleId',
    'password_hash': 'passwordHash',
    'last_login_at': 'lastLoginAt',
    'last_login_ip': 'lastLoginIp'
};

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

function processComponent(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;

    // global snake_case replacements
    for (const [snake, camel] of Object.entries(regexReplacements)) {
        const regex = new RegExp(`\\b${snake}\\b`, 'g');
        content = content.replace(regex, camel);
    }

    // specific file logic for item.id -> item.xxxId
    const filename = path.basename(filePath);
    if (fileReplacements[filename]) {
        for (const [search, replace] of Object.entries(fileReplacements[filename])) {
            content = content.split(search).join(replace);
        }
    }

    // Also check for user registers or standard forms where formData.id is used?
    // Let's run `npm run build` after to catch those via TS!

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated UI: ${filePath}`);
    }
}

const targetDir = path.join(__dirname, 'src');
walkDir(targetDir, processComponent);
console.log('UI Migration complete.');
