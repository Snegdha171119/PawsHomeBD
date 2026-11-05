import { 
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    ManyToMany,
} from 'typeorm';


import { AdminEntity } from '../Admin/admin.entity';
import { AdopterEntity } from '../Adopter/adopter.entity';


@Entity()
export class VetEntity {


    @PrimaryGeneratedColumn()
    id!: number;



    @Column()
    name!: string;



    @Column({unique:true})
    email!: string;



    @Column()
    password!: string;



    @Column()
    phone!: string;



    @Column()
    fullName!: string;



    @Column({
        default:'active'
    })
    status!: string;

    // profile photo file name in the uploads folder
    @Column({ type: "varchar", nullable: true })
    profileImage?: string;



    @CreateDateColumn()
    createdAt!: Date;



    @UpdateDateColumn()
    updatedAt!: Date;



    // Admin manages vets

    // @ManyToMany(
    //     () => AdminEntity,
    //     admin => admin.vets
    // )
    // admin!: AdminEntity;



    // Vet manages adopters

    @OneToMany(
        () => AdopterEntity,
        adopter => adopter.vet
    )
    adopters!: AdopterEntity[];


}