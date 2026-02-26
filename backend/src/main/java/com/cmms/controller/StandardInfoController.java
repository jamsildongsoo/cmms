package com.cmms.controller;

import com.cmms.domain.*;
import com.cmms.service.StandardInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/std")
@RequiredArgsConstructor
public class StandardInfoController {

    private final StandardInfoService standardInfoService;

    @PostMapping("/plants")
    public Plant createPlant(@RequestBody Plant plant) {
        return standardInfoService.savePlant(plant);
    }

    @GetMapping("/plants")
    public List<Plant> getPlants(@RequestParam String companyId) {
        return standardInfoService.getAllPlants(companyId);
    }

    @GetMapping("/plants/{companyId}/{plantId}")
    public ResponseEntity<Plant> getPlant(@PathVariable String companyId, @PathVariable String plantId) {
        return standardInfoService.getPlantById(companyId, plantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/plants/{companyId}/{plantId}")
    public ResponseEntity<Void> deletePlant(@PathVariable String companyId, @PathVariable String plantId) {
        standardInfoService.deletePlant(companyId, plantId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/depts")
    public Dept createDept(@RequestBody Dept dept) {
        return standardInfoService.saveDept(dept);
    }

    @GetMapping("/depts")
    public List<Dept> getDepts(@RequestParam String companyId) {
        return standardInfoService.getAllDepts(companyId);
    }

    @GetMapping("/depts/{companyId}/{deptId}")
    public ResponseEntity<Dept> getDept(@PathVariable String companyId, @PathVariable String deptId) {
        return standardInfoService.getDeptById(companyId, deptId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/depts/{companyId}/{deptId}")
    public ResponseEntity<Void> deleteDept(@PathVariable String companyId, @PathVariable String deptId) {
        standardInfoService.deleteDept(companyId, deptId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/roles")
    public Role createRole(@RequestBody Role role) {
        return standardInfoService.saveRole(role);
    }

    @GetMapping("/roles")
    public List<Role> getRoles(@RequestParam String companyId) {
        return standardInfoService.getAllRoles(companyId);
    }

    @GetMapping("/roles/{companyId}/{roleId}")
    public ResponseEntity<Role> getRole(@PathVariable String companyId, @PathVariable String roleId) {
        return standardInfoService.getRoleById(companyId, roleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/roles/{companyId}/{roleId}")
    public ResponseEntity<Void> deleteRole(@PathVariable String companyId, @PathVariable String roleId) {
        standardInfoService.deleteRole(companyId, roleId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/persons")
    public Person createPerson(@RequestBody Person person) {
        return standardInfoService.savePerson(person);
    }

    @GetMapping("/persons")
    public List<Person> getPersons(@RequestParam String companyId) {
        return standardInfoService.getAllPersons(companyId);
    }

    @GetMapping("/persons/{companyId}/{personId}")
    public ResponseEntity<Person> getPerson(@PathVariable String companyId, @PathVariable String personId) {
        return standardInfoService.getPersonById(companyId, personId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/persons/{companyId}/{personId}")
    public ResponseEntity<Void> deletePerson(@PathVariable String companyId, @PathVariable String personId) {
        standardInfoService.deletePerson(companyId, personId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/storages")
    public Storage createStorage(@RequestBody Storage storage) {
        return standardInfoService.saveStorage(storage);
    }

    @GetMapping("/storages")
    public List<Storage> getStorages(@RequestParam String companyId) {
        return standardInfoService.getAllStorages(companyId);
    }

    @GetMapping("/storages/{companyId}/{storageId}")
    public ResponseEntity<Storage> getStorage(@PathVariable String companyId, @PathVariable String storageId) {
        return standardInfoService.getStorageById(companyId, storageId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/storages/{companyId}/{storageId}")
    public ResponseEntity<Void> deleteStorage(@PathVariable String companyId, @PathVariable String storageId) {
        standardInfoService.deleteStorage(companyId, storageId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bins")
    public Bin createBin(@RequestBody Bin bin) {
        return standardInfoService.saveBin(bin);
    }

    @GetMapping("/bins")
    public List<Bin> getBins() {
        return standardInfoService.getAllBins();
    }

    @GetMapping("/bins/{companyId}/{binId}")
    public ResponseEntity<Bin> getBin(@PathVariable String companyId, @PathVariable String binId) {
        return standardInfoService.getBinById(companyId, binId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/bins/{companyId}/{binId}")
    public ResponseEntity<Void> deleteBin(@PathVariable String companyId, @PathVariable String binId) {
        standardInfoService.deleteBin(companyId, binId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/locations")
    public Location createLocation(@RequestBody Location location) {
        return standardInfoService.saveLocation(location);
    }

    @GetMapping("/locations")
    public List<Location> getLocations() {
        return standardInfoService.getAllLocations();
    }

    @GetMapping("/locations/{companyId}/{binId}/{locationId}")
    public ResponseEntity<Location> getLocation(@PathVariable String companyId, @PathVariable String binId,
            @PathVariable String locationId) {
        return standardInfoService.getLocationById(companyId, binId, locationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/locations/{companyId}/{binId}/{locationId}")
    public ResponseEntity<Void> deleteLocation(@PathVariable String companyId, @PathVariable String binId,
            @PathVariable String locationId) {
        standardInfoService.deleteLocation(companyId, binId, locationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/codes")
    public Code createCode(@RequestBody Code code) {
        return standardInfoService.saveCode(code);
    }

    @GetMapping("/codes")
    public List<Code> getCodes(@RequestParam String companyId) {
        return standardInfoService.getAllCodes(companyId);
    }

    @GetMapping("/codes/{companyId}/{codeId}")
    public ResponseEntity<Code> getCode(@PathVariable String companyId, @PathVariable String codeId) {
        return standardInfoService.getCodeById(companyId, codeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/codes/{companyId}/{codeId}")
    public ResponseEntity<Void> deleteCode(@PathVariable String companyId, @PathVariable String codeId) {
        standardInfoService.deleteCode(companyId, codeId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/codes/{companyId}/{codeId}/items")
    public CodeItem createCodeItem(@PathVariable String companyId, @PathVariable String codeId,
            @RequestBody CodeItem codeItem) {
        codeItem.setCompanyId(companyId);
        codeItem.setCodeId(codeId);
        return standardInfoService.saveCodeItem(codeItem);
    }

    @GetMapping("/codes/{companyId}/{codeId}/items")
    public List<CodeItem> getCodeItemsByCodeId(@PathVariable String companyId, @PathVariable String codeId) {
        return standardInfoService.getCodeItemsByCodeId(companyId, codeId);
    }

    @GetMapping("/codes/{companyId}/{codeId}/items/{itemId}")
    public ResponseEntity<CodeItem> getCodeItem(@PathVariable String companyId, @PathVariable String codeId,
            @PathVariable String itemId) {
        return standardInfoService.getCodeItemById(companyId, codeId, itemId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/codes/{companyId}/{codeId}/items/{itemId}")
    public ResponseEntity<Void> deleteCodeItem(@PathVariable String companyId, @PathVariable String codeId,
            @PathVariable String itemId) {
        standardInfoService.deleteCodeItem(companyId, codeId, itemId);
        return ResponseEntity.ok().build();
    }
}
