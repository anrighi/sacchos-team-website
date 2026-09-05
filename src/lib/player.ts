export const ROLES = ["POR", "PAL", "CEN", "ALA", "PUN"] as const;
export type Role = (typeof ROLES)[number];

export const TEAMS = ["Saccho's Team", "Saccios Tim"] as const;
export type TeamName = (typeof TEAMS)[number];

export type Sex = "F" | "M";

export const STAT_KEYS = [
  "velocita",
  "salto",
  "intercetto",
  "scalpo",
  "finalizzazione",
  "gk",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export type PlayerStats = Record<StatKey, number>;

export type Player = {
  slug: string;
  firstName: string;
  nickname?: string;
  team: TeamName;
  role?: Role;
  sex: Sex;
  number: number;
  birthYear: number;
  photo?: string;
  overall: number;
  stats: PlayerStats;
};

export const STAT_LABELS: Record<StatKey, string> = {
  velocita: "VEL",
  salto: "SAL",
  intercetto: "INT",
  scalpo: "SCA",
  finalizzazione: "FIN",
  gk: "POR",
};

export const STAT_NAMES: Record<StatKey, string> = {
  velocita: "Velocità",
  salto: "Salto",
  intercetto: "Intercetto",
  scalpo: "Scalpo",
  finalizzazione: "Finalizzazione",
  gk: "Portiere",
};

export const ROLE_LABELS: Record<Role, string> = {
  POR: "Portiere",
  PAL: "Palleggiatore",
  CEN: "Centrale",
  ALA: "Ala",
  PUN: "Punta",
};
