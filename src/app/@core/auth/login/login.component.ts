import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoginForm } from '../../models/forms/form-login';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  /** Ruta a la que volver después de iniciar sesión (la pone el AuthGuard). */
  readonly returnUrl: string | null = this.route.snapshot.queryParamMap.get('returnUrl');
  showPass = signal(false);
  loading = signal(false);

  loginForm: FormGroup<LoginForm> = this.fb.group({
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
    password: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.minLength(6), Validators.maxLength(16)]}),
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

  onSubmit(){
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.messageService.add({severity:'success', summary: '¡Hola!', detail: 'Inicio de sesión exitoso'});

        if (res.role !== 'user') {
          this.router.navigateByUrl(this.returnUrl?.startsWith('/admin') ? this.returnUrl : '/admin/dashboard');
        } else {
          this.router.navigateByUrl(this.returnUrl && !this.returnUrl.startsWith('/admin') ? this.returnUrl : '/');
        }
      },

      error: (err) => {
        this.loading.set(false);
        this.messageService.add({severity:'error', summary: 'Error', detail: err.error?.mensaje || 'Correo o contraseña incorrectos'});
      },
    });
  }
}
