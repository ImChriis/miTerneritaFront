import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  ref!: DynamicDialogRef;
  loading = signal(false);

  forgotPasswordForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  })

  onSubmit(){
      if (this.forgotPasswordForm.invalid) {
        this.forgotPasswordForm.markAllAsTouched();
        return;
      }

      this.loading.set(true);
      this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
        next: () => {
          this.loading.set(false);
          this.messageService.add({severity:'success', summary: 'Revisa tu correo', detail: 'Te enviamos un código de recuperación'});
          this.openResetPassword();
        },
        error: (error) => {
          console.error('Error al enviar el correo de recuperación:', error);
          this.loading.set(false);
          this.messageService.add({severity:'error', summary: 'Error', detail: 'No pudimos enviar el correo de recuperación'});
        }
      });
  }

  openResetPassword(){
    this.ref = this.dialogService.open(ResetPasswordComponent, {
      header: 'Restablecer contraseña',
      width: '480px',
      modal: true,
      closable: true,
      data: { email: this.forgotPasswordForm.value.email },
      breakpoints: {
        '640px': '92vw',
      },
      styleClass: 'custom-dialog'
    });
  }
}
