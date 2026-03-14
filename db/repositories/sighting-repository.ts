import { Pet } from "../models/pet";
import { AggregatedSighting, Sighting } from "../models/sighting";

export interface SightingRepository {
  getSighting(id: string): Promise<Pet>;
  createSighting(data: Sighting): Promise<string>;
  updateSighting(id: string, data: AggregatedSighting): Promise<void>;
  getSightings(filters: SightingFilters): Promise<SightingRepositoryResponse>;
}

export interface SightingRepositoryResponse {
  data: AggregatedSighting[];
  count: number | null;
}

export interface SightingFilters {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  paginationStart: number;
  paginationEnd: number;
}

export class BaseSightingRepository implements SightingRepository {
  getSighting(_id: string): Promise<Pet> {
    throw new Error("Method not implemented.");
  }
  createSighting(_data: Sighting): Promise<string> {
    throw new Error("Method not implemented.");
  }
  updateSighting(_id: string, _data: AggregatedSighting): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getSightings(filters: SightingFilters): Promise<SightingRepositoryResponse> {
    throw new Error("Method not implemented.");
  }
}
