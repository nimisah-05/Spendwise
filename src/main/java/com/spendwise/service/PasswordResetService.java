package com.spendwise.service;

import com.spendwise.model.PasswordResetToken;
import com.spendwise.model.User;
import com.spendwise.repository.PasswordResetTokenRepository;
import com.spendwise.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetLink(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return;

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(resetToken);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("SpendWise Password Reset");
        message.setText(
            "Reset your password:\n" +
            "http://localhost:8083/reset-password.html?token=" + token
        );

        mailSender.send(message);
    }

    public boolean resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken =
                tokenRepository.findByToken(token).orElse(null);

        if (resetToken == null ||
            resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }

        User user = resetToken.getUser();
        user.setPassword(newPassword);
        userRepository.save(user);
        tokenRepository.delete(resetToken);
        return true;
    }
}
