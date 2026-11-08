import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RegisterForm } from '../../models/forms/form-register';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink
],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private router = inject(Router);
  showPass = signal(false);
  showPass2 = signal(false);
  loading = signal(false);

    private passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { passwordsMismatch: true };
    };

    registerForm: FormGroup<RegisterForm> = this.fb.group({
      name: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
      lastName: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
      email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
      password: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
      phone: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/^(?!\s*$).+/)]}),
      // idRol: new FormControl(1, {nonNullable: true}),
      // status: new FormControl(1, {nonNullable: true}),
      tipo: new FormControl('V', {nonNullable: true , validators: [Validators.required]}),
      cedula: new FormControl('', {nonNullable: true, validators: [Validators.required,]}),
      confirmPassword: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
      noCedula: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.minLength(6), Validators.maxLength(10)]}),
    },
    { validators: this.passwordsMatchValidator }
  );

  ngOnInit(): void {
    this.registerForm.get('tipo')?.valueChanges.subscribe(() => this.updateIdentificacion());
    this.registerForm.get('noCedula')?.valueChanges.subscribe(() => this.updateIdentificacion());
  }

   getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (!control || !control.errors) {
      return ''; // Si el control no existe o no tiene errores, retorna una cadena vacía
    }

    if (control.errors['required']) {
      return `El campo es obligatorio.`;
    }
    if (control.errors['minlength']) {
      return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }
    if (control.errors['maxlength']) {
      return `No puede exceder los ${control.errors['maxlength'].requiredLength} caracteres.`;
    }
    if (control.errors['email']) {
      return 'El correo electrónico no tiene un formato válido.';
    }
    if (control.errors['pattern']) {
      if (field === 'cedula' || field === 'noCedula') {
        return 'Solo se permiten números en la cédula.';
      }
      return 'El formato no es válido.';
    }

    return 'Error desconocido en el campo.'; // Mensaje genérico para errores no manejados
  }

  isValidField(field: string): boolean {
    const control = this.registerForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }

  updateIdentificacion() {
    const tipo = this.registerForm.get('tipo')?.value;
    const numero = this.registerForm.get('noCedula')?.value;
    this.registerForm.patchValue({ cedula: `${tipo}-${numero}` });
  }

    onSubmit(){
      if (this.registerForm.invalid) {
        this.registerForm.markAllAsTouched();
        return;
      }

      const tipoIdentificacion = this.registerForm.get('tipo')?.value;
      const numeroIdentificacion = this.registerForm.get('noCedula')?.value;
      const cedula = `${tipoIdentificacion}-${numeroIdentificacion}`;

      this.registerForm.patchValue({ cedula });

      const formData = { ...this.registerForm.value };
      delete formData.tipo;
      delete formData.noCedula;
      delete formData.confirmPassword;

      this.loading.set(true);
      this.authService.register(formData).subscribe({
        next: () => {
          this.loading.set(false);
          this.messageService.add({severity:'success', summary: 'Registro exitoso', detail: 'Tu cuenta fue creada. Ya puedes iniciar sesión.'});
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          this.loading.set(false);
          this.messageService.add({severity:'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear la cuenta'});
        }
      })
    }
}
