import {Entity, model, property, belongsToUniquely} from '@loopback/repository';
import {TodoList} from './todo-list.model';

@model()
export class Author extends Entity {
  @belongsToUniquely(() => TodoList)
  todoListId: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  constructor(data?: Partial<Author>) {
    super(data);
  }
}
