import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-confirm-delete-modal',
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './confirm-delete-modal.component.html',
  styleUrl: './confirm-delete-modal.component.scss'
})
export class ConfirmDeleteModalComponent implements OnInit {
  private dialogConfig = inject(DynamicDialogConfig);
  private dialogRef = inject(DynamicDialogRef);
  message!: string;
  selectedItems: any[] = [];

  ngOnInit(): void {
    this.message = this.dialogConfig.data.message || '¿Estás seguro de que deseas eliminar esto?';;
     this.selectedItems = this.dialogConfig.data.selectedItems || [];
  }

  confirm(){
    this.dialogRef.close(true);
  }

  cancel(){
    this.dialogRef.close(false);
  }
}
