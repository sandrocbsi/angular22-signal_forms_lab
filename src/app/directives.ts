import { Directive, effect, ElementRef, inject, input, model } from '@angular/core';
import { FormField, FormValueControl, transformedValue, ValidationError } from '@angular/forms/signals';
import { DateTimeFormatter, LocalDate, LocalTime, YearMonth } from '@js-joda/core';
import { ConverterFn } from './extras';

/**
 * Diretiva para dar suporte ao tipo LocalDate do js-joda em elementos input[type="date"]
 * @author Sandro Monteiro
 */
@Directive({
  selector: 'input[type="date"][appDateInput]',
  host: {
    '[value]': 'rawValue()',
    '(input)': 'rawValue.set($any($event.target).value)',
    '[readonly]': 'readonly()',
    '[disabled]': 'disabled()',
    '[min]': 'minDate()',
    '[max]': 'maxDate()',
  },
})
export class DateInputDirective implements FormValueControl<LocalDate | null> {
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


/**
 * Diretiva para dar suporte ao tipo LocalTime do js-joda em elementos input[type="time"]
 * @author Sandro Monteiro
 */
@Directive({
  selector: 'input[type="time"][appTimeInput]',
  host: {
    '[value]': 'rawValue()',
    '(input)': 'rawValue.set($any($event.target).value)',
    '[readonly]': 'readonly()',
    '[disabled]': 'disabled()',
  },
})
export class TimeInputDirective implements FormValueControl<LocalTime | null> {
  disabled = input(false);
  readonly = input(false);

  readonly value = model.required<LocalTime | null>();
  protected readonly rawValue = transformedValue(this.value, {
    parse: (val: string) => {
      if (!val) return { value: null };
      return { value: LocalTime.parse(val) };
    },
    format: (val) => (val ? DateTimeFormatter.ofPattern('HH:mm').format(val) : ''),
  });
}


/**
 * Diretiva para dar suporte ao tipo YearMonth do js-joda em elementos input[type="text"]
 * @author Sandro Monteiro
 */
@Directive({
  selector: 'input[type="text"][appMonthYearInput]',
  host: {
    '[value]': 'rawValue()',
    '(input)': 'rawValue.set(maskMonthYear($any($event.target).value))',
    '[readonly]': 'readonly()',
    '[disabled]': 'disabled()',
  },
})
export class MonthYearInputDirective implements FormValueControl<YearMonth | null> {
  private readonly element = inject(ElementRef<HTMLInputElement>);

  disabled = input(false);
  readonly = input(false);

  private readonly maskMonthSize = 2;
  private readonly maskYearSize = 4;
  private readonly maskSize = this.maskMonthSize + 1 + this.maskYearSize;

  constructor() {
    const input = this.element.nativeElement as HTMLInputElement;

    input.addEventListener('beforeinput', (event: InputEvent) => {
      if (event.data && /\D/.test(event.data)) {
        event.preventDefault();
      }
      const target = event.target as HTMLInputElement;
      const value = target.value;
      const hasSelection = target.selectionEnd !== null && target.selectionStart !== null ? target.selectionEnd - target.selectionStart : 0;
      if (value.length >= this.maskSize && event.data && !hasSelection) {
        event.preventDefault();
      }
    });

    input.addEventListener('blur', (event: Event) => {
      const value = (event.target as any).value;
      if (value.length !== this.maskSize) {
        this.rawValue.set('');
      }
    });
  }

  maskMonthYear(value: string) {
    let digits = value.replaceAll(/\D/g, '').slice(0, this.maskMonthSize + this.maskYearSize);

    if (digits.length > 0) {
      // Se o primeiro dígito for > 1, não pode ser um mês válido com 2 dígitos → prepende '0'
      if (Number.parseInt(digits[0]) > 1) {
        digits = '0' + digits;
      }

      // Com os dois dígitos do mês disponíveis, valida o range 01–12
      if (digits.length >= this.maskMonthSize) {
        const month = Number.parseInt(digits.slice(0, this.maskMonthSize));
        if (month < 1) {
          digits = '01' + digits.slice(this.maskMonthSize);
        } else if (month > 12) {
          digits = '12' + digits.slice(this.maskMonthSize);
        }
      }

      digits = digits.slice(0, this.maskMonthSize + this.maskYearSize);
    }

    if (digits.length > this.maskMonthSize) {
      return digits.slice(0, this.maskMonthSize) + '/' + digits.slice(this.maskMonthSize);
    }

    return digits;
  }

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
    },
  });
}


/**
 * Diretiva para dar suporte a conversão direta de objetos em elementos select
 * @author Sandro Monteiro
 */
@Directive({
  selector: 'select[appObjectSelect]',
  host: {
    '[value]': 'rawValue()',
    '(change)': 'rawValue.set($any($event.target).value)',
    '[disabled]': 'disabled()',
  },
})
export class ObjectSelectDirective<T> implements FormValueControl<T | null> {
  disabled = input(false);

  converter = input.required<ConverterFn<T>>();

  readonly value = model.required<T | null>();
  protected readonly rawValue = transformedValue(this.value, {
    parse: (val: string) => {
      return { value: val ? this.converter().fromRaw(val) : null };
    },
    format: (val: T | null) => {
      return (val ? this.converter().fromObj(val) : null) as unknown as string;
    },
  });
}


@Directive({
  selector: '[appAsNumber]',
})
export class AsNumberDirective {

  private readonly formField = inject(FormField<number | null>);

  constructor() {
    effect(() => {
      this.formField.state().value.update((value: any) => {
        const asNumber = Number(String(value));
        return Number.isNaN(asNumber) ? null : asNumber;
      });
      this.formField.state().value(); // Signal read required to track changes and trigger the effect when form field value changes.
    });
  }

}

@Directive({
  selector: '[appAsLocalDate]',
})
export class AsLocalDateDirective {

  private readonly formField = inject(FormField<LocalDate | null>);

  constructor() {
    effect(() => {
      this.formField.state().value.update((value: any) => {
        if (!value) return null;
        if (typeof value === 'number') value = new Date(value);
        if (value instanceof Date) value = value.toISOString().split("T")[0];
        if (typeof value === 'string') return LocalDate.parse(value.length > 10 ? value.substring(value.length - 10) : value);
        return value;
      });
      this.formField.state().value(); // Signal read required to track changes and trigger the effect when form field value changes.
    });
  }

}

@Directive({
  selector: '[appAsLocalTime]',
})
export class AsLocalTimeDirective {

  private readonly formField = inject(FormField<LocalTime | null>);

  constructor() {
    effect(() => {
      this.formField.state().value.update((value: any) => {
        try {
          if (!value) return null;
          if (typeof value === 'string') return LocalTime.parse(value);
        } catch(err: unknown) {
          console.error(err);
          return null;
        }
        return value;
      });
      this.formField.state().value(); // Signal read required to track changes and trigger the effect when form field value changes.
    });
  }

}


@Directive({
  selector: 'input[type="number"] [appNumberMaxLength]',
})
export class NumberMaxLengthDirective {

  private readonly element = inject(ElementRef<HTMLInputElement>);
  appNumberMaxLength = input.required<number>();

  constructor() {
    const input = this.element.nativeElement as HTMLInputElement;
    input.addEventListener('input', (event: InputEvent) => {
      const maxLength = this.appNumberMaxLength();
      input.value = input.value.length > maxLength ? input.value.substring(0, maxLength) : input.value;
    });
  }

}

@Directive({
  selector: 'input[appDigitsOnly]',
})
export class DigitsOnlyDirective {

  private readonly element = inject(ElementRef<HTMLInputElement>);

  constructor() {
    const input = this.element.nativeElement as HTMLInputElement;

    input.addEventListener('beforeinput', (event: InputEvent) => {
      if (event.data && /\D/.test(event.data)) {
        event.preventDefault();
      }
    });
  }
}