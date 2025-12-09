import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Report } from '../../reports/entities/report.entity';
import { Transaction } from '../../../transactions/entities/transaction.entity';
import { Employee } from '../../../employees/entities/employee.entity';
import { Chunk } from '../../rag/entities/chunk.entity';

@Entity({ name: 'users' })
export class User extends AbstractEntity<User> {
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ name: 'org_name' })
  orgName: string;

  @Column({ nullable: true })
  fullname: string;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Employee, (employee) => employee.user)
  employees: Employee[];

  @OneToMany(() => Chunk, (chunk) => chunk.user)
  chunks: Chunk[];
}
