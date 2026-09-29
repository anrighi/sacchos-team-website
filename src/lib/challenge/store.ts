export type ChallengeStore = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

export function memoryStore(seed: Record<string, string> = {}): ChallengeStore {
  const data = new Map(Object.entries(seed));
  return {
    async get(key) {
      return data.get(key) ?? null;
    },
    async put(key, value) {
      data.set(key, value);
    },
  };
}
