import express from 'express';
import {
  getAllUsers,
  getUserWorkload,
  createTeamMember,
  updateUserRole,
  deleteTeamMember
} from '../controllers/userController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllUsers);
router.get('/workload', authorizeRole('admin'), getUserWorkload);
router.post('/', authorizeRole('admin'), createTeamMember);
router.put('/:id/role', authorizeRole('admin'), updateUserRole);
router.delete('/:id', authorizeRole('admin'), deleteTeamMember);

export default router;
