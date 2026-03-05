import { PRESETS } from '../services/presetService.js';
export const getPresets = (req, res, next) => {
    try {
        res.json(PRESETS);
    }
    catch (error) {
        next(error);
    }
};
