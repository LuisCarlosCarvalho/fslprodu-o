export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }

  if (typeof err === "string") {
    return err;
  }

  return "Ocorreu um erro desconhecido";
}
