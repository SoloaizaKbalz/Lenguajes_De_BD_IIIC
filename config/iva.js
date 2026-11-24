const TASA_IVA = 13;
const calcularIvaCentimos = subtotalCentimos => Math.round(subtotalCentimos * TASA_IVA / 100);

module.exports = { TASA_IVA, calcularIvaCentimos };
