import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Report } from '../../features/reports/entities/report.entity';
import { User } from '../../features/user/entities/user.entity';

@Entity({ name: 'transactions' })
export class Transaction extends AbstractEntity<Transaction> {
  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'float' })
  amount: number;

  @Column()
  type: 'income' | 'expense';

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Report, (report) => report.transactions, { onDelete: 'CASCADE' })
  report: Report;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  user: User;
}
