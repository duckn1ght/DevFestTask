import { AbstractEntity } from 'src/database/abstract.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Salary } from './salary.entity';
import { Tax } from './tax.entity';
import { User } from '../../user/entities/user.entity';

import { Transaction } from 'src/transactions/entities/transaction.entity';

@Entity({ name: 'reports' })
export class Report extends AbstractEntity<Report> {
  /** Общий доход. */
  @Column()
  totalIncome: number;

  /** Общий расход. */
  @Column()
  totalConsumption: number;

  @Column({ nullable: true })
  filename: string;

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: 'CASCADE' })
  user: User;

  /** Выплаты зарплат. */
  @OneToMany(() => Salary, (salary) => salary.report, { cascade: true })
  salaries: Salary[];

  /** Выплаты налогов */
  @OneToMany(() => Tax, (tax) => tax.report, { cascade: true })
  taxes: Tax[];

  @OneToMany(() => Transaction, (transaction) => transaction.report, { cascade: true })
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
