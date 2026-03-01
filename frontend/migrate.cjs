const fs = require('fs');
const path = require('path');

const replacements = {
    'company_id': 'companyId',
    'plant_id': 'plantId',
    'equipment_id': 'equipmentId',
    'code_item': 'codeItem',
    'dept_id': 'deptId',
    'maker_name': 'makerName',
    'install_location': 'installLocation',
    'install_date': 'installDate',
    'purchase_cost': 'purchaseCost',
    'residual_value': 'residualValue',
    'depre_method': 'depreMethod',
    'depre_period': 'deprePeriod',
    'inspection_yn': 'inspectionYn',
    'inspection_interval': 'inspectionInterval',
    'inspection_unit': 'inspectionUnit',
    'psm_yn': 'psmYn',
    'workpermit_yn': 'workpermitYn',
    'last_inspection': 'lastInspection',
    'next_inspection': 'nextInspection',
    'file_group_id': 'fileGroupId',
    'created_at': 'createdAt',
    'updated_at': 'updatedAt',
    'created_by': 'createdBy',
    'updated_by': 'updatedBy',
    'equipment_name': 'equipmentName',
    'person_id': 'personId',
    'person_name': 'personName',
    'dept_name': 'deptName',
    'inspection_id': 'inspectionId',
    'std_val': 'stdVal',
    'result_val': 'resultVal',
    'order_id': 'orderId',
    'ref_entity': 'refEntity',
    'ref_id': 'refId',
    'due_date': 'dueDate',
    'start_dt': 'startDt',
    'end_dt': 'endDt',
    'worker_name': 'workerName',
    'action_desc': 'actionDesc',
    'labor_cost': 'laborCost',
    'material_cost': 'materialCost',
    'permit_id': 'permitId',
    'wp_types': 'wpTypes',
    'checksheet_json_com': 'checksheetJsonCom',
    'checksheet_json_hot': 'checksheetJsonHot',
    'checksheet_json_conf': 'checksheetJsonConf',
    'checksheet_json_elec': 'checksheetJsonElec',
    'checksheet_json_high': 'checksheetJsonHigh',
    'checksheet_json_dig': 'checksheetJsonDig',
    'work_summary': 'workSummary',
    'hazard_factor': 'hazardFactor',
    'safety_factor': 'safetyFactor',
    'parent_permit_id': 'parentPermitId',
    'approval_id': 'approvalId',
    'line_no': 'lineNo',
    'inventory_id': 'inventoryId',
    'storage_id': 'storageId',
    'bin_id': 'binId',
    'location_id': 'locationId',
    'memo_id': 'memoId',
    'is_notice': 'isNotice',
    'comment_id': 'commentId',
    'author_id': 'authorId',
    'requester_id': 'requesterId',
    'current_step': 'currentStep',
    'decided_at': 'decidedAt',
    'original_name': 'originalName',
    'stored_name': 'storedName',
    'checksum_sha256': 'checksumSha256',
    'storage_path': 'storagePath',
    'date_key': 'dateKey',
    'next_seq': 'nextSeq',
    'actual_date': 'actualDate'
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

function replaceInFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [snake, camel] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${snake}\\b`, 'g');
        content = content.replace(regex, camel);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

const targetDir = path.join(__dirname, 'src');
walkDir(targetDir, replaceInFile);
console.log('Migration complete.');
