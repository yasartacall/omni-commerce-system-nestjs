export interface ApiResponse<T = unknown> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

export function createResponse<T>(
  data: T,
  message = 'Success',
  statusCode = 200,
): ApiResponse<T> {
  return {
    data,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };
}
