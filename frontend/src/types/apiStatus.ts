export const ApiStatus = {
  IDLE: "idle",
  UPLOADING: "uploading",
  UPLOADED: "uploaded",
  SEARCHING: "searching",
} as const;

export type ApiStatusType = (typeof ApiStatus)[keyof typeof ApiStatus];
