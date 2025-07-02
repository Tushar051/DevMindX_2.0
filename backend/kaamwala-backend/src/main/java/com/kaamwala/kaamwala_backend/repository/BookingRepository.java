package com.kaamwala.kaamwala_backend.repository;

import com.kaamwala.kaamwala_backend.entity.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByCustomerId(String customerId);
    List<Booking> findByElectricianId(String electricianId);
} 