import { AbstractEntity } from 'src/database/abstract.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { Report } from './report.entity';

@Entity({ name: 'taxes' })
export class Tax extends AbstractEntity<Tax> {
  @ManyToOne(() => Report, (report) => report.taxes)
  report: Report;

  @Column()
  amount: number;

  @Column()
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
