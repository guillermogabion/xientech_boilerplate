const express = require('express');
const router = express.Router();
const {
    getResidentCount,
    getHouseholdStats,
    getPurokDistribution,
    getBlotterStats,
    getIncidentDistribution,
    getUpcomingHearings,
    getHealthVulnerabilityStats,
    getBloodTypeDistribution,
    getClinicVisitTrends,
    getWasteComplianceStats,
    getViolationDistribution,
    getCollectionPerformance,
    getFinancialSummary,
    getApplicationStats,
    getSkProgramDistribution,
    getBudgetUtilization,
    getAppropriationList,
    getFinanceRequestStats
} = require('../controllers/dashboardsController'); // Ensure this matches your controller filename

// --- Resident & Household Routes ---
router.get('/residents/count', getResidentCount);
router.get('/households/stats', getHouseholdStats);
router.get('/households/purok-distribution', getPurokDistribution);

// --- Peace and Order (Blotter) Routes ---
router.get('/blotter/stats', getBlotterStats);
router.get('/blotter/incidents', getIncidentDistribution);
router.get('/blotter/hearings-upcoming', getUpcomingHearings);

// --- Health & Social Services Routes ---
router.get('/health/vulnerability', getHealthVulnerabilityStats);
router.get('/health/blood-types', getBloodTypeDistribution);
router.get('/health/clinic-trends', getClinicVisitTrends);

// --- Waste Management Routes ---
router.get('/waste/compliance', getWasteComplianceStats);
router.get('/waste/violations', getViolationDistribution);
router.get('/waste/collection-performance', getCollectionPerformance);

// --- SK & Service Application Routes ---
router.get('/sk/finance-summary', getFinancialSummary);
router.get('/sk/programs', getSkProgramDistribution);
router.get('/services/applications', getApplicationStats);

// --- Finance & Appropriations Routes ---
router.get('/finance/budget-utilization', getBudgetUtilization);
router.get('/finance/appropriations', getAppropriationList);
router.get('/finance/requests-stats', getFinanceRequestStats);
router.get('/finance/summary', getFinancialSummary);

module.exports = router;