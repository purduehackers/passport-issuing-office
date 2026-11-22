/**
 * Print geometry, the same physical size as the old passport-pdf-concat tool.
 * One booklet page is 324.63 × 475.86 units, and one unit is 3.21/300 inch.
 */
export const UNIT_INCHES = 3.21 / 300;
export const BOOKLET_PAGE_WIDTH = 324.63;
export const BOOKLET_PAGE_HEIGHT = 475.86;
export const PRINT_DPI = 600;

/** The data page, before it is turned upright on the booklet page. */
export const DATA_PAGE_PIXELS = {
  width: Math.round(BOOKLET_PAGE_HEIGHT * UNIT_INCHES * PRINT_DPI),
  height: Math.round(BOOKLET_PAGE_WIDTH * UNIT_INCHES * PRINT_DPI),
};

/** PDF points for a length in units. */
export const unitsToPoints = (units: number) => units * UNIT_INCHES * 72;
