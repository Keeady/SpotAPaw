import { AggregatedSighting, Sighting } from "../models/sighting";

export interface ISightingRepository {
  getSighting(id: string): Promise<AggregatedSighting>;
  getLinkedSightings(id: string): Promise<AggregatedSighting[]>;
  createSighting(data: Sighting): Promise<string>;
  updateSighting(id: string, data: AggregatedSighting): Promise<void>;
  updateSightingStatusByPet(id: string): Promise<void>;
  getSightings(filters: SightingFilters): Promise<SightingRepositoryResponse>;
  getSightingsByReporter(reporterId: string): Promise<AggregatedSighting[]>;
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
  getSightingsByReporter(reporterId: string): Promise<AggregatedSighting[]> {
    throw new Error("Method not implemented.");
  }
  updateSightingStatusByPet(_id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getLinkedSightings(_id: string): Promise<AggregatedSighting[]> {
    throw new Error("Method not implemented.");
  }
  getSighting(_id: string): Promise<AggregatedSighting> {
    throw new Error("Method not implemented.");
  }
  createSighting(_data: Sighting): Promise<string> {
    throw new Error("Method not implemented.");
  }
  updateSighting(_id: string, _data: Partial<AggregatedSighting>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getSightings(_filters: SightingFilters): Promise<SightingRepositoryResponse> {
    throw new Error("Method not implemented.");
  }
}
