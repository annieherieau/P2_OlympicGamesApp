import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 0:
      return 'Unable to reach the server. Please check your connection.';
    case 404:
      return 'The requested data could not be found.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'The service is temporarily unavailable. Please try again later.';
    default:
      return 'Unable to load the data. Please try again.';
  }
}
