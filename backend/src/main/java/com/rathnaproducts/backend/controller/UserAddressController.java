package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.model.User;
import com.rathnaproducts.backend.model.UserAddress;
import com.rathnaproducts.backend.repo.UserAddressRepository;
import com.rathnaproducts.backend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-addresses")
@CrossOrigin(origins = "*")
public class UserAddressController {

    @Autowired
    private UserAddressRepository userAddressRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user")
    public ResponseEntity<List<UserAddress>> getUserAddresses(@RequestParam String userEmail) {
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<UserAddress> addresses = userAddressRepository.findByUserOrderByIsDefaultDescIdDesc(userOpt.get());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/save")
    public ResponseEntity<UserAddress> saveAddress(@RequestBody Map<String, Object> request, @RequestParam String userEmail) {
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        UserAddress address = new UserAddress();
        address.setUser(user);
        address.setAddressLine((String) request.get("addressLine"));
        address.setCity((String) request.get("city"));
        address.setState((String) request.get("state"));
        address.setPincode((String) request.get("pincode"));
        address.setPhone((String) request.get("phone"));
        address.setAddressType((String) request.get("addressType"));
        address.setLandmark((String) request.get("landmark"));
        address.setIsDefault((Boolean) request.get("isDefault"));

        // If this is set as default, unset other defaults
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            Optional<UserAddress> currentDefault = userAddressRepository.findByUserAndIsDefaultTrue(user);
            if (currentDefault.isPresent()) {
                currentDefault.get().setIsDefault(false);
                userAddressRepository.save(currentDefault.get());
            }
        }

        UserAddress savedAddress = userAddressRepository.save(address);
        return ResponseEntity.ok(savedAddress);
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<UserAddress> setDefaultAddress(@PathVariable Long id, @RequestParam String userEmail) {
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<UserAddress> addressOpt = userAddressRepository.findById(id);
        if (addressOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        UserAddress address = addressOpt.get();

        // Unset current default
        Optional<UserAddress> currentDefault = userAddressRepository.findByUserAndIsDefaultTrue(user);
        if (currentDefault.isPresent()) {
            currentDefault.get().setIsDefault(false);
            userAddressRepository.save(currentDefault.get());
        }

        // Set new default
        address.setIsDefault(true);
        UserAddress updatedAddress = userAddressRepository.save(address);
        return ResponseEntity.ok(updatedAddress);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id, @RequestParam String userEmail) {
        Optional<UserAddress> addressOpt = userAddressRepository.findById(id);
        if (addressOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userAddressRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}