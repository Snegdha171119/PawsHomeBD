import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';

import { ListerEntity } from '../Pet_lister/pet_lister.entity';
import { AdminProfileEntity } from "./admin_profile.entity";

@Entity()
export class AdminEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    fullName!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    gender!: string;

    @Column()
    phone!: string;

    @Column({ type: 'int', nullable: true })
    age?: number;

    @Column({ type: 'varchar', default: 'active' })
    status!: string;

    // profile photo file name in the uploads folder
    @Column({ type: "varchar", nullable: true })
    profileImage?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(
        () => ListerEntity,
        lister => lister.admin
    )
    listers!: ListerEntity[];

    @OneToOne(
        () => AdminProfileEntity,
        profile => profile.admin
    )
    profile!: AdminProfileEntity;
}