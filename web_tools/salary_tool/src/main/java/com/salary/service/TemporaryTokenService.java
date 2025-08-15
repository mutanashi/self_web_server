package com.salary.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TemporaryTokenService {
    private static final SecureRandom RNG = new SecureRandom();

    private final long ttlSeconds;
    private final Map<String, Entry> cache = new ConcurrentHashMap<>();

    public TemporaryTokenService(@Value("${tempToken.expirationSeconds:600}") long ttlSeconds) {
        this.ttlSeconds = ttlSeconds > 0 ? ttlSeconds : 600;
    }

    public String issue(String subject) {
        String token = randomToken();
        long exp = Instant.now().getEpochSecond() + ttlSeconds;
        cache.put(token, new Entry(subject, exp));
        return token;
    }

    public String validateAndGetSubject(String token) {
        Entry e = cache.get(token);
        if (e == null) return null;
        long now = Instant.now().getEpochSecond();
        if (now > e.expiresAt) {
            cache.remove(token);
            return null;
        }
        return e.subject;
    }

    public void revoke(String token) {
        cache.remove(token);
    }

    private static String randomToken() {
        byte[] buf = new byte[24];
        RNG.nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }

    private static class Entry {
        final String subject;
        final long expiresAt;
        Entry(String subject, long expiresAt) {
            this.subject = Objects.requireNonNull(subject);
            this.expiresAt = expiresAt;
        }
    }
}

