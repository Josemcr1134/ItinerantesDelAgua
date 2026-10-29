import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardTaskDto } from 'data-access';
import { Icon } from '../../shared/icon/icon';
import { formatCount } from './charts/chart-scale';
import { TASK_LINKS } from './dashboard-labels';

/**
 * Pendientes de hoy (la API ya los filtra por permiso y trae el texto): cada
 * uno lleva a su pantalla. Sin pendientes, "todo al día".
 */
@Component({
  selector: 'adm-dashboard-tasks',
  imports: [RouterLink, Icon],
  templateUrl: './dashboard-tasks.html',
  styleUrl: './dashboard-tasks.scss',
})
export class DashboardTasks {
  readonly tasks = input.required<readonly DashboardTaskDto[]>();

  protected readonly taskLinks = TASK_LINKS;
  protected readonly count = formatCount;
}
