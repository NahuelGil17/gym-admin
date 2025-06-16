import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState } from '@features/auth/state/auth.state';
import { map, Observable, of, switchMap } from 'rxjs';
import { Organization } from '@features/organizations/interfaces/organization.interface';
import { OrganizationsService } from '@features/organizations/services/organizations.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationThemeService {
  
  constructor(
    private store: Store,
    private organizationsService: OrganizationsService
  ) {}

  getCurrentOrganization(): Observable<Organization | null> {
    return this.store.select(AuthState.organization).pipe(
      switchMap(orgInfo => {
        if (!orgInfo?.id) {
          return of(null);
        }
        // Get full organization details from organizations service
        return this.organizationsService.getById(orgInfo.id).pipe(
          map(fullOrg => fullOrg || null)
        );
      })
    );
  }

  getOrganizationLogo(): Observable<string | null> {
    return this.getCurrentOrganization().pipe(
      map(org => org?.logoUrl || null)
    );
  }

  getOrganizationColors(): Observable<{primary: string, secondary: string} | null> {
    return this.getCurrentOrganization().pipe(
      map(org => {
        if (!org?.primaryColor && !org?.secondaryColor) {
          return null;
        }
        return {
          primary: org.primaryColor || '#3B82F6',
          secondary: org.secondaryColor || '#8B5CF6'
        };
      })
    );
  }

  applyOrganizationTheme(): void {
    this.getOrganizationColors().subscribe(colors => {
      if (colors) {
        this.setCSSCustomProperties(colors.primary, colors.secondary);
      }
    });

    // Apply organization favicon
    this.getOrganizationLogo().subscribe(logo => {
      if (logo) {
        this.setFavicon(logo);
      }
    });
  }

  private setCSSCustomProperties(primaryColor: string, secondaryColor: string): void {
    const root = document.documentElement;
    
    // Convert hex to RGB for Tailwind compatibility
    const primaryRgb = this.hexToRgb(primaryColor);
    const secondaryRgb = this.hexToRgb(secondaryColor);
    
    if (primaryRgb) {
      root.style.setProperty('--color-primary-50', this.lighten(primaryRgb, 0.95));
      root.style.setProperty('--color-primary-100', this.lighten(primaryRgb, 0.9));
      root.style.setProperty('--color-primary-200', this.lighten(primaryRgb, 0.8));
      root.style.setProperty('--color-primary-300', this.lighten(primaryRgb, 0.6));
      root.style.setProperty('--color-primary-400', this.lighten(primaryRgb, 0.4));
      root.style.setProperty('--color-primary-500', `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`);
      root.style.setProperty('--color-primary-600', this.darken(primaryRgb, 0.1));
      root.style.setProperty('--color-primary-700', this.darken(primaryRgb, 0.2));
      root.style.setProperty('--color-primary-800', this.darken(primaryRgb, 0.3));
      root.style.setProperty('--color-primary-900', this.darken(primaryRgb, 0.4));
    }
    
    if (secondaryRgb) {
      root.style.setProperty('--color-secondary-50', this.lighten(secondaryRgb, 0.95));
      root.style.setProperty('--color-secondary-100', this.lighten(secondaryRgb, 0.9));
      root.style.setProperty('--color-secondary-200', this.lighten(secondaryRgb, 0.8));
      root.style.setProperty('--color-secondary-300', this.lighten(secondaryRgb, 0.6));
      root.style.setProperty('--color-secondary-400', this.lighten(secondaryRgb, 0.4));
      root.style.setProperty('--color-secondary-500', `${secondaryRgb.r} ${secondaryRgb.g} ${secondaryRgb.b}`);
      root.style.setProperty('--color-secondary-600', this.darken(secondaryRgb, 0.1));
      root.style.setProperty('--color-secondary-700', this.darken(secondaryRgb, 0.2));
      root.style.setProperty('--color-secondary-800', this.darken(secondaryRgb, 0.3));
      root.style.setProperty('--color-secondary-900', this.darken(secondaryRgb, 0.4));
    }
  }

  private hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16)
    } : null;
  }

  private lighten(rgb: {r: number, g: number, b: number}, amount: number): string {
    const r = Math.round(rgb.r + (255 - rgb.r) * amount);
    const g = Math.round(rgb.g + (255 - rgb.g) * amount);
    const b = Math.round(rgb.b + (255 - rgb.b) * amount);
    return `${r} ${g} ${b}`;
  }

  private darken(rgb: {r: number, g: number, b: number}, amount: number): string {
    const r = Math.round(rgb.r * (1 - amount));
    const g = Math.round(rgb.g * (1 - amount));
    const b = Math.round(rgb.b * (1 - amount));
    return `${r} ${g} ${b}`;
  }

  resetToDefaultTheme(): void {
    const root = document.documentElement;
    
    // Reset to default blue theme
    const defaultColors = [
      '--color-primary-50',
      '--color-primary-100',
      '--color-primary-200',
      '--color-primary-300',
      '--color-primary-400',
      '--color-primary-500',
      '--color-primary-600',
      '--color-primary-700',
      '--color-primary-800',
      '--color-primary-900',
      '--color-secondary-50',
      '--color-secondary-100',
      '--color-secondary-200',
      '--color-secondary-300',
      '--color-secondary-400',
      '--color-secondary-500',
      '--color-secondary-600',
      '--color-secondary-700',
      '--color-secondary-800',
      '--color-secondary-900'
    ];
    
    for (const prop of defaultColors) {
      root.style.removeProperty(prop);
    }
  }

  private setFavicon(iconUrl: string): void {
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = iconUrl;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/x-icon';
      newFavicon.href = iconUrl;
      document.head.appendChild(newFavicon);
    }
  }

  getOrganizationLogos(): Observable<string[]> {
    return this.getCurrentOrganization().pipe(
      map(org => {
        if (!org?.logoUrl) {
          // Return default logos if no organization logo
          return [
            'assets/logos/logo-white.png',
            'assets/logos/logo-white.png'
          ];
        }
        // Return organization logo repeated twice for consistency
        return [org.logoUrl, org.logoUrl];
      })
    );
  }

  getDefaultLogo(): string {
    return 'assets/logos/logo-white.png';
  }

  getOrganizationName(): Observable<string | null> {
    return this.getCurrentOrganization().pipe(
      map(org => org?.name || null)
    );
  }
}