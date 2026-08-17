export interface IErrorResponse {
  message: string;
  statusCode: number;
  errors?: {
    [key: string]: string[];
  };
}

export interface ISuccessResponse {
  message: string;
  data: any;
}
