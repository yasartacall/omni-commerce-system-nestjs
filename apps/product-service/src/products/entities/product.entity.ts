import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@omni/database';
import { Category } from './category.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Index()
  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ name: 'stock_quantity', default: 0 })
  stockQuantity!: number;

  @Column({ name: 'category_id', nullable: true })
  categoryId!: string | null;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;
}
