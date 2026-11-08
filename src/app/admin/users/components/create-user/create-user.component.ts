import { Component, inject } from '@angular/core';
import { UsersService } from '../../../../@core/services/users.service';
import { MessageService } from 'primeng/api';
import { RegisterForm } from '../../../../@core/models/forms/form-register';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-create-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss'
})
export class CreateUserComponent {
  private userService = inject(UsersService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private ref = inject(DynamicDialogRef, { optional: true });

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
      }
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
      // return `El campo ${field} es obligatorio.`;
      return `El campo es obligatorio.`;
    }
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
    }
    if (control.errors['email']) {
      return 'El correo electrónico no tiene un formato válido.';
    }
    if (control.errors['pattern']) {
      if (field === 'noCedula') {
        return 'Solo números, sin puntos ni letras.';
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

  passwordsDistintas(): boolean {
    const c = this.registerForm.controls.confirmPassword;
    return (c.touched || c.dirty) && c.value !== this.registerForm.controls.password.value;
  }

  cerrar() {
    this.ref?.close();
  }

      onSubmit(){
      if (this.registerForm.invalid || this.passwordsDistintas()) {
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

      this.userService.createUser(formData).subscribe({
        next: (response) => {
          this.messageService.add({severity:'success', summary: 'Registro Exitoso', detail: 'Usuario registrado correctamente'});
          this.ref?.close();
        },
        error: (err) => {
          this.messageService.add({severity:'error', summary: 'Error', detail: err.error.message});
        }
      })
    }
}
