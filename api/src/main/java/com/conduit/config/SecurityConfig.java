package com.conduit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Security configuration for the Conduit API
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/actuator/**").permitAll()
                .antMatchers("/api/health").permitAll()
                .antMatchers("/api/users/login").permitAll()
                .antMatchers("/api/users").permitAll()
                .antMatchers("/api/articles", "/api/articles/**").permitAll()
                .antMatchers("/api/profiles/**").permitAll()
                .antMatchers("/api/tags").permitAll()
                .anyRequest().authenticated()
            .and()
            .headers().frameOptions().sameOrigin();
            
        return http.build();
    }
}