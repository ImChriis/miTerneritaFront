import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { RegisterForm } from '../../models/forms/form-register';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);

    registerForm: FormGroup<RegisterForm> = this.fb.group({
      name: new FormControl('', {nonNullable: true}),
      lastName: new FormControl('', {nonNullable: true}),
      email: new FormControl('', {nonNullable: true}),
      password: new FormControl('', {nonNullable: true}),
      phone: new FormControl('', {nonNullable: true}),
      idRol: new FormControl(1, {nonNullable: true}),
      status: new FormControl('active', {nonNullable: true})
    })

    onSubmit(){
      
    }
}
