export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const Errors = {
  unauthorized: (message = "Yetkisiz") => new HttpError(401, "UNAUTHORIZED", message),
  forbidden: (message = "Yasak") => new HttpError(403, "FORBIDDEN", message),
  notFound: (message = "Bulunamadı") => new HttpError(404, "NOT_FOUND", message),
  badRequest: (message = "Geçersiz istek") => new HttpError(400, "BAD_REQUEST", message),
  conflict: (message = "Çakışma") => new HttpError(409, "CONFLICT", message),
};
