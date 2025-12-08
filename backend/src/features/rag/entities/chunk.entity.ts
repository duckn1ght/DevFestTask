import { AbstractEntity } from 'src/database/abstract.entity';
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'chunks' })
export class Chunk extends AbstractEntity<Chunk> {
  @Column({ type: 'text' })
  content: string;

  // Embedding stored as float array (use pgvector in DB if available).
  @Column('float4', { array: true })
  embedding: number[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
