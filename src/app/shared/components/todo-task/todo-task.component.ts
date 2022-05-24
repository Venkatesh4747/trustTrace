import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AnalyticsService } from '../../../core/analytics/analytics.service';
import { SuppliersService } from '../../../views/suppliers/suppliers.service';
import { CustomToastrService } from '../../commonServices/custom-toastr.service';
import { TODO_STATUS } from './todo-task.const';

@Component({
    selector: 'app-todo-task',
    templateUrl: './todo-task.component.html',
    styleUrls: ['./todo-task.component.scss']
})
export class TodoTaskComponent implements OnInit {
    @Input() analyticsPageOrigin;
    @ViewChild('todoItem', { static: false }) todoItem;
    @Input() todoTask;
    @Input() supplierId;
    @Input() canEditSupplierProfile = true;

    taskPayLoad = {
        supplierId: '',
        item: [
            {
                title: ''
            }
        ]
    };
    newTask = {
        title: ''
    };

    todoEditable = [];
    todoStatus = TODO_STATUS;
    constructor(
        private analyticsService: AnalyticsService,
        private supplierService: SuppliersService,
        private toastr: CustomToastrService
    ) {}

    ngOnInit() {}

    processTodoResponse() {
        this.supplierService.getSupplierProfile(this.supplierId).subscribe(response => {
            this.todoTask = response.data.supplier.todoTasks;
        });
    }
    createTodo() {
        if (this.newTask.title !== '') {
            if (!this.todoTask) {
                const payload = {
                    supplierId: this.supplierId,
                    item: [
                        {
                            title: this.newTask.title,
                            itemStatus: this.todoStatus.NOT_COMPLETED
                        }
                    ]
                };
                this.supplierService.createTask(payload).subscribe(resp => {
                    this.processTodoResponse();
                    this.toastr.success('A new task created successfully', 'Success');
                    this.analyticsService.trackEvent('Todo Task', {
                        Origin: this.analyticsPageOrigin,
                        'Supplier Id': this.supplierId,
                        'Action Performed': 'Add'
                    });
                });
            } else {
                const payload = {
                    id: this.todoTask.id,
                    supplierId: this.supplierId,
                    item: [
                        {
                            title: this.newTask.title,
                            itemStatus: this.todoStatus.NOT_COMPLETED
                        }
                    ]
                };
                this.supplierService.addTaskItem(payload).subscribe(resp => {
                    this.processTodoResponse();
                    this.toastr.success('A new Todo added successfully', 'Success');
                    this.analyticsService.trackEvent('Todo Task', {
                        Origin: this.analyticsPageOrigin,
                        'Supplier Id': this.supplierId,
                        'Action Performed': 'Add'
                    });
                });
            }
        } else {
            this.toastr.success('please add the todo', '');
        }

        this.resetNewTask();
    }

    resetNewTask() {
        this.newTask = {
            title: ''
        };
    }

    removeTodo(itemId, index) {
        this.supplierService.removeTodo(itemId).subscribe(() => {
            this.todoTask.item.splice(index, 1);
            this.toastr.success('Todo deleted successfully', 'Success');
            this.analyticsService.trackEvent('Todo Task', {
                Origin: this.analyticsPageOrigin,
                'Supplier Id': this.supplierId,
                'Action Performed': 'Delete'
            });
        });
    }

    editTodo(index) {
        this.todoEditable[index] = true;
    }

    updateTodo(item1, index) {
        const payLoad = {
            id: this.todoTask.id,
            item: [
                {
                    itemId: item1.itemId,
                    title: item1.title,
                    itemStatus: item1.itemStatus
                }
            ]
        };
        this.supplierService.editTodo(payLoad).subscribe(resp => {
            this.processTodoResponse();
            this.toastr.success('Todo edited successfully', 'Success');
            this.analyticsService.trackEvent('Todo Task', {
                Origin: this.analyticsPageOrigin,
                'Supplier Id': this.supplierId,
                'Action Performed': 'Update'
            });

            this.todoEditable[index] = false;
        });
    }

    saveTodoStatus(event, task) {
        let payload = {};
        if (event.target.checked) {
            payload = {
                id: this.todoTask.id,
                item: [
                    {
                        itemId: task.itemId,
                        title: task.title,
                        itemStatus: this.todoStatus.COMPLETED
                    }
                ]
            };
        } else {
            payload = {
                id: this.todoTask.id,
                item: [
                    {
                        itemId: task.itemId,
                        title: task.title,
                        itemStatus: this.todoStatus.NOT_COMPLETED
                    }
                ]
            };
        }
        this.supplierService.editTodo(payload).subscribe(resp => {
            this.processTodoResponse();
            this.toastr.success('Todo status updated', 'Success');
        });
    }
}
