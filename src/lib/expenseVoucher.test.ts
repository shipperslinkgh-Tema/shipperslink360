import { describe, it, expect } from "vitest";
import { amountInWords, itemsTotal } from "./expenseVoucher";

describe("expense voucher", () => {
  it("totals items to two decimals", () => {
    expect(itemsTotal([{ description: "a", ref: "", amount: 10000.5 }, { description: "b", ref: "", amount: 471.37 }])).toBe(10471.87);
  });
  it("writes cedis and pesewas in words", () => {
    expect(amountInWords(10471.87)).toBe("Ten Thousand Four Hundred and Seventy-One Cedis, Eighty-Seven Pesewas Only");
  });
});
