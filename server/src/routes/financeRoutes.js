const express = require('express');
const router = express.Router();

// Import the entire object as 'financeController'
const financeController = require('../controllers/financeController');

// --- FINANCE REQUESTS (Transactions) ---
router.get('/', financeController.getFinanceRequests);       // Get paginated/searchable list
router.get('/summary', financeController.getFinanceSummary); // Stats for dashboard cards
router.post('/', financeController.createFinanceRequest);    // Submit new request
router.patch('/:id/approve', financeController.approveRequest); // Approve & deduct from budget

// --- BUDGET & APPROPRIATIONS (Source of Truth) ---
// These are the routes for your new Budget module
router.get('/budgets', financeController.getBudgets);        // Get all budget categories/balances
router.post('/budgets', financeController.upsertBudget);     // Add or Update budget allocation

module.exports = router;