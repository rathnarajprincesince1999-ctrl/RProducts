package com.rathnaproducts.backend.controller;

import com.rathnaproducts.backend.dto.AddressRequest;
import com.rathnaproducts.backend.model.Address;
import com.rathnaproducts.backend.model.User;
import com.rathnaproducts.backend.repo.AddressRepository;
import com.rathnaproducts.backend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AddressController {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/addresses/user")
    public ResponseEntity<List<Address>> getUserAddresses(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Address> addresses = addressRepository.findByUser(userOpt.get());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/addresses")
    public ResponseEntity<Address> createAddress(@RequestBody AddressRequest request, Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Address address = new Address(request.getType(), request.getFullAddress(), userOpt.get());
        Address savedAddress = addressRepository.save(address);
        return ResponseEntity.ok(savedAddress);
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long id, @RequestBody AddressRequest request, Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        Optional<Address> addressOpt = addressRepository.findById(id);
        
        if (userOpt.isEmpty() || addressOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Address address = addressOpt.get();
        if (!address.getUser().equals(userOpt.get())) {
            return ResponseEntity.status(403).build();
        }
        
        address.setType(request.getType());
        address.setFullAddress(request.getFullAddress());
        Address savedAddress = addressRepository.save(address);
        return ResponseEntity.ok(savedAddress);
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        Optional<Address> addressOpt = addressRepository.findById(id);
        
        if (userOpt.isEmpty() || addressOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Address address = addressOpt.get();
        if (!address.getUser().equals(userOpt.get())) {
            return ResponseEntity.status(403).build();
        }
        
        addressRepository.delete(address);
        return ResponseEntity.ok().build();
    }
}