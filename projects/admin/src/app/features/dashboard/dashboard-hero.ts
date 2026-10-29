import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardPeopleDto } from 'data-access';
import { OFFER_TIMEZONE } from '../offers/shared/zoned-time';
import { formatCount } from './charts/chart-scale';
import { PERIODS } from './dashboard-labels';

const today = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: OFFER_TIMEZONE,
});

/**
 * Cabecera del inicio: fecha, saludo, el periodo del resumen (`?periodo=`) y
 * la cifra principal (participantes) cuando ya cargó.
 */
@Component({
  selector: 'adm-dashboard-hero',
  imports: [RouterLink],
  templateUrl: './dashboard-hero.html',
  styleUrl: './dashboard-hero.scss',
})
export class DashboardHero {
  readonly name = input.required<string>();
  readonly period = input.required<(typeof PERIODS)[number]>();
  readonly people = input<DashboardPeopleDto | null>(null);

  protected readonly today = today.format(new Date());
  protected readonly periods = PERIODS;
  protected readonly count = formatCount;
}
