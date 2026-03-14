package com.cmms.controller;

import com.cmms.common.security.SecurityUtil;
import com.cmms.domain.*;
import com.cmms.service.StandardInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/std")
@RequiredArgsConstructor
public class StandardInfoController {

    private final StandardInfoService standardInfoService;

    // Plant
    @PostMapping("/plants")
    public Plant createPlant(@RequestBody Plant plant, Authentication auth) {
        plant.setCompanyId(SecurityUtil.getCompanyId(auth));
        return standardInfoService.savePlant(plant);
    }

    @GetMapping("/plants")
    public List<Plant> getPlants(Authentication auth) {
        return standardInfoService.getAllPlants(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/plants/{plantId}")
    public ResponseEntity<Plant> getPlant(@PathVariable String plantId, Authentication auth) {
        return standardInfoService.getPlantById(SecurityUtil.getCompanyId(auth), plantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/plants/{plantId}")
    public ResponseEntity<Void> deletePlant(@PathVariable String plantId, Authentication auth) {
        return standardInfoService.deletePlant(SecurityUtil.getCompanyId(auth), plantId)
                ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Dept
    @PostMapping("/depts")
    public Dept createDept(@RequestBody Dept dept, Authentication auth) {
        dept.setCompanyId(SecurityUtil.getCompanyId(auth));
        return standardInfoService.saveDept(dept);
    }

    @GetMapping("/depts")
    public List<Dept> getDepts(Authentication auth) {
        return standardInfoService.getAllDepts(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/depts/{deptId}")
    public ResponseEntity<Dept> getDept(@PathVariable String deptId, Authentication auth) {
        return standardInfoService.getDeptById(SecurityUtil.getCompanyId(auth), deptId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/depts/{deptId}")
    public ResponseEntity<Void> deleteDept(@PathVariable String deptId, Authentication auth) {
        return standardInfoService.deleteDept(SecurityUtil.getCompanyId(auth), deptId)
                ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Role
    @PostMapping("/roles")
    public Role createRole(@RequestBody Role role, Authentication auth) {
        role.setCompanyId(SecurityUtil.getCompanyId(auth));
        return standardInfoService.saveRole(role);
    }

    @GetMapping("/roles")
    public List<Role> getRoles(Authentication auth) {
        return standardInfoService.getAllRoles(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/roles/{roleId}")
    public ResponseEntity<Role> getRole(@PathVariable String roleId, Authentication auth) {
        return standardInfoService.getRoleById(SecurityUtil.getCompanyId(auth), roleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/roles/{roleId}")
    public ResponseEntity<Void> deleteRole(@PathVariable String roleId, Authentication auth) {
        return standardInfoService.deleteRole(SecurityUtil.getCompanyId(auth), roleId)
                ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Person
    @PostMapping("/persons")
    public Person createPerson(@RequestBody Person person, Authentication auth) {
        person.setCompanyId(SecurityUtil.getCompanyId(auth));
        return standardInfoService.savePerson(person);
    }

    @GetMapping("/persons")
    public List<Person> getPersons(Authentication auth) {
        return standardInfoService.getAllPersons(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/persons/{personId}")
    public ResponseEntity<Person> getPerson(@PathVariable String personId, Authentication auth) {
        return standardInfoService.getPersonById(SecurityUtil.getCompanyId(auth), personId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/persons/{personId}/password")
    public ResponseEntity<?> changePassword(@PathVariable String personId,
            @RequestBody java.util.Map<String, String> payload, Authentication auth) {
        try {
            standardInfoService.changePassword(SecurityUtil.getCompanyId(auth), personId,
                    payload.get("currentPassword"), payload.get("newPassword"));
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/persons/{personId}")
    public ResponseEntity<Void> deletePerson(@PathVariable String personId, Authentication auth) {
        return standardInfoService.deletePerson(SecurityUtil.getCompanyId(auth), personId)
                ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Storage
    @PostMapping("/storages")
    public Storage createStorage(@RequestBody Storage storage, Authentication auth) {
        storage.setCompanyId(SecurityUtil.getCompanyId(auth));
        return standardInfoService.saveStorage(storage);
    }

    @GetMapping("/storages")
    public List<Storage> getStorages(Authentication auth) {
        return standardInfoService.getAllStorages(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/storages/{storageId}")
    public ResponseEntity<Storage> getStorage(@PathVariable String storageId, Authentication auth) {
        return standardInfoService.getStorageById(SecurityUtil.getCompanyId(auth), storageId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/storages/{storageId}")
    public ResponseEntity<Void> deleteStorage(@PathVariable String storageId, Authentication auth) {
        return standardInfoService.deleteStorage(SecurityUtil.getCompanyId(auth), storageId)
                ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Bin
    @PostMapping("/bins")
    public Bin createBin(@RequestBody Bin bin, Authentication auth) {
        bin.setCompanyId(SecurityUtil.getCompanyId(auth));
        return standardInfoService.saveBin(bin);
    }

    @GetMapping("/bins")
    public List<Bin> getBins(Authentication auth) {
        return standardInfoService.getAllBins(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/bins/{binId}")
    public ResponseEntity<Bin> getBin(@PathVariable String binId, Authentication auth) {
        return standardInfoService.getBinById(SecurityUtil.getCompanyId(auth), binId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/bins/{binId}")
    public ResponseEntity<Void> deleteBin(@PathVariable String binId, Authentication auth) {
        return standardInfoService.deleteBin(SecurityUtil.getCompanyId(auth), binId)
                ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Location
    @PostMapping("/locations")
    public Location createLocation(@RequestBody Location location, Authentication auth) {
        location.setCompanyId(SecurityUtil.getCompanyId(auth));
        return standardInfoService.saveLocation(location);
    }

    @GetMapping("/locations")
    public List<Location> getLocations(Authentication auth) {
        return standardInfoService.getAllLocations(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/locations/{locationId}")
    public ResponseEntity<Location> getLocation(@PathVariable String locationId, Authentication auth) {
        return standardInfoService.getLocationById(SecurityUtil.getCompanyId(auth), locationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/locations/{locationId}")
    public ResponseEntity<Void> deleteLocation(@PathVariable String locationId, Authentication auth) {
        return standardInfoService.deleteLocation(SecurityUtil.getCompanyId(auth), locationId)
                ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Code
    @PostMapping("/codes")
    public Code createCode(@RequestBody Code code, Authentication auth) {
        code.setCompanyId(SecurityUtil.getCompanyId(auth));
        return standardInfoService.saveCode(code);
    }

    @GetMapping("/codes")
    public List<Code> getCodes(Authentication auth) {
        return standardInfoService.getAllCodes(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/codes/{codeId}")
    public ResponseEntity<Code> getCode(@PathVariable String codeId, Authentication auth) {
        return standardInfoService.getCodeById(SecurityUtil.getCompanyId(auth), codeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/codes/{codeId}")
    public ResponseEntity<Void> deleteCode(@PathVariable String codeId, Authentication auth) {
        return standardInfoService.deleteCode(SecurityUtil.getCompanyId(auth), codeId)
                ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/codes/{codeId}/items")
    public CodeItem createCodeItem(@PathVariable String codeId,
            @RequestBody CodeItem codeItem, Authentication auth) {
        codeItem.setCompanyId(SecurityUtil.getCompanyId(auth));
        codeItem.setCodeId(codeId);
        return standardInfoService.saveCodeItem(codeItem);
    }

    @GetMapping("/codes/{codeId}/items")
    public List<CodeItem> getCodeItemsByCodeId(@PathVariable String codeId, Authentication auth) {
        return standardInfoService.getCodeItemsByCodeId(SecurityUtil.getCompanyId(auth), codeId);
    }

    @GetMapping("/codes/{codeId}/items/{itemId}")
    public ResponseEntity<CodeItem> getCodeItem(@PathVariable String codeId,
            @PathVariable String itemId, Authentication auth) {
        return standardInfoService.getCodeItemById(SecurityUtil.getCompanyId(auth), codeId, itemId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/codes/{codeId}/items/{itemId}")
    public ResponseEntity<Void> deleteCodeItem(@PathVariable String codeId,
            @PathVariable String itemId, Authentication auth) {
        standardInfoService.deleteCodeItem(SecurityUtil.getCompanyId(auth), codeId, itemId);
        return ResponseEntity.ok().build();
    }
}
