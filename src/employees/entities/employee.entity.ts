import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../../features/user/entities/user.entity';

@Entity({ name: 'employees' })
export class Employee extends AbstractEntity<Employee> {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  position: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salary: number;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  hireDate: Date;

  @ManyToOne(() => User, (user) => user.employees, { onDelete: 'CASCADE' })
  user: User;
}
