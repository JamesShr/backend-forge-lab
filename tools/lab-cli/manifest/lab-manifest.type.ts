export type LabLevel = "L1" | "L2" | "L3" | "L4";

export type LabDomain =
  | "database"
  | "distributed-systems"
  | "messaging"
  | "observability"
  | "devops"
  | "cloud"
  | "kubernetes"
  | "security"
  | "ai";

export type LabRuntimeType =
  | "docker-compose"
  | "kubernetes"
  | "helm"
  | "terraform"
  | "script";

export interface LabManifest {
  name: string;
  domain: LabDomain;
  level: LabLevel;
  description: string;
  status?: "scaffold" | "planned" | "active" | "complete";
  skills?: string[];
  roadmap?: {
    importance?: number;
    targetLevel?: LabLevel;
  };
  runtime?: {
    type: LabRuntimeType;
    file?: string;
  };
  commands?: Record<string, string>;
  experiments?: Record<string, { command: string; description?: string }>;
  cleanup?: {
    destructive?: boolean;
    command?: string;
  };
}

export interface LabDefinition {
  id: string;
  directory: string;
  manifestPath: string;
  manifest: LabManifest;
}
