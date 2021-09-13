export interface Listing<T> {
  data: T[];
  nextUrl?: string;
}

export interface DeleteResult<T> {
  data: T;
  message?: string;
}
