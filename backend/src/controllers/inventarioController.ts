import { Request, Response } from 'express';
import * as googleSheetsService from '../services/googleSheetsService';

/**
 * Get inventario from Google Sheets
 */
export const getInventario = async (req: Request, res: Response): Promise<void> => {
  try {
    const productos = await googleSheetsService.getInventario();
    res.json(productos);
  } catch (error) {
    console.error('Error getting inventario:', error);
    res.status(500).json({ error: 'Failed to get inventario' });
  }
};
