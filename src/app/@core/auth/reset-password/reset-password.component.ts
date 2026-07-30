import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private dialogConfig = inject(DynamicDialogConfig);
  private router = inject(Router);
  email = this.dialogConfig.data.email;
  ref!: DynamicDialogRef;

    private passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { passwordsMismatch: true };
    };

  resertPasswordForm = this.fb.group({
    code: [''],
    password: [''],
    confirmPassword: [''],
    newPassword: ['']
  },
  {
    validators: this.passwordsMatchValidator
  });

    isValidField(field: string): boolean {
    const control = this.resertPasswordForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }

  getErrorMessage(field: string): string {
    const control = this.resertPasswordForm.get(field);
    if (!control || !control.errors) {
      return ''; // Si el control no existe o no tiene errores, retorna una cadena vacía
    }
  
    if (control.errors['required']) {
      // return `El campo ${field} es obligatorio.`;
      return `El campo es obligatorio.`;
    }
    if (control.errors['minlength']) {
      return `El campo ${field} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }
    if (control.errors['maxlength']) {
      return `El campo ${field} no puede exceder los ${control.errors['maxlength'].requiredLength} caracteres.`;
    }
    if (control.errors['email']) {
      return 'El correo electrónico no tiene un formato válido.';
    }
    if (control.errors['pattern']) {
      if (field === 'cedula') {
        return 'Solo se permiten números en la cédula.';
      }
      return `El campo ${field} debe incluir al menos un carácter especial.`;
    }
  
    return 'Error desconocido en el campo.'; // Mensaje genérico para errores no manejados
  }

    showPassword() {
    const passwordField = document.querySelector('#password') as HTMLInputElement;
    const eyeIcon = document.querySelector('.btn-Pass i') as HTMLElement;
    if (passwordField) {
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.classList.remove('pi-eye-slash');
        eyeIcon.classList.add('pi-eye');
      } else {
        passwordField.type = 'password';
        eyeIcon.classList.remove('pi-eye');
        eyeIcon.classList.add('pi-eye-slash');
      }
    }
  }

     showPassword2() {
    const passwordField = document.querySelector('#password2') as HTMLInputElement;
    const eyeIcon = document.querySelector('.btn-Pass i') as HTMLElement;
    if (passwordField) {
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.classList.remove('pi-eye-slash');
        eyeIcon.classList.add('pi-eye');
      } else {
        passwordField.type = 'password';
        eyeIcon.classList.remove('pi-eye');
        eyeIcon.classList.add('pi-eye-slash');
      }
    }
  }

  onSubmit(){
    const formData = {...this.resertPasswordForm.value};
    delete formData.confirmPassword; // Eliminar el campo confirmPassword antes de enviarlo al backend
    formData.newPassword = formData.password; // Renombrar el campo password a newPassword
    delete formData.password; // Eliminar el campo password después de renombrarlo

    this.authService.resetPassword(formData).subscribe({
      next: (response) => {
        console.log('Contraseña restablecida exitosamente:', response);
        this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Contraseña restablecida exitosamente'});
        this.ref.close();
        this.router.navigateByUrl('/login'); // Redirigir al usuario a la página de inicio de sesión después de restablecer la contraseña
      },
      error: (error) => {
        console.error('Error al restablecer la contraseña:', error);
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Error al restablecer la contraseña'});
      }
    });
  }
}
