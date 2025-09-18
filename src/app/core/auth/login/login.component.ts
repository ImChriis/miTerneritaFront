import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginForm } from '../../models/forms/form-login';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule

  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  loginForm: FormGroup<LoginForm> = this.fb.group({
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
    password: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
  })

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (!control || !control.errors) {
      return ''; // Si el control no existe o no tiene errores, retorna una cadena vacía
    }
  
    if (control.errors['required']) {
      return 'El campo es requerido';
    }
    if (control.errors['minlength'] || control.errors['maxlength']) {
      return 'Debe colocar un mínimo de 6 caracteres y un máximo de 16';
    }
    if (control.errors['email']) {
      return 'El correo es inválido';
    }
  
    return ''; // Retorna una cadena vacía si no hay errores específicos
  }

  isValidField(field: string): boolean {
    const control = this.loginForm.get(field);
    return control ? control.touched && control.invalid : false;
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

  onSubmit(){
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {

        const userRole = res.usuario.idRol;

        if(userRole === 1){
          this.router.navigateByUrl('/admin/dashboard');
        } else if(userRole === 2){
          this.router.navigateByUrl('/home');
        }

        this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Inicio de sesión exitoso'});
      },

      error: (err) => {
        this.messageService.add({severity:'error', summary: 'Error', detail: err.error.mensaje || 'Error en el inicio de sesión'});
      },
    });
  }

  register(){
    this.router.navigateByUrl('/register');
  }
}
