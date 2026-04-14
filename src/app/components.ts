import { Component, input, model } from "@angular/core";
import { FormValueControl, transformedValue, ValidationError } from "@angular/forms/signals";
import { DateTimeFormatter, LocalDate, LocalTime, YearMonth } from "@js-joda/core";
import { NgxMaskDirective } from "ngx-mask";

@Component({
  selector: 'input-date',
  template: `<input type="date" [value]="rawValue()" (input)="rawValue.set($event.target.value)" [style]="style()" [class]="class()" [min]="minDate()" [max]="maxDate()" />`,
  styles: `:host { display: contents; }`,
})
export class DateInput implements FormValueControl<LocalDate | null> {

  style = input<string>();
  class = input<string>();

  minDate = input<string | LocalDate>();
  maxDate = input<string | LocalDate>();

  readonly value = model.required<LocalDate | null>();
  protected readonly rawValue = transformedValue(this.value, {
    parse: (val: string) => {
      if (!val) return { value: null };
      return { value: LocalDate.parse(val) };
    },
    format: (val) => val?.toString() ?? '',
  });
}

@Component({
  selector: 'input-time',
  template: `<input type="time" [value]="rawValue()" (input)="rawValue.set($event.target.value)" [style]="style()" [class]="class()" />`,
  styles: `:host { display: contents; }`,
})
export class TimeInput implements FormValueControl<LocalTime | null> {

  style = input<string>();
  class = input<string>();

  readonly value = model.required<LocalTime | null>();
  protected readonly rawValue = transformedValue(this.value, {
    parse: (val: string) => {
      if (!val) return { value: null };
      return { value: LocalTime.parse(val) };
    },
    format: (val) => val?.toString() ?? '',
  });
}

@Component({
  selector: 'input-monthyear',
  imports: [NgxMaskDirective],
  template: `<input type="text" inputmode="numeric" [value]="rawValue()" (input)="rawValue.set($event.target.value)" mask="M0/0000" [leadZeroDateTime]="true" [clearIfNotMatch]="true" [style]="style()" [class]="class()" />`,
  styles: `:host { display: contents; }`,
})
export class MonthYearInput implements FormValueControl<YearMonth | null> {

  style = input<string>();
  class = input<string>();

  readonly value = model.required<YearMonth | null>();
  protected readonly rawValue = transformedValue(this.value, {
    parse: (val: string) => {
      try {
        if (!val) return { value: null };
        if (val.length !== 7) return { value: null };
        return { value: YearMonth.parse(`${val.substring(3)}-${val.substring(0, 2)}`) };
      } catch (err: unknown) {
        const kind = err instanceof Error ? err.name : 'ParseError';
        return { value: null, error: [{ kind, message: 'Formato inválido' }] as ValidationError[] };
      }
    },
    format: (val) => {
      if (!val) return '';
      return `${DateTimeFormatter.ofPattern('MM/yyyy').format(val)}`;
    }
  });
}