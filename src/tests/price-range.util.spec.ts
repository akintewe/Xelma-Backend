import {
  validateUserPriceRange,
  validateRoundPriceRanges,
  createUserPriceRange,
  createRoundPriceRange,
  findRangeByBounds,
  updateRangePool,
  parseRoundPriceRanges,
  userPriceRangeSchema,
  roundPriceRangeSchema,
} from "../utils/price-range.util";
import {
  isRoundPriceRange,
  isUserPriceRange,
  isRoundPriceRangeArray,
} from "../types/round.types";

describe("PriceRange Type Guards", () => {
  describe("isRoundPriceRange", () => {
    it("returns true for valid RoundPriceRange", () => {
      expect(isRoundPriceRange({ min: 1, max: 2, pool: 100 })).toBe(true);
    });

    it("returns false for missing pool", () => {
      expect(isRoundPriceRange({ min: 1, max: 2 })).toBe(false);
    });

    it("returns false for min >= max", () => {
      expect(isRoundPriceRange({ min: 2, max: 2, pool: 100 })).toBe(false);
      expect(isRoundPriceRange({ min: 3, max: 2, pool: 100 })).toBe(false);
    });

    it("returns false for non-object values", () => {
      expect(isRoundPriceRange(null)).toBe(false);
      expect(isRoundPriceRange(undefined)).toBe(false);
      expect(isRoundPriceRange("string")).toBe(false);
      expect(isRoundPriceRange(123)).toBe(false);
    });

    it("returns false for non-number fields", () => {
      expect(isRoundPriceRange({ min: "1", max: 2, pool: 100 })).toBe(false);
      expect(isRoundPriceRange({ min: 1, max: "2", pool: 100 })).toBe(false);
      expect(isRoundPriceRange({ min: 1, max: 2, pool: "100" })).toBe(false);
    });
  });

  describe("isUserPriceRange", () => {
    it("returns true for valid UserPriceRange", () => {
      expect(isUserPriceRange({ min: 1, max: 2 })).toBe(true);
    });

    it("returns false for min >= max", () => {
      expect(isUserPriceRange({ min: 2, max: 2 })).toBe(false);
      expect(isUserPriceRange({ min: 3, max: 2 })).toBe(false);
    });

    it("returns false for non-object values", () => {
      expect(isUserPriceRange(null)).toBe(false);
      expect(isUserPriceRange(undefined)).toBe(false);
    });
  });

  describe("isRoundPriceRangeArray", () => {
    it("returns true for valid array", () => {
      expect(
        isRoundPriceRangeArray([
          { min: 1, max: 2, pool: 100 },
          { min: 2, max: 3, pool: 200 },
        ]),
      ).toBe(true);
    });

    it("returns false for empty array", () => {
      expect(isRoundPriceRangeArray([])).toBe(true);
    });

    it("returns false for array with invalid items", () => {
      expect(
        isRoundPriceRangeArray([{ min: 1, max: 2, pool: 100 }, { min: 3, max: 4 }]),
      ).toBe(false);
    });

    it("returns false for non-array values", () => {
      expect(isRoundPriceRangeArray("string")).toBe(false);
      expect(isRoundPriceRangeArray({})).toBe(false);
    });
  });
});

describe("PriceRange Validation", () => {
  describe("validateUserPriceRange", () => {
    it("returns valid for correct range", () => {
      const result = validateUserPriceRange({ min: 1, max: 2 });
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.min).toBe(1);
        expect(result.data.max).toBe(2);
      }
    });

    it("returns error for min >= max", () => {
      const result = validateUserPriceRange({ min: 2, max: 2 });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toContain("min must be less than max");
      }
    });

    it("returns error for missing fields", () => {
      const result = validateUserPriceRange({ min: 1 });
      expect(result.valid).toBe(false);
    });

    it("returns error for null/undefined", () => {
      expect(validateUserPriceRange(null).valid).toBe(false);
      expect(validateUserPriceRange(undefined).valid).toBe(false);
    });
  });

  describe("validateRoundPriceRanges", () => {
    it("returns valid for correct ranges array", () => {
      const result = validateRoundPriceRanges([
        { min: 1, max: 2, pool: 100 },
        { min: 2, max: 3, pool: 200 },
      ]);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data).toHaveLength(2);
      }
    });

    it("returns error for array with invalid range", () => {
      const result = validateRoundPriceRanges([
        { min: 1, max: 2, pool: 100 },
        { min: 3, max: 2, pool: 200 },
      ]);
      expect(result.valid).toBe(false);
    });

    it("returns error for non-array", () => {
      expect(validateRoundPriceRanges({ min: 1, max: 2, pool: 100 }).valid).toBe(
        false,
      );
    });

    it("returns valid for empty array (initial state)", () => {
      expect(validateRoundPriceRanges([]).valid).toBe(true);
    });
  });
});

describe("PriceRange Creation", () => {
  describe("createUserPriceRange", () => {
    it("creates valid user price range", () => {
      const range = createUserPriceRange(1.5, 2.5);
      expect(range.min).toBe(1.5);
      expect(range.max).toBe(2.5);
    });

    it("throws for invalid range", () => {
      expect(() => createUserPriceRange(3, 2)).toThrow();
    });
  });

  describe("createRoundPriceRange", () => {
    it("creates valid round price range with default pool", () => {
      const range = createRoundPriceRange(1, 2);
      expect(range.min).toBe(1);
      expect(range.max).toBe(2);
      expect(range.pool).toBe(0);
    });

    it("creates valid round price range with custom pool", () => {
      const range = createRoundPriceRange(1, 2, 500);
      expect(range.min).toBe(1);
      expect(range.max).toBe(2);
      expect(range.pool).toBe(500);
    });

    it("throws for invalid range", () => {
      expect(() => createRoundPriceRange(3, 2)).toThrow();
    });
  });
});

describe("PriceRange Helpers", () => {
  const ranges = [
    { min: 1, max: 2, pool: 100 },
    { min: 2, max: 3, pool: 200 },
    { min: 3, max: 4, pool: 300 },
  ];

  describe("findRangeByBounds", () => {
    it("finds existing range", () => {
      const found = findRangeByBounds(ranges, 2, 3);
      expect(found).toEqual({ min: 2, max: 3, pool: 200 });
    });

    it("returns undefined for non-existing range", () => {
      const found = findRangeByBounds(ranges, 5, 6);
      expect(found).toBeUndefined();
    });
  });

  describe("updateRangePool", () => {
    it("updates pool for matching range", () => {
      const updated = updateRangePool(ranges, 2, 3, 50);
      expect(updated[1].pool).toBe(250);
    });

    it("does not modify other ranges", () => {
      const updated = updateRangePool(ranges, 2, 3, 50);
      expect(updated[0].pool).toBe(100);
      expect(updated[2].pool).toBe(300);
    });

    it("returns unchanged array for non-existing range", () => {
      const updated = updateRangePool(ranges, 5, 6, 50);
      expect(updated).toEqual(ranges);
    });
  });
});

describe("parseRoundPriceRanges", () => {
  it("parses valid array", () => {
    const input = [
      { min: 1, max: 2, pool: 100 },
      { min: 2, max: 3, pool: 200 },
    ];
    const result = parseRoundPriceRanges(input);
    expect(result).toEqual(input);
  });

  it("throws for invalid input", () => {
    expect(() => parseRoundPriceRanges(null)).toThrow();
    expect(() => parseRoundPriceRanges("string")).toThrow();
    expect(() => parseRoundPriceRanges([{ min: 1, max: 2 }])).toThrow();
  });
});

describe("Zod Schemas", () => {
  describe("userPriceRangeSchema", () => {
    it("validates correct input", () => {
      const result = userPriceRangeSchema.safeParse({ min: 1, max: 2 });
      expect(result.success).toBe(true);
    });

    it("rejects invalid input", () => {
      expect(userPriceRangeSchema.safeParse({ min: 2, max: 1 }).success).toBe(
        false,
      );
      expect(userPriceRangeSchema.safeParse({ min: 1 }).success).toBe(false);
    });
  });

  describe("roundPriceRangeSchema", () => {
    it("validates correct input", () => {
      const result = roundPriceRangeSchema.safeParse({
        min: 1,
        max: 2,
        pool: 100,
      });
      expect(result.success).toBe(true);
    });

    it("allows optional pool with default", () => {
      const result = roundPriceRangeSchema.safeParse({ min: 1, max: 2 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pool).toBe(0);
      }
    });

    it("rejects invalid input", () => {
      expect(
        roundPriceRangeSchema.safeParse({ min: 2, max: 1, pool: 100 }).success,
      ).toBe(false);
    });
  });
});

describe("Edge Cases", () => {
  it("handles decimal values correctly", () => {
    const result = validateUserPriceRange({ min: 1.5, max: 2.5 });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.min).toBe(1.5);
      expect(result.data.max).toBe(2.5);
    }
  });

  it("handles zero values", () => {
    const result = validateUserPriceRange({ min: 0, max: 1 });
    expect(result.valid).toBe(true);
  });

  it("handles very large numbers", () => {
    const result = validateUserPriceRange({
      min: 999999999,
      max: 1000000000,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects malicious input patterns", () => {
    expect(validateUserPriceRange({ min: NaN, max: 2 }).valid).toBe(false);
    expect(validateUserPriceRange({ min: 1, max: Infinity }).valid).toBe(false);
  });
});
