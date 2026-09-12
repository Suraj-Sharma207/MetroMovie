import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus
} from '../controllers/wishlistController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Retrieve authenticated user's wishlist items
router.get('/', requireAuth, getWishlist);

// Add movie to authenticated user's wishlist
router.post('/', requireAuth, addToWishlist);

// Remove movie from authenticated user's wishlist
router.delete('/:movieId', requireAuth, removeFromWishlist);

// Guest-friendly check (returns isWishlisted: false if not authenticated, true/false if authenticated)
router.get('/:movieId/check', checkWishlistStatus);

export default router;
