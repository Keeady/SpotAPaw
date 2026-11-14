export class NotificationSightingNotFoundError extends Error {
  constructor(sightingId: string) {
    super(`sighting ${sightingId} not found`);
    this.name = 'NotificationSightingNotFoundError';
  }
}

export class NotificationSightingNotRetryableError extends Error {
  constructor(sightingId: string) {
    super(`sighting ${sightingId} has a non retryable error`);
    this.name = 'NotificationSightingNotRetryableError';
  }
}

