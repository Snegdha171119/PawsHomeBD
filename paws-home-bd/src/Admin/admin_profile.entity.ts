import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";

import { AdminEntity } from "./admin.entity";

@Entity("admin_profiles")
export class AdminProfileEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  address!: string;

  @Column({ type: "varchar", length: 100 })
  designation!: string;

  @Column({ type: "text", nullable: true })
  bio?: string;

  @Column({ type: "varchar", length: 255 })
  qualification?: string;

  @OneToOne(
    () => AdminEntity,
    (admin) => admin.profile,
    { onDelete: "CASCADE" })
    
  @JoinColumn({ name: "adminId" })
  admin!: AdminEntity;
}