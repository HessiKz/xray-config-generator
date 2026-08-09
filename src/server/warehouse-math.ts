/** Pure warehouse daily report math — unit tested. */
export function systemBalance(opening: number, purchase: number, sale: number) {
  return round4(opening + purchase - sale);
}

export function variance(system: number, warehouse: number) {
  return round4(system - warehouse);
}

export function round4(n: number) {
  return Math.round(n * 10000) / 10000;
}

export type WarehouseLineInput = {
  opening: number;
  purchase: number;
  sale: number;
  warehouseBalance: number;
};

export function computeWarehouseLine(input: WarehouseLineInput) {
  const system = systemBalance(input.opening, input.purchase, input.sale);
  return {
    systemBalance: system,
    variance: variance(system, input.warehouseBalance),
  };
}
