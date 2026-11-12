import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('pet_claims')
export class Petclaim {
    @PrimaryColumn()
    id: number;

    @Column({name: "owner_id"})
    ownerId: string;

    @Column({name: "pet_id"})
    petId: string;

    @Column({name: "sighting_id"})
    sightingId: string;

    @Column()
    confirmed: boolean;
}
