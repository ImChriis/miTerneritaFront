import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../@core/services/auth.service';
import { RegisterForm } from '../../@core/models/forms/form-register';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
 private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  id!: number;

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
  
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.id = userData.id; 
      if (userData.cedula && userData.cedula.includes('-')) {
        const [tipo, noCedula] = userData.cedula.split('-');
        
        userData.tipo = tipo;
        userData.noCedula = noCedula;
      }

      this.registerForm.patchValue(userData);
    }
  }

   getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
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
  
  isValidField(field: string): boolean {
    const control = this.registerForm.get(field);
    return control ? control.invalid && (control.touched || control.dirty) : false;
  }

  updateIdentificacion() {
    const tipo = this.registerForm.get('tipo')?.value;
    const numero = this.registerForm.get('noCedula')?.value;
    this.registerForm.patchValue({ cedula: `${tipo}-${numero}` });
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
      const tipoIdentificacion = this.registerForm.get('tipo')?.value;
      const numeroIdentificacion = this.registerForm.get('noCedula')?.value;
      const cedula = `${tipoIdentificacion}-${numeroIdentificacion}`;

      this.registerForm.patchValue({ cedula });

      const formData = { ...this.registerForm.value };
      delete formData.tipo;
      delete formData.noCedula;
      delete formData.confirmPassword;

      console.log(formData);
      this.authService.editProfile(this.id, formData).subscribe({
        next: (response) => {
          console.log('Perfil actualizado exitosamente:', formData);
          this.messageService.add({severity:'success', summary: 'Registro Exitoso', detail: 'Usuario registrado correctamente'});
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          this.messageService.add({severity:'error', summary: 'Error', detail: err.error.message});
        }
      })
    }

    logOut(){
      this.authService.logout();
      this.router.navigateByUrl('/login');
    }
}
