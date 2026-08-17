export type IApiSuccess<T = undefined> = {
  status: number;
  message?: string;
  data?: T;
};

export type IApiError = {
  status: number;
  message: string;
  errors?: Record<string, string[]> | string[];
};
