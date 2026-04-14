import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { LocalDate, LocalTime } from '@js-joda/core';

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