export const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatBRLWhole = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(value);
};

export const formatPercent = (value: number, total: number) => {
  if (total === 0) return '0%';
  return Math.round((value / total) * 100) + '%';
};
