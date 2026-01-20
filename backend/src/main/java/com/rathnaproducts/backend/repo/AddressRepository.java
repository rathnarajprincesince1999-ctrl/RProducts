package com.rathnaproducts.backend.repo;

import com.rathnaproducts.backend.model.Address;
import com.rathnaproducts.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
}