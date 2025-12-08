import { AbstractEntity } from 'src/database/abstract.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Salary } from './salary.entity';
import { Tax } from './tax.entity';

@Entity({ name: 'reports' })
export class Report extends AbstractEntity<Report> {
  /** Общий доход. */
  @Column()
  totalIncome: number;

  /** Общий расход. */
  @Column()
  totalConsumption: number;

  /** Выплаты зарплат. */
  @OneToMany(() => Salary, (salary) => salary.report)
  salaries: Salary[];

  /** Выплаты налогов */
  @OneToMany(() => Tax, (tax) => tax.report)
  taxes: Tax[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
