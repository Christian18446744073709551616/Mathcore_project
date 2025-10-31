export interface Topic {
  id: string;
  name: string;
}

export const allTopics: { [key: string]: Topic[] } = {
  // ID '1' corresponde a Geometria
  '1': [
    { id: 'geo-01', name: 'Quadrados' },
    { id: 'geo-02', name: 'Triângulos' },
    { id: 'geo-03', name: 'Retângulos' },
    { id: 'geo-04', name: 'Losangos' },
    { id: 'geo-05', name: 'Trapézios' },
    { id: 'geo-06', name: 'Paralelogramos' },
    { id: 'geo-07', name: 'Hexágonos' },
    { id: 'geo-08', name: 'Ângulos' },
    { id: 'geo-09', name: 'Polígonos' },
  ],
  // ID '2' corresponde a Matemática Financeira
  '2': [
    // Sub-grupo: Estatística
    { id: 'fin-01', name: 'Noções Básicas de Estatística' },
    { id: 'fin-02', name: 'Gráfico de Barras' },
    { id: 'fin-03', name: 'Gráfico de Setores' },
    { id: 'fin-04', name: 'Média, Moda e Mediana' },
    // Sub-grupo: Probabilidade
    { id: 'fin-05', name: 'Conceitos Básicos de Probabilidade' },
    { id: 'fin-06', name: 'Cálculos de Probabilidade' },
    { id: 'fin-07', name: 'Árvore de Probabilidade' },
  ],
  // ID '3' corresponde a Matemática Básica
  '3': [
    { id: 'bas-01', name: 'Adição e Subtração' },
    { id: 'bas-02', name: 'Multiplicação e Divisão' },
    { id: 'bas-03', name: 'Expressões Numéricas' },
    { id: 'bas-04', name: 'Frações' },
    { id: 'bas-05', name: 'Sistema de Numeração Decimal' },
    { id: 'bas-06', name: 'Sistema Métrico Decimal' },
    { id: 'bas-07', name: 'MMC e MDC' },
  ],
  // ID '4' corresponde a Álgebra
  '4': [
    { id: 'alg-01', name: 'Noções da função' },
    { id: 'alg-02', name: 'Introdução da Função Afim' },
  ],
};