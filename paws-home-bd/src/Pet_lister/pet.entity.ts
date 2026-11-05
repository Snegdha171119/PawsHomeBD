import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
} from "typeorm";

import { ListerEntity } from "./pet_lister.entity";

// A pet posted by a lister. Admin approves it before adopters can see it
@Entity("pets")
export class PetEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "varchar", length: 50 })
    species!: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    breed?: string;

    @Column({ type: "int", nullable: true })
    age?: number;

    @Column({ type: "varchar", length: 10 })
    gender!: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    // file name of the photo saved in the uploads folder
    @Column({ type: "varchar", nullable: true })
    image?: string;

    // pending -> approved / rejected -> adopted
    @Column({ type: "varchar", default: "pending" })
    status!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(
        () => ListerEntity,
        lister => lister.pets,
        // every pet must belong to a lister
        { nullable: false, onDelete: "CASCADE" }
    )
    lister!: ListerEntity;
}
