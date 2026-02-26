package com.spendwise.controller;

import com.spendwise.model.Expense;
import com.spendwise.repository.ExpenseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin
public class ExpenseController {

    private final ExpenseRepository expenseRepository;

    public ExpenseController(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @PostMapping
    public Expense addExpense(@RequestBody Expense expense) {
        return expenseRepository.save(expense);
    }

    @GetMapping("/{userId}")
    public List<Expense> getExpenses(@PathVariable Long userId) {
        return expenseRepository.findByUserId(userId);
    }
}
