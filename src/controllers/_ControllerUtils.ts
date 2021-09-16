export interface Listing<T> {
  data: T[];
  nextUrl?: string;
}

export interface DeleteResult<T> {
  deleted: T;
  message?: string;
}
