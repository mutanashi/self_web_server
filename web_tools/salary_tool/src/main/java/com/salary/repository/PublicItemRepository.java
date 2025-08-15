package com.salary.repository;

import com.salary.entity.PublicItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicItemRepository extends JpaRepository<PublicItem, Long> {}

