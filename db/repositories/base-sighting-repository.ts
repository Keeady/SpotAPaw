import { AggregatedSighting, Sighting } from "../models/sighting";

export interface ISightingRepository {
  getSighting(id: string): Promise<AggregatedSighting>;
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

export class BaseSightingRepository implements ISightingRepository {
  getSighting(_id: string): Promise<AggregatedSighting> {
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
