import { NgClass, AsyncPipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../navigation/navigation.component';
import { UserAreaComponent } from '../user-area/user-area.component';
import { OrganizationThemeService } from '@core/services/organization-theme.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [NavigationComponent, RouterOutlet, UserAreaComponent, NgClass, AsyncPipe],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  organizationLogo$: Observable<string | null>;
  
  private themeSubscription?: Subscription;

  constructor(private organizationThemeService: OrganizationThemeService) {
    this.organizationLogo$ = this.organizationThemeService.getOrganizationLogo();
  }

  ngOnInit(): void {
    // Apply organization theme when component initializes
    this.organizationThemeService.applyOrganizationTheme();
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
