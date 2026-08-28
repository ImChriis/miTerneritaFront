import { Component, inject, OnInit, signal } from '@angular/core';
import { UsersService } from '../../@core/services/users.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { User } from '../../@core/models/user.model';
import { finalize, map, Observable, startWith, switchMap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmDeleteModalComponent } from '../../shared/components/confirm-delete-modal/confirm-delete-modal.component';
import { LoaderComponent } from '../../@core/components/loader/loader.component';
import { EditUserComponent } from '../users/components/edit-user/edit-user.component';


@Component({
  selector: 'app-clients',
  imports: [
    CommonModule,
    TableModule,
    CheckboxModule,
    InputTextModule,
    FormsModule,
    LoaderComponent
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent {
   private usersService = inject(UsersService);
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  ref!: DynamicDialogRef;
  users$!: Observable<any>;
  selectedUsers: User[] = [];
  isModalOpen = false;
  selectAll = false;
  isLoading = signal(false);


  ngOnInit(): void {
      this.users$ = this.usersService.refreshUsersObservable$.pipe(
      startWith(null),
      switchMap(() => {
        this.isLoading.set(true);
        
        return this.usersService.getUsers().pipe(
          map((users: any) => 
            users
              .filter((user: any) => user.idRole === 3)
              .map((user: any) => ({ ...user, role: 'Cliente' }))
          ),
          finalize(() => this.isLoading.set(false))
        );
      })
    );
  }

  openCreateModal(){
    
  }

  openEditModal(user: User){
    this.ref = this.dialogService.open(EditUserComponent, {
     header: 'Editar Usuario',
      width: '50vw',
      // height: '65vh',
      modal: true,
      closable: true,
      data: { user: user },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      styleClass: 'custom-dialog'
    })
    this.ref.onClose.subscribe(() => {
      this.isModalOpen = false;
    });
  }

   showConfirmModal(user?: any, selectedItems: User[] = this.selectedUsers) {
       const itemsToDelete = user ? [user] : selectedItems;
     
       this.ref = this.dialogService.open(ConfirmDeleteModalComponent, {
         header: 'Confirmar Eliminación',
         width: '40vw',
         modal: true,
         data: {
           message: itemsToDelete.length === 1
             ? `¿Estás seguro de que deseas eliminar ${itemsToDelete[0].name || 'este usuario'}?`
             : `¿Estás seguro de que deseas eliminar ${itemsToDelete.length} usuarios?`,
           selectedItems: itemsToDelete
         }
       });
     
       this.ref.onClose.subscribe((confirmed: boolean) => {
         if (confirmed) {
          console.log('Confirmed deletion for items:', itemsToDelete);
           itemsToDelete.forEach(item => this.executeDeleteUser(item.id));
         }
       });
     }

  private executeDeleteUser(id: number){
    console.log('Deleting user with ID:', id);

      this.usersService.deleteUser(id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado correctamente' });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al eliminar el usuario' });
        }
      })
    }

  toggleSelectAll(users: User[], checked: boolean) {
    this.selectAll = checked;
    this.selectedUsers = checked ? [...users] : [];
  }
}
