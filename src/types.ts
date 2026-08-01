export type Scope = "user" | "project";
export type InstallStrategy = "link" | "copy";

export interface Skill {
  name: string;
  description: string;
  directory: string;
  skillFile: string;
  relativeDirectory: string;
  warnings: string[];
}

export interface HarnessContext {
  cwd: string;
  home: string;
}

export interface Harness {
  id: string;
  label: string;
  commands: string[];
  markers: (context: HarnessContext) => string[];
  root: (scope: Scope, context: HarnessContext) => string;
  sharedStandard: boolean;
}

export interface PreparedSource {
  root: string;
  label: string;
  cleanup: () => Promise<void>;
}

export interface InstallAction {
  kind: "canonical" | "link" | "copy";
  skill: Skill;
  source: string;
  destination: string;
  canonicalDestination: string;
  harnessIds: string[];
}

export interface InstallConflict {
  action: InstallAction;
  reason: string;
}

export interface InstallPlan {
  actions: InstallAction[];
  conflicts: InstallConflict[];
  unchanged: InstallAction[];
  canonicalRoot: string;
  selectedHarnesses: Harness[];
  strategy: InstallStrategy;
}

export interface InstallResult {
  installed: InstallAction[];
  backups: string[];
  copyFallbacks: string[];
}
