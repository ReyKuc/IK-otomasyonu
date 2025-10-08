const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/authMiddleware');


router.get('/personnel', verifyAdmin, adminController.getAllPersonnels);
router.post('/personnel', verifyAdmin, adminController.addPersonnel);
router.put('/personnel/:id', verifyAdmin, adminController.updatePersonnel);
router.delete('/personnel/:id', verifyAdmin, adminController.deletePersonnel);


router.post('/leave', verifyAdmin, adminController.addLeave);
router.put('/leave/:leaveId', verifyAdmin, adminController.updateLeave);
router.delete('/leave/:leaveId', verifyAdmin, adminController.deleteLeave);


router.get('/dashboard', verifyAdmin, adminController.dashboard);

module.exports = router; 
