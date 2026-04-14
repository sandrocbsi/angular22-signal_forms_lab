import { computed, Injectable, signal } from "@angular/core";
import { form, max, min, required } from "@angular/forms/signals";
import { LocalDate, LocalTime, YearMonth } from "@js-joda/core";
import { Cidade, CidadeOptions, ConverterFn, CorrecaoMonetariaOptions, Objeto, OptionsEnum } from "./extras";

@Injectable()
export class AppFormHelper {
  
  private readonly default: AppForm = {
    text: '',
    data: null,
    mesAno: null,
    horario: null,
    inputId: null,
    correcaoMonetariaId: '',
    cidadeId: null,
    radionOption: OptionsEnum.Option1,
    cidadeSelecionada: null,
    valor: null,
    quantidade: 0
  };

  model = signal(this.default);

  form = form(
    this.model,
    (path) => {
      required(path.horario, { message: 'Horário is required' });
      min(path.quantidade, 0, { message: 'Quantidade must be greater than zero' });
      max(path.quantidade, 999, { message: 'Quantidade must be less than or equal to 999' });
    },
    /*{
      submission: {
        action: (frm) => this.onSubmit(frm),
        onInvalid: (frm) => console.log('Form is invalid:', frm.inputId().errors()),
      },
    }*/
  );

  listaCidade = CidadeOptions;
  listaCorrecaoMonetaria = CorrecaoMonetariaOptions;

  correcaoMonetaria = computed(() => {
    return CorrecaoMonetariaOptions.find(cm => cm.id === Number(this.form.correcaoMonetariaId().value())) ?? null;
  });

  cidade = computed(() => {
    return CidadeOptions.find(c => c.id === this.form.cidadeId().value()) ?? null;
  });

  cidadeConverter: ConverterFn<Cidade> = {
    fromObj: (obj) => String(obj.id),
    fromRaw: (raw) => CidadeOptions.find(c => c.id === Number(raw)) ?? null
  };

  toForm(objeto: Objeto) {
    this.model.set({
      text: objeto.text,
      data: objeto.data,
      mesAno: objeto.mesAno,
      horario: objeto.horario,
      inputId: objeto.inputId,
      correcaoMonetariaId: objeto.correcaoMonetaria?.id ? String(objeto.correcaoMonetaria.id) : '',
      cidadeId: objeto.cidade?.id ?? null,
      radionOption: objeto.radionOption,
      cidadeSelecionada: objeto.cidadeSelecionada,
      valor: objeto.valor,
      quantidade: objeto.quantidade
    });
  }

  toModel(): Objeto {
    const formValue = this.form().value();
    return {
      text: formValue.text,
      data: formValue.data,
      mesAno: formValue.mesAno,
      horario: formValue.horario,
      inputId: formValue.inputId,
      correcaoMonetaria: this.correcaoMonetaria(),
      cidade: this.cidade(),
      cidadeSelecionada: formValue.cidadeSelecionada,
      radionOption: formValue.radionOption,
      valor: formValue.valor,
      quantidade: formValue.quantidade
    };
  }

  reset() {
    this.form().reset(this.default);
  }

}

interface AppForm {
  text: string;
  data: LocalDate | null;
  mesAno: YearMonth | null;
  horario: LocalTime | null;
  inputId: number | null;
  correcaoMonetariaId: string;
  cidadeId: number | null;
  radionOption: OptionsEnum;
  cidadeSelecionada: Cidade | null;
  valor: number | null;
  quantidade: number;
}