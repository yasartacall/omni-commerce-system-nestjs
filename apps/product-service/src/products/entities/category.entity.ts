import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@omni/database';
import { Product } from './product.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ unique: true, length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
