import { AggregatedSighting, Sighting } from "../models/sighting";

export interface ISightingRepository {
  getSighting(id: string): Promise<AggregatedSighting>;
  createSighting(data: Sighting): Promise<string>;
  updateSighting(id: string, data: AggregatedSighting): Promise<void>;
  getSightings(filters: SightingFilters): Promise<SightingRepositoryResponse>;
  getSightingsByReporter(reporterId: string): Promise<AggregatedSighting[]>;
  getSightingByLinkedSightingId(
    linkedSightingId: string,
  ): Promise<AggregatedSighting>;
}

export interface SightingRepositoryResponse {
  data: AggregatedSighting[];
  count: number | null;
}

export interface AggregatedSightingResponse {
  summary: AggregatedSighting;
  sightings: AggregatedSighting[];
}

export interface SightingFilters {
  latitude: number;
  longitude: number;
  radius: number;
  paginationStart: number;
  paginationEnd: number;
}

export class BaseSightingRepository implements ISightingRepository {
  getAggregatedSightingById(
    _aggregatedSightingId: string,
    _linkedSightingId: string,
  ): Promise<AggregatedSightingResponse> {
    throw new Error("Method not implemented.");
  }
 
  getSightingByLinkedSightingId(
    _linkedSightingId: string,
  ): Promise<AggregatedSighting> {
    throw new Error("Method not implemented.");
  }
  getSightingsByReporter(_reporterId: string): Promise<AggregatedSighting[]> {
    throw new Error("Method not implemented.");
  }

  getSighting(_id: string): Promise<AggregatedSighting> {
    throw new Error("Method not implemented.");
  }
  createSighting(_data: Sighting): Promise<string> {
    throw new Error("Method not implemented.");
  }
  updateSighting(
    _id: string,
    _data: Partial<AggregatedSighting>,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getSightings(_filters: SightingFilters): Promise<SightingRepositoryResponse> {
    throw new Error("Method not implemented.");
  }
}
