import { google } from 'googleapis';
import { Producto } from '../types';
import path from 'path';

const SERVICE_ACCOUNT_KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE ||
  path.join(__dirname, '../../service-account-key.json');

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Get all products from Google Sheets
 */
export const getInventario = async (): Promise<Producto[]> => {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
    const sheetRange = process.env.GOOGLE_SHEETS_RANGE || 'Hoja 1!A2:I';

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not configured');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetRange,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    // A=Codigo, B=Producto, C=Categoria, D=Subcategoria, E=Presentacion, I=Stock
    return rows.map((row) => ({
      codigo: row[0] || '',
      producto: row[1] || '',
      categoria: row[2] || '',
      subcategoria: row[3] || '',
      presentacion: row[4] || '',
      stock: parseInt(row[8]) || 0,
    }));
  } catch (error) {
    console.error('Error reading Google Sheets:', error);
    throw error;
  }
};
