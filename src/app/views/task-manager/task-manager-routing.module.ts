import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskManagerComponent } from './task-manager.component';

const routes: Routes = [
    {
        path: 'task-manager',
        data: {
            breadcrumb: 'task manager'
        },
        component: TaskManagerComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TaskManagerRoutingModule {}
