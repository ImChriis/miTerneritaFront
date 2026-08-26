import { Component, inject, OnInit } from '@angular/core';
import { UsersService } from '../../@core/services/users.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { User } from '../../@core/models/user.model';
import { Observable, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    TableModule,
    CheckboxModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  users$!: Observable<any>;
  selectedUsers: User[] = [];
  isModalOpen = false;

  ngOnInit(): void {
     this.users$ = this.usersService.refreshUsersObservable$.pipe(
          startWith(null),
          switchMap(() => {
            return this.usersService.getUsers();
          })
        )
  }

  openCreateModal(){
    
  }

  openEditModal(user: User){

  }

  showConfirmModal(){

  }
}
