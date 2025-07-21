package com.teacher.managerment.service;

import com.teacher.managerment.dto.request.LoginRequest;
import com.teacher.managerment.dto.response.LoginResponse;
import com.teacher.managerment.entity.User;
import com.teacher.managerment.repository.UserRepository;
import com.teacher.managerment.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            logger.info("Ten1: {}  Password1: {}", loginRequest.getUsername(), loginRequest.getPassword());
            logger.info("Authentication object: {}", authentication);
            logger.info("Principal (UserDetails): {}", authentication.getPrincipal());
            logger.info("Username: {}", authentication.getName());
            logger.info("Authorities: {}", authentication.getAuthorities());
            logger.info("Details: {}", authentication.getDetails());

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken((UserDetails) authentication.getPrincipal());

            User userDetails = (User) authentication.getPrincipal();

            return new LoginResponse(jwt,
                    userDetails.getUsername(),
                    userDetails.getFullName(),
                    userDetails.getEmail(),
                    userDetails.getRole().name());

        } catch (Exception e) {
            logger.error("Lỗi xác thực: {}", e.getMessage());
            throw e; // ném ra lại để controller trả lỗi cho client
        }
    }
}
