import { Component, input, model } from "@angular/core";
import { FormValueControl, transformedValue, ValidationError } from "@angular/forms/signals";
import { DateTimeFormatter, LocalDate, LocalTime, YearMonth } from "@js-joda/core";
import { NgxMaskDirective } from "ngx-mask";
import { ConverterFn } from "./extras";

@Component({
  selector: 'input-date',
  template: `<input type="date" [value]="rawValue()" (input)="rawValue.set($event.target.value)" [style]="style()" [class]="class()" [min]="minDate()" [max]="maxDate()" [disabled]="disabled()" [readOnly]="readonly()" />`,
  styles: `:host { display: contents; }`,
})
export class DateInput implements FormValueControl<LocalDate | null> {

  style = input<string>();
  class = input<string>();

  minDate = input<string | LocalDate>();
  maxDate = input<string | LocalDate>();
  disabled = input(false);
  readonly = input(false);

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
  template: `<input type="time" [value]="rawValue()" (input)="rawValue.set($event.target.value)" [style]="style()" [class]="class()" [disabled]="disabled()" [readOnly]="readonly()" />`,
  styles: `:host { display: contents; }`,
})
export class TimeInput implements FormValueControl<LocalTime | null> {

  style = input<string>();
  class = input<string>();
  disabled = input(false);
  readonly = input(false);

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
  template: `<input type="text" inputmode="numeric" [value]="rawValue()" (input)="rawValue.set($event.target.value)" mask="M0/0000" [leadZeroDateTime]="true" [clearIfNotMatch]="true" [style]="style()" [class]="class()" [disabled]="disabled()" [readOnly]="readonly()" />`,
  styles: `:host { display: contents; }`,
})
export class MonthYearInput implements FormValueControl<YearMonth | null> {

  style = input<string>();
  class = input<string>();
  disabled = input(false);
  readonly = input(false);

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

@Component({
  selector: 'select-object',
  template: `<select [value]="rawValue()" (change)="rawValue.set($any($event.target).value)" [style]="style()" [class]="class()" [disabled]="disabled()">
    <ng-content></ng-content>
  </select>`,
  styles: `:host { display: contents; }`,
})
export class SelectObject<T> implements FormValueControl<T | null> {

  style = input<string>();
  class = input<string>();
  disabled = input(false);

  converter = input.required<ConverterFn<T>>();

  readonly value = model.required<T | null>();
  protected readonly rawValue = transformedValue(this.value, {
    parse: (val: string) => {
      return { value: val ? this.converter().fromRaw(val) : null };
    },
    format: (val: T | null) => {
      return (val ? this.converter().fromObj(val) : null) as string;
    },
  });
}