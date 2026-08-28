import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { UsersService } from '../../../../@core/services/users.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
    SelectModule,
    ButtonModule
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent implements OnInit {
  private userService = inject(UsersService);
  private dialogConfig = inject(DynamicDialogConfig);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private dialogRef = inject(DynamicDialogRef);
  user = this.dialogConfig.data.user;

  editUserForm = this.fb.group({
    name: [''],
    lastName: [''],
    cedula: [''],
    phone: [''],
    email: [''],
    status: ['']
  });

  ngOnInit(): void {
    console.log('User data received in EditUserComponent:', this.user);

    this.editUserForm.patchValue(this.user);
  }

  onSubmit() {
    this.userService.updateUser(this.user.id, this.editUserForm.value).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente' });
        this.dialogRef?.close();
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el usuario' });
      }
    })
  }
}
