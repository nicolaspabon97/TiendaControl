import { calcularCostoPromedioPonderado, calcularUtilidadBruta } from './calculations';

describe('Pruebas del Motor Financiero - TiendaControl', () => {
  test('Calcula el Costo Promedio Ponderado correctamente', () => {
    const nuevoCosto = calcularCostoPromedioPonderado(10, 1000, 10, 2000);
    expect(nuevoCosto.toNumber()).toBe(1500);
  });

  test('Calcula la Utilidad Bruta Estimada sin error flotante', () => {
    const utilidad = calcularUtilidadBruta('15000.50', '10000.20');
    expect(utilidad.toNumber()).toBe(5000.30);
  });
});