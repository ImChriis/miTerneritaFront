import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule
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

  forgotPasswordForm = this.fb.group({
    email: ['']
  })

  onSubmit(){
      this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
        next: (response) => {
          console.log("click")
          console.log(this.forgotPasswordForm.value)
          console.log('Correo de recuperación enviado:', response);
          // Aquí puedes mostrar un mensaje de éxito al usuario
          this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Correo de recuperación enviado'});
          this.openResetPassword();
        },
        error: (error) => {
          console.error('Error al enviar el correo de recuperación:', error);
          // Aquí puedes manejar el error y mostrar un mensaje al usuario
          this.messageService.add({severity:'error', summary: 'Error', detail: 'Error al enviar el correo de recuperación'});
        }
      });
  }

  openResetPassword(){
    this.ref = this.dialogService.open(ResetPasswordComponent, {
      header: 'Restablecer Contraseña',
      width: '50%',
      modal: true,
      closable: true,
      data: {  },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      styleClass: 'custom-dialog'
    });
  }
}
