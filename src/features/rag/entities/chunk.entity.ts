import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'chunks' })
export class Chunk extends AbstractEntity<Chunk> {
  @Column({ type: 'text' })
  content: string;

  // Embedding stored as float array (use pgvector in DB if available).
  @Column('float4', { array: true })
  embedding: number[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToOne(() => User, (user) => user.chunks, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
