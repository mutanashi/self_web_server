// PublicItemRepository.java
package com.salary.repository;

import com.salary.entity.PublicItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PublicItemRepository extends JpaRepository<PublicItem, Long> {
    @Query("SELECT p FROM PublicItem p WHERE p.active = true AND (p.endDate IS NULL OR p.endDate > :now)")
    List<PublicItem> findActiveItems(@Param("now") LocalDateTime now);
    
    List<PublicItem> findByActiveTrueOrderByCreatedAtDesc();
}