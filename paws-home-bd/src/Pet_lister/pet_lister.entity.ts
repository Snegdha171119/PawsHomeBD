import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany
} from 'typeorm';

import { AdminEntity } from '../Admin/admin.entity';
import { AdopterEntity } from '../Adopter/adopter.entity';
import { PetEntity } from './pet.entity';


@Entity()
export class ListerEntity {


    @PrimaryGeneratedColumn()
    id!: number;


    @Column({ unique: true })
    username!: string;


    @Column()
    fullName!: string;


    @Column()
    name!: string;


    // unique because listers log in with their email
    @Column({ unique: true })
    email!: string;


    @Column()
    password!: string;


    @Column()
    nid!: string;


    @Column({ nullable: true })
    nidimage!: string;

    // profile photo file name in the uploads folder
    @Column({ type: "varchar", nullable: true })
    profileImage?: string;


    @Column({ default: 'active' })
    status!: string;


    @CreateDateColumn()
    createdAt!: Date;


    @UpdateDateColumn()
    updatedAt!: Date;



    // Admin manages listers

    @ManyToOne(
        () => AdminEntity,
        admin => admin.listers,
        {
            nullable: true,
            // removing an admin should not delete the listers under them
            onDelete: "SET NULL"
        }
    )
    admin!: AdminEntity;

    @OneToMany(
        () => AdopterEntity,
        adopter => adopter.lister
    )
    adopters!: AdopterEntity[];

    // Pets posted by this lister
    @OneToMany(
        () => PetEntity,
        pet => pet.lister
    )
    pets!: PetEntity[];

}