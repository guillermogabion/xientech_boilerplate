const express = require('express');
const router = express.Router();
const { getResident, getResidentById, createResident, updateResident, deleteResident, getResidentAnalytics, getResidentsForAutocomplete, exportToExcel } = require('../controllers/residentController');

// ANALYTICS FIRST
router.get('/analytics/stats', getResidentAnalytics);
router.get('/autocomplete', getResidentsForAutocomplete);
router.get('/', getResident);     
router.get('/export', exportToExcel)
router.get('/:id', getResidentById);     
router.post('/', createResident);     
router.put('/:id', updateResident);   
router.delete('/:id', deleteResident);  

module.exports = router;


