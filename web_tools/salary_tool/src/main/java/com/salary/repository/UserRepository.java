// UserRepository.java
package com.salary.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.salary.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationToken(String token);
    
    @Query("SELECT u FROM User u WHERE u.role = 'EMPLOYEE'")
    List<User> findAllEmployees();
    
    @Query("SELECT u FROM User u WHERE u.role = 'EMPLOYEE' AND :label MEMBER OF u.labels")
    List<User> findEmployeesByLabel(@Param("label") User.Label label);
    
    @Query("SELECT u FROM User u WHERE u.role = 'EMPLOYEE' AND u.id IN :ids")
    List<User> findEmployeesByIds(@Param("ids") List<Long> ids);
}





