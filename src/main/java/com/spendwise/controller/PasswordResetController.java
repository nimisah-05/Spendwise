package com.spendwise.controller;

import com.spendwise.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {
        passwordResetService.sendResetLink(email);
        return "If email exists, reset link sent.";
    }

    @PostMapping("/reset-password")
    public String resetPassword(
            @RequestParam String token,
            @RequestParam String password
    ) {
        boolean success = passwordResetService.resetPassword(token, password);
        return success ? "Password updated" : "Invalid or expired token";
    }
}
