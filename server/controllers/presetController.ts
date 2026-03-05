import { Request, Response, NextFunction } from 'express';
import { PRESETS } from '../services/presetService.js';

export const getPresets = (req: Request, res: Response, next: NextFunction): void => {
    try {
        res.json(PRESETS);
    } catch (error) {
        next(error);
    }
};
