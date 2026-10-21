import { Decimal } from 'decimal.js';

export function calcularCostoPromedioPonderado(
  stockActual: number | string | Decimal,
  costoActual: number | string | Decimal,
  cantidadNueva: number | string | Decimal,
  costoNuevo: number | string | Decimal
): Decimal {
  const stock = new Decimal(stockActual);
  const cActual = new Decimal(costoActual);
  const cantN = new Decimal(cantidadNueva);
  const cNuevo = new Decimal(costoNuevo);

  const totalStock = stock.plus(cantN);
  if (totalStock.isZero()) return new Decimal(0);

  const valorTotal = stock.times(cActual).plus(cantN.times(cNuevo));
  return valorTotal.dividedBy(totalStock).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function calcularUtilidadBruta(
  totalVenta: number | string | Decimal,
  costoTotalVenta: number | string | Decimal
): Decimal {
  const total = new Decimal(totalVenta);
  const costo = new Decimal(costoTotalVenta);
  return total.minus(costo).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function redondearCOP(monto: number | string | Decimal): Decimal {
  return new Decimal(monto).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}