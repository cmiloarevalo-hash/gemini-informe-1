export class TopographyArithmetic {
  /**
   * Parses surface text strings into normalized square meters (m²).
   * Supports: "8,85 ha", "0.98 ha", "1.200 m2", "1,200 m2", "9.800 m²", "10500 metros cuadrados".
   */
  public static parseSurfaceToM2(raw: string): number {
    const cleaned = raw.toLowerCase().trim();

    // Check if in hectares
    const isHectares = cleaned.includes("ha") || cleaned.includes("hectárea") || cleaned.includes("hectarea");

    // Extract numeric part (handles comma or period decimal separators)
    // Matches e.g. "8,85" or "1.200" or "8.85" or "1,200.50"
    const match = cleaned.match(/([\d\.,]+)/);
    if (!match) {
      throw new Error(`[SURFACE_PARSE_ERROR] No se pudo extraer un valor numérico de '${raw}'.`);
    }

    let numStr = match[1];

    if (isHectares) {
      // For hectares, "8,85" means 8.85
      numStr = numStr.replace(",", ".");
      const val = parseFloat(numStr);
      if (isNaN(val)) throw new Error(`[SURFACE_PARSE_ERROR] Número inválido en '${raw}'.`);
      return Math.round(val * 10000 * 100) / 100;
    } else {
      // In Chile/Latin America, "1.200 m2" means 1200, "1.200,50" means 1200.5
      if (numStr.includes(".") && numStr.includes(",")) {
        // e.g. "1.200,50"
        numStr = numStr.replace(/\./g, "").replace(",", ".");
      } else if (numStr.includes(".") && numStr.split(".")[1]?.length === 3) {
        // Thousands separator like "1.200" or "10.000"
        numStr = numStr.replace(/\./g, "");
      } else if (numStr.includes(",")) {
        numStr = numStr.replace(",", ".");
      }
      const val = parseFloat(numStr);
      if (isNaN(val)) throw new Error(`[SURFACE_PARSE_ERROR] Número inválido en '${raw}'.`);
      return Math.round(val * 100) / 100;
    }
  }

  /**
   * Calculates perimeter from an array of segment lengths.
   */
  public static calculatePerimeter(segments: number[]): number {
    const sum = segments.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum * 100) / 100;
  }

  /**
   * Calculates surface discrepancy between title deed and survey/plan.
   */
  public static calculateDiscrepancy(
    statedM2: number,
    measuredM2: number
  ): {
    absoluteDiffM2: number;
    percentageDiff: number;
    isWithinTolerance: boolean;
  } {
    const absoluteDiffM2 = Math.round(Math.abs(statedM2 - measuredM2) * 100) / 100;
    const percentageDiff = statedM2 > 0 ? Math.round((absoluteDiffM2 / statedM2) * 10000) / 100 : 0;
    // Standard legal margin of tolerance in rural/urban Chilean real estate: 2%
    const isWithinTolerance = percentageDiff <= 2.0;

    return {
      absoluteDiffM2,
      percentageDiff,
      isWithinTolerance
    };
  }
}
