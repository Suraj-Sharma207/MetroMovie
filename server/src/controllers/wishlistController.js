import { wishlistService } from '../services/wishlistService.js';

export const getWishlist = async (req, res, next) => {
  try {
    const items = await wishlistService.getAll(req.user.id);
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const item = await wishlistService.add(req.user.id, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const result = await wishlistService.remove(req.user.id, movieId);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const checkWishlistStatus = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(200).json({ success: true, isWishlisted: false });
    }
    const { movieId } = req.params;
    const isWishlisted = await wishlistService.check(req.user.id, movieId);
    res.status(200).json({ success: true, isWishlisted });
  } catch (err) {
    next(err);
  }
};
