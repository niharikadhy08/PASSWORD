import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[&#@])[A-Za-z\d&#@]{8,20}$/;

const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (
    !newPassword ||
    !confirmPassword ||
    newPassword === confirmPassword
  ) {
    return null;
  }

  return { passwordMismatch: true };
};

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);

  private clockInterval?: ReturnType<typeof setInterval>;

  protected readonly showOldPassword = signal(false);
  protected readonly showNewPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  protected readonly currentDateTime = signal('');

  protected readonly form = this.formBuilder.nonNullable.group(
    {
      userName: [
        {
          value: 'AABCW1961A',
          disabled: true,
        },
      ],

      oldPassword: ['', [Validators.required]],

      newPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(PASSWORD_PATTERN),
        ],
      ],

      confirmPassword: ['', [Validators.required]],

      mobileNumber: [
        '8178016112',
        [
          Validators.required,
          Validators.pattern(/^[6-9]\d{9}$/),
        ],
      ],
    },
    {
      validators: passwordMatchValidator,
    },
  );

  protected readonly passwordRequirements = computed(() => {
    const value = this.form.controls.newPassword.value;

    return [
      {
        label: 'Minimum 8 characters',
        met: value.length >= 8,
      },
      {
        label: 'At least 1 lowercase (a-z)',
        met: /[a-z]/.test(value),
      },
      {
        label: 'Maximum 20 characters',
        met: value.length > 0 && value.length <= 20,
      },
      {
        label: 'At least 1 number (0-9)',
        met: /\d/.test(value),
      },
      {
        label: 'At least 1 uppercase (A-Z)',
        met: /[A-Z]/.test(value),
      },
      {
        label: 'At least 1 special (&, #, @)',
        met: /[&#@]/.test(value),
      },
    ];
  });

  protected get confirmPasswordInvalid(): boolean {
    const control = this.form.controls.confirmPassword;

    return (
      control.touched &&
      (
        control.invalid ||
        this.form.hasError('passwordMismatch')
      )
    );
  }

  ngOnInit(): void {
    this.updateDateTime();

    this.clockInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval !== undefined) {
      clearInterval(this.clockInterval);
    }
  }

  private updateDateTime(): void {
    const now = new Date();

    const day = now
      .toLocaleDateString('en-US', {
        weekday: 'short',
      })
      .toUpperCase();

    const month = now
      .toLocaleDateString('en-US', {
        month: 'short',
      })
      .toUpperCase();

    const date = String(now.getDate()).padStart(2, '0');

    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');

    const minutes = String(now.getMinutes()).padStart(2, '0');

    this.currentDateTime.set(
      `${day}, ${date} ${month}, ${year} ${hours}:${minutes}`,
    );
  }

  protected toggleOldPassword(): void {
    this.showOldPassword.update((value) => !value);
  }

  protected toggleNewPassword(): void {
    this.showNewPassword.update((value) => !value);
  }

  protected toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  protected clearForm(): void {
    this.form.reset({
      userName: {
        value: 'AABCW1961A',
        disabled: true,
      },
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      mobileNumber: '8178016112',
    });
  }

  protected saveChanges(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    console.log('Form data:', this.form.getRawValue());
  }
}