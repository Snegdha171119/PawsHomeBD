import { 
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany
} from "typeorm";


import { ListerEntity } from "../Pet_lister/pet_lister.entity";
import { VetEntity } from "../Vet/vet.entity";


@Entity()
export class AdopterEntity {


    @PrimaryGeneratedColumn()
    id!: number;



    @Column({ unique:true })
    email!: string;



    @Column()
    password!: string;



    @Column()
    name!: string;



    @Column()
    phone!: string;



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

    // SET NULL so deleting a lister or vet just unassigns the adopter
    @ManyToOne(
        () => ListerEntity,
        lister => lister.adopters,
        { nullable: true, onDelete: "SET NULL" }
    )
    lister!: ListerEntity;

    @ManyToOne(
        () => VetEntity,
        vet => vet.adopters,
        { nullable: true, onDelete: "SET NULL" }
    )
    vet!: VetEntity;


}