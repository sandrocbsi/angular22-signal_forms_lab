import { Component, inject, OnInit } from '@angular/core';
import { FormField, FormRoot, submit } from '@angular/forms/signals';
import { LocalDate, LocalTime, YearMonth } from '@js-joda/core';
import { NgxCurrencyDirective } from 'ngx-currency';
import { DateInputComponent, MonthYearInputComponent, ObjectSelectComponent, TimeInputComponent } from "./components";
import { AsNumberDirective, DigitsOnlyDirective, NumberMaxLengthDirective } from './directives';
import { Cidade, CorrecaoMonetaria, Objeto, OptionsEnum } from './extras';
import { AppFormHelper } from './form-helper';

@Component({
  selector: 'app-root',
  imports: [FormField, FormRoot, AsNumberDirective, NgxCurrencyDirective, NumberMaxLengthDirective, DigitsOnlyDirective, DateInputComponent, MonthYearInputComponent, TimeInputComponent, ObjectSelectComponent],
  providers: [AppFormHelper],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  protected readonly appFormHelper = inject(AppFormHelper);

  private objeto?: Objeto;

  agora = LocalDate.now();

  ngOnInit(): void {
    this.objeto = this.carregarObjeto();
    this.appFormHelper.toForm(this.objeto);
  }

  private carregarObjeto(): Objeto {
    return {
      text: '123',
      data: LocalDate.parse('2024-01-31'),
      mesAno: YearMonth.parse('2024-01'),
      horario: LocalTime.parse('14:30'),
      inputId: 2,
      correcaoMonetaria: { id: 1, nome: 'IPCA' } as CorrecaoMonetaria,
      cidade: { id: 3, nome: 'Santarém' } as Cidade,
      radionOption: OptionsEnum.Option2,
      cidadeSelecionada: { id: 1, nome: 'Belém' } as Cidade,
      valor: 123.45,
      quantidade: 10
    };
  }

  aoSelecionarCidade() {
    console.log('teste', this.appFormHelper.form.cidadeSelecionada().value())
  }

  async confirmar() {
    submit(this.appFormHelper.form, {
      action: async (frm) => console.log('Form:', frm().value(), '\nModel:', this.appFormHelper.toModel(), '\nJson: ', JSON.stringify(this.appFormHelper.toModel())),
      onInvalid: (frm) => console.log('Form is invalid.\ninputId:', frm.inputId().errors(), '\ndata:', frm.data().errors()),
    });
  }

  limpar() {
    this.appFormHelper.reset();
  }

  get OptionsEnum() {
    return OptionsEnum;
  }

}