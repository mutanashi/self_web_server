package com.salary.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret:mySecretKey}") String secret,
            @Value("${jwt.expiration:86400000}") String expirationStr
    ) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        // Ensure at least 256-bit key for HS256
        if (bytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(bytes, 0, padded, 0, Math.min(bytes.length, 32));
            this.key = Keys.hmacShaKeyFor(padded);
        } else {
            this.key = Keys.hmacShaKeyFor(bytes);
        }
        long exp = 86400000L;
        if (expirationStr != null && !expirationStr.isBlank()) {
            String s = expirationStr.trim();
            // Workaround if resource filtering stripped ${}, leaving "ENV:default"
            int colon = s.indexOf(':');
            if (colon >= 0 && !s.startsWith("P")) { // crude check to avoid ISO-8601 durations
                s = s.substring(colon + 1).trim();
            }
            try { exp = Long.parseLong(s); } catch (NumberFormatException ignored) {}
        }
        this.expirationMs = exp;
    }

    public String generateToken(String subject) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String validateAndGetSubject(String token) {
        try {
            Jws<Claims> jws = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return jws.getBody().getSubject();
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
