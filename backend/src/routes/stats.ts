import { Router } from 'express';
import { statsService } from '../services/statsService';

const router = Router();

router.get('/player/:playerName', async (req, res, next) => {
  try {
    const { playerName } = req.params;
    const stats = await statsService.getStats(playerName);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Player stats not found',
      });
    }
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

