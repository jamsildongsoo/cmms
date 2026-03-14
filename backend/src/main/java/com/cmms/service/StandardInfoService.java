package com.cmms.service;

import com.cmms.domain.*;
import com.cmms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StandardInfoService {

    private final PlantRepository plantRepository;
    private final DeptRepository deptRepository;
    private final RoleRepository roleRepository;
    private final PersonRepository personRepository;
    private final StorageRepository storageRepository;
    private final BinRepository binRepository;
    private final LocationRepository locationRepository;
    private final CodeRepository codeRepository;
    private final CodeItemRepository codeItemRepository;
    private final PasswordEncoder passwordEncoder;
    private final SystemService systemService;

    // Plant
    @Transactional
    public Plant savePlant(Plant plant) {
        if (plant.getPlantId() == null || plant.getPlantId().isBlank()) {
            plant.setPlantId(systemService.generateId(plant.getCompanyId(), "PLANT", "GLOBAL"));
        }
        return plantRepository.save(plant);
    }

    public List<Plant> getAllPlants(String companyId) {
        return plantRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<Plant> getPlantById(String companyId, String plantId) {
        return plantRepository.findById(new PlantId(companyId, plantId))
                .filter(plant -> plant.getDeleteMark() == null || "N".equals(plant.getDeleteMark()));
    }

    @Transactional
    public boolean deletePlant(String companyId, String plantId) {
        return plantRepository.findById(new PlantId(companyId, plantId)).map(plant -> {
            plant.setDeleteMark("Y");
            plantRepository.save(plant);
            return true;
        }).orElse(false);
    }

    // Dept
    @Transactional
    public Dept saveDept(Dept dept) {
        if (dept.getDeptId() == null || dept.getDeptId().isBlank()) {
            dept.setDeptId(systemService.generateId(dept.getCompanyId(), "DEPT", "GLOBAL"));
        }
        return deptRepository.save(dept);
    }

    public List<Dept> getAllDepts(String companyId) {
        return deptRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<Dept> getDeptById(String companyId, String deptId) {
        return deptRepository.findById(new DeptId(companyId, deptId))
                .filter(dept -> dept.getDeleteMark() == null || "N".equals(dept.getDeleteMark()));
    }

    @Transactional
    public boolean deleteDept(String companyId, String deptId) {
        return deptRepository.findById(new DeptId(companyId, deptId)).map(dept -> {
            dept.setDeleteMark("Y");
            deptRepository.save(dept);
            return true;
        }).orElse(false);
    }

    // Role
    @Transactional
    public Role saveRole(Role role) {
        if (role.getRoleId() == null || role.getRoleId().isBlank()) {
            role.setRoleId(systemService.generateId(role.getCompanyId(), "ROLE", "GLOBAL"));
        }
        return roleRepository.save(role);
    }

    public List<Role> getAllRoles(String companyId) {
        return roleRepository.findByCompanyIdAndDeleteMarkOrderByRoleIdAsc(companyId, "N");
    }

    public Optional<Role> getRoleById(String companyId, String roleId) {
        return roleRepository.findById(new RoleId(companyId, roleId))
                .filter(role -> role.getDeleteMark() == null || "N".equals(role.getDeleteMark()));
    }

    @Transactional
    public boolean deleteRole(String companyId, String roleId) {
        return roleRepository.findById(new RoleId(companyId, roleId)).map(role -> {
            role.setDeleteMark("Y");
            roleRepository.save(role);
            return true;
        }).orElse(false);
    }

    // Person
    @Transactional
    public Person savePerson(Person person) {
        boolean isNew = person.getPersonId() == null || person.getPersonId().isBlank();

        if (isNew) {
            person.setPersonId(systemService.generateId(person.getCompanyId(), "PERSON", "GLOBAL"));
        }

        if (person.getPasswordHash() != null && !person.getPasswordHash().isBlank()
                && !isBCryptHash(person.getPasswordHash())) {
            // 평문 비밀번호가 전달된 경우 → 검증 후 인코딩
            validatePassword(person.getPasswordHash());
            person.setPasswordHash(passwordEncoder.encode(person.getPasswordHash()));
        } else if (isNew && (person.getPasswordHash() == null || person.getPasswordHash().isBlank())) {
            // 신규 등록인데 비밀번호 미입력 → 오류
            throw new IllegalArgumentException("신규 사용자 등록 시 비밀번호는 필수입니다.");
        } else if (!isNew && (person.getPasswordHash() == null || person.getPasswordHash().isBlank())) {
            // 수정인데 비밀번호 미입력 → 기존 비밀번호 유지
            personRepository.findById(new PersonId(person.getCompanyId(), person.getPersonId()))
                    .ifPresent(existing -> person.setPasswordHash(existing.getPasswordHash()));
        }
        return personRepository.save(person);
    }

    private boolean isBCryptHash(String value) {
        return value != null && (value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$"));
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("비밀번호는 8자리 이상이어야 합니다.");
        }
    }

    public List<Person> getAllPersons(String companyId) {
        return personRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<Person> getPersonById(String companyId, String personId) {
        return personRepository.findById(new PersonId(companyId, personId))
                .filter(person -> person.getDeleteMark() == null || "N".equals(person.getDeleteMark()));
    }

    @Transactional
    public void changePassword(String companyId, String personId, String currentPassword, String newPassword) {
        Person person = personRepository.findById(new PersonId(companyId, personId))
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(currentPassword, person.getPasswordHash())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        validatePassword(newPassword);
        person.setPasswordHash(passwordEncoder.encode(newPassword));
        personRepository.save(person);
    }

    @Transactional
    public boolean deletePerson(String companyId, String personId) {
        return personRepository.findById(new PersonId(companyId, personId)).map(person -> {
            person.setDeleteMark("Y");
            personRepository.save(person);
            return true;
        }).orElse(false);
    }

    // Storage
    @Transactional
    public Storage saveStorage(Storage storage) {
        if (storage.getStorageId() == null || storage.getStorageId().isBlank()) {
            storage.setStorageId(systemService.generateId(storage.getCompanyId(), "STORAGE", "GLOBAL"));
        }
        return storageRepository.save(storage);
    }

    public List<Storage> getAllStorages(String companyId) {
        return storageRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<Storage> getStorageById(String companyId, String storageId) {
        return storageRepository.findById(new StorageId(companyId, storageId))
                .filter(storage -> storage.getDeleteMark() == null || "N".equals(storage.getDeleteMark()));
    }

    @Transactional
    public boolean deleteStorage(String companyId, String storageId) {
        return storageRepository.findById(new StorageId(companyId, storageId)).map(storage -> {
            storage.setDeleteMark("Y");
            storageRepository.save(storage);
            return true;
        }).orElse(false);
    }

    // Bin
    @Transactional
    public Bin saveBin(Bin bin) {
        return binRepository.save(bin);
    }

    public List<Bin> getAllBins(String companyId) {
        return binRepository.findAllByCompanyId(companyId).stream()
                .filter(b -> b.getDeleteMark() == null || "N".equals(b.getDeleteMark()))
                .toList();
    }

    public Optional<Bin> getBinById(String companyId, String binId) {
        return binRepository.findById(new BinId(companyId, binId))
                .filter(bin -> bin.getDeleteMark() == null || "N".equals(bin.getDeleteMark()));
    }

    @Transactional
    public boolean deleteBin(String companyId, String binId) {
        return binRepository.findById(new BinId(companyId, binId)).map(bin -> {
            bin.setDeleteMark("Y");
            binRepository.save(bin);
            return true;
        }).orElse(false);
    }

    // Location
    @Transactional
    public Location saveLocation(Location location) {
        return locationRepository.save(location);
    }

    public List<Location> getAllLocations(String companyId) {
        return locationRepository.findAllByCompanyId(companyId).stream()
                .filter(l -> l.getDeleteMark() == null || "N".equals(l.getDeleteMark()))
                .toList();
    }

    public Optional<Location> getLocationById(String companyId, String locationId) {
        return locationRepository.findById(new LocationId(companyId, locationId))
                .filter(location -> location.getDeleteMark() == null || "N".equals(location.getDeleteMark()));
    }

    @Transactional
    public boolean deleteLocation(String companyId, String locationId) {
        return locationRepository.findById(new LocationId(companyId, locationId)).map(location -> {
            location.setDeleteMark("Y");
            locationRepository.save(location);
            return true;
        }).orElse(false);
    }

    // Code
    @Transactional
    public Code saveCode(Code code) {
        if (code.getCodeId() == null || code.getCodeId().isBlank()) {
            code.setCodeId(systemService.generateId(code.getCompanyId(), "CODE", "GLOBAL"));
        }
        return codeRepository.save(code);
    }

    public List<Code> getAllCodes(String companyId) {
        return codeRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<Code> getCodeById(String companyId, String codeId) {
        return codeRepository.findById(new CodeId(companyId, codeId))
                .filter(code -> code.getDeleteMark() == null || "N".equals(code.getDeleteMark()));
    }

    @Transactional
    public boolean deleteCode(String companyId, String codeId) {
        return codeRepository.findById(new CodeId(companyId, codeId)).map(code -> {
            code.setDeleteMark("Y");
            codeRepository.save(code);
            return true;
        }).orElse(false);
    }

    // CodeItem
    @Transactional
    public CodeItem saveCodeItem(CodeItem codeItem) {
        if (codeItem.getItemId() == null || codeItem.getItemId().isBlank()) {
            codeItem.setItemId(systemService.generateId(codeItem.getCompanyId(), "CODE_ITEM", codeItem.getCodeId()));
        }
        return codeItemRepository.save(codeItem);
    }

    public List<CodeItem> getCodeItemsByCodeId(String companyId, String codeId) {
        return codeItemRepository.findAllByCompanyIdAndCodeId(companyId, codeId);
    }

    public Optional<CodeItem> getCodeItemById(String companyId, String codeId, String itemId) {
        return codeItemRepository.findById(new CodeItemId(companyId, codeId, itemId));
    }

    @Transactional
    public void deleteCodeItem(String companyId, String codeId, String itemId) {
        codeItemRepository.deleteById(new CodeItemId(companyId, codeId, itemId));
    }
}
