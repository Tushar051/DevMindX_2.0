package com.kaamwala.kaamwala_backend.repository;

import com.kaamwala.kaamwala_backend.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByMobile(String mobile);
    Optional<User> findByAadhaar(String aadhaar);
} 