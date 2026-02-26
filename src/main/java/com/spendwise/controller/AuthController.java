package com.spendwise.controller;

import com.spendwise.model.User;
import com.spendwise.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // REGISTER
    @PostMapping("/register")
    public String register(@RequestBody User user) {
    userRepository.save(user);
    return "REGISTER_SUCCESS";
}


    // LOGIN
    @PostMapping("/login")
    public User login(@RequestBody User user) {
      return userRepository.findByEmail(user.getEmail())
            .filter(u -> u.getPassword().equals(user.getPassword()))
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
}
}