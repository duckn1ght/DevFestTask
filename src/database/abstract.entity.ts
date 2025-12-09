import { PrimaryGeneratedColumn } from 'typeorm';

/** Абстрактный класс добавляющий id и конструктор для дочернего класса. */
export class AbstractEntity<T> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  constructor(item: Partial<T>) {
    Object.assign(this, item);
  }
}
