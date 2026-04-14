import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { NgxCurrencyConfig, NgxCurrencyInputMode, provideEnvironmentNgxCurrency } from 'ngx-currency';
import { routes } from './app.routes';
import { provideEnvironmentNgxMask } from 'ngx-mask';

const CustomNgxCurrencyConfig: NgxCurrencyConfig = {
  align: 'right',
  allowNegative: false,
  allowZero: true,
  decimal: ",",
  precision: 2,
  prefix: "",
  suffix: "",
  thousands: ".",
  nullable: true,
  max: 9999999999999.99,
  inputMode: NgxCurrencyInputMode.Financial
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideEnvironmentNgxCurrency(CustomNgxCurrencyConfig),
    provideEnvironmentNgxMask(),

    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
