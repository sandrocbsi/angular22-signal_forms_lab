import { LocalDate, LocalTime, YearMonth } from "@js-joda/core";

export const CorrecaoMonetariaOptions = [
  { id: 1, nome: 'IPCA' } as CorrecaoMonetaria,
  { id: 2, nome: 'SELIC' } as CorrecaoMonetaria,
  { id: 3, nome: 'TR' } as CorrecaoMonetaria
];

export const CidadeOptions = [
  { id: 1, nome: 'Belém' } as Cidade,
  { id: 2, nome: 'Bragança' } as Cidade,
  { id: 3, nome: 'Santarém' } as Cidade
];

export enum OptionsEnum {
  Option1 = '1',
  Option2 = '2',
  Option3 = '3'
}

export interface CorrecaoMonetaria {
  id: number;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

export interface Objeto {
  text: string;
  data: LocalDate | null;
  mesAno: YearMonth | null;
  horario: LocalTime | null;
  inputId: number | null;
  correcaoMonetaria: CorrecaoMonetaria | null;
  cidade: Cidade | null;
  radionOption: OptionsEnum;
  cidadeSelecionada: Cidade | null;
  valor: number | null;
  quantidade: number;
}

export interface ConverterFn<T> {
  fromRaw: (raw: string) => T | null;
  fromObj: (obj: T) => string;
}