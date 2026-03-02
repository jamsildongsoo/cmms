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

    // Plant
    @Transactional
    public Plant savePlant(Plant plant) {
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
    public void deletePlant(String companyId, String plantId) {
        plantRepository.findById(new PlantId(companyId, plantId)).ifPresent(plant -> {
            plant.setDeleteMark("Y");
            plantRepository.save(plant);
        });
    }

    // Dept
    @Transactional
    public Dept saveDept(Dept dept) {
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
    public void deleteDept(String companyId, String deptId) {
        deptRepository.findById(new DeptId(companyId, deptId)).ifPresent(dept -> {
            dept.setDeleteMark("Y");
            deptRepository.save(dept);
        });
    }

    // Role
    @Transactional
    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }

    public List<Role> getAllRoles(String companyId) {
        return roleRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<Role> getRoleById(String companyId, String roleId) {
        return roleRepository.findById(new RoleId(companyId, roleId))
                .filter(role -> role.getDeleteMark() == null || "N".equals(role.getDeleteMark()));
    }

    @Transactional
    public void deleteRole(String companyId, String roleId) {
        roleRepository.findById(new RoleId(companyId, roleId)).ifPresent(role -> {
            role.setDeleteMark("Y");
            roleRepository.save(role);
        });
    }

    // Person
    @Transactional
    public Person savePerson(Person person) {
        if (person.getPasswordHash() != null && !person.getPasswordHash().isEmpty()) {
            // BCrypt 해시 패턴($2a$, $2b$ 등)으로 시작하지 않으면 평문으로 간주하고 암호화
            if (!person.getPasswordHash().startsWith("$2a$") && !person.getPasswordHash().startsWith("$2b$")) {
                person.setPasswordHash(passwordEncoder.encode(person.getPasswordHash()));
            }
        }
        return personRepository.save(person);
    }

    public List<Person> getAllPersons(String companyId) {
        return personRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<Person> getPersonById(String companyId, String personId) {
        return personRepository.findById(new PersonId(companyId, personId))
                .filter(person -> person.getDeleteMark() == null || "N".equals(person.getDeleteMark()));
    }

    @Transactional
    public void deletePerson(String companyId, String personId) {
        personRepository.findById(new PersonId(companyId, personId)).ifPresent(person -> {
            person.setDeleteMark("Y");
            personRepository.save(person);
        });
    }

    // Storage
    @Transactional
    public Storage saveStorage(Storage storage) {
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
    public void deleteStorage(String companyId, String storageId) {
        storageRepository.findById(new StorageId(companyId, storageId)).ifPresent(storage -> {
            storage.setDeleteMark("Y");
            storageRepository.save(storage);
        });
    }

    // Bin
    @Transactional
    public Bin saveBin(Bin bin) {
        return binRepository.save(bin);
    }

    public List<Bin> getAllBins(String companyId) {
        return binRepository.findAllByCompanyId(companyId);
    }

    public Optional<Bin> getBinById(String companyId, String binId) {
        return binRepository.findById(new BinId(companyId, binId));
    }

    @Transactional
    public void deleteBin(String companyId, String binId) {
        binRepository.deleteById(new BinId(companyId, binId));
    }

    // Location
    @Transactional
    public Location saveLocation(Location location) {
        return locationRepository.save(location);
    }

    public List<Location> getAllLocations(String companyId) {
        return locationRepository.findAllByCompanyId(companyId);
    }

    public Optional<Location> getLocationById(String companyId, String binId, String locationId) {
        // LocationId matches @Id fields in Location entity: companyId, locationId
        // (binId is not part of PK)
        return locationRepository.findById(new LocationId(companyId, locationId));
    }

    @Transactional
    public void deleteLocation(String companyId, String binId, String locationId) {
        locationRepository.deleteById(new LocationId(companyId, locationId));
    }

    // Code
    @Transactional
    public Code saveCode(Code code) {
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
    public void deleteCode(String companyId, String codeId) {
        codeRepository.findById(new CodeId(companyId, codeId)).ifPresent(code -> {
            code.setDeleteMark("Y");
            codeRepository.save(code);
        });
    }

    // CodeItem
    @Transactional
    public CodeItem saveCodeItem(CodeItem codeItem) {
        return codeItemRepository.save(codeItem);
    }

    public List<CodeItem> getAllCodeItems() {
        return codeItemRepository.findAll();
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
