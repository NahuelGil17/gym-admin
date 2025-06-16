import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';

import { AsyncPipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SnackBarService } from '@core/services/snackbar.service';
import { passwordValidator } from '@core/validators/password.validator';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { BtnDirective } from '@shared/directives/btn/btn.directive';
import { InputDirective } from '@shared/directives/btn/input.directive';
import { ConditionalTextPipe } from '@shared/pipes/conditional-text.pipe';
import {
  ForgotPassword,
  GetUserPreferences,
  Login,
} from '../../state/auth.actions';
import { AuthState } from '../../state/auth.state';
import { OrganizationThemeService } from '@core/services/organization-theme.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    BtnDirective,
    AsyncPipe,
    ConditionalTextPipe,
    InputDirective,
    RouterLink,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginFormComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;

  showPassword = false;
  private destroy = new Subject<void>();

  loading$: Observable<boolean>;
  organizationLogo$: Observable<string | null>;
  organizationColors$: Observable<{primary: string, secondary: string} | null>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
    private organizationThemeService: OrganizationThemeService
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordValidator()]],
    });

    this.loading$ = this.store.select(AuthState.authLoading);
    this.organizationLogo$ = this.organizationThemeService.getOrganizationLogo();
    this.organizationColors$ = this.organizationThemeService.getOrganizationColors();
  }

  ngOnInit(): void {
    this.organizationThemeService.applyOrganizationTheme();
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  /**
   * Authenticate the user and redirect to dashboard
   * @returns void
   */
  login(): void {
    if (this.loginForm.valid) {
      const { identifier, password } = this.loginForm.value;
      this.store.dispatch(new Login({ identifier, password }));
      this.actions
        .pipe(ofActionSuccessful(Login), takeUntil(this.destroy))
        .subscribe(() => {
          // Dispatch GetUserPreferences after successful login
          this.store.dispatch(new GetUserPreferences());

          // Wait for GetUserPreferences to complete before navigating
          this.actions
            .pipe(
              ofActionSuccessful(GetUserPreferences),
              takeUntil(this.destroy),
            )
            .subscribe(() => {
              this.router.navigate(['/']);
              this.snackbar.showSuccess('Éxito!', 'Bienvenido');
            });
        });
    }
  }

  loginWithGoogle(): void {}
  goToForgotPassword(): void {
    this.router.navigate(['auth/forgot-password']);
  }
  goToRegister(): void {
    this.router.navigate(['auth/register']);
  }
}
