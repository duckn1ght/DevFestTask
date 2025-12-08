import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Report } from './report.entity';

@Entity({ name: 'salaries' })
export class Salary extends AbstractEntity<Salary> {
  @ManyToOne(() => Report, (report) => report.salaries)
  report: Report;

  @Column()
  amount: number;

  @Column()
  employeePosition: string;

  @Column({ nullable: true })
  employeeName?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
