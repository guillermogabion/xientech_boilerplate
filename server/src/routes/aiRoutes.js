const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

/**
 * @route   GET /api/ai/finance-insights
 * @desc    Get AI analysis of budget appropriations and spending
 * @access  Private (Treasurer/Admin)
 */
router.post('/finance-insights', aiController.getFinanceInsights);

/**
 * @route   GET /api/ai/health-trends
 * @desc    Analyze clinic visits and resident health profiles
 * @access  Private (BHW/Health Officers)
 */
router.post('/health-trends', aiController.getHealthTrends);

/**
 * @route   GET /api/ai/blotter-summary/:id
 * @desc    Summarize incident narrative and suggest mediation
 * @access  Private (Captain/Secretary/Tanod)
 */
router.post('/blotter-summary', aiController.getBlotterSummary);

/**
 * @route   GET /api/ai/hotspot-analysis
 * @desc    BIA Agent: Identify emerging hotspots and 24h severity spikes
 * @access  Private (Captain/Secretary/Tanod)
 */
router.get('/hotspot-analysis', aiController.getHotspotAnalysis);

/**
 * @route   POST /api/ai/check-clarity
 * @desc    Analyze text for clarity and policy compliance
 * @access  Private
 */
router.post('/check-clarity', aiController.checkClarity);

module.exports = router;