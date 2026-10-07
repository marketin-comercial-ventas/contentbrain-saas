export interface ApplicabilityEntry {
  status?: string;
  justification?: string;
  agreedBeforeExecution?: string;
  result?: string;
}

export interface QaVerdict {
  codeCommit: string;
  reviewer: string;
  independentOfImplementer?: boolean;
  decision?: string;
  fields?: Record<string, string>;
}

export interface DecisionInput {
  automated?: Record<string, string>;
  applicability?: Record<string, ApplicabilityEntry>;
  regression?: boolean;
  qaVerdict?: QaVerdict | null;
  supervisorDecision?: string;
  codeCommit: string;
}

export interface DecisionResult {
  fields: Record<string, string>;
  qaDecision: string;
  supervisorDecision: string;
  finalStatus: "APPROVED" | "REJECTED" | "BLOCKED";
  nextModuleAllowed: "YES" | "NO";
  reasons: string[];
}

export declare const AUTOMATED_FIELDS: string[];
export declare const APPLICABILITY_FIELDS: string[];
export declare const REVIEW_FIELDS: string[];
export declare function isJustifiedNa(entry: ApplicabilityEntry | null | undefined): boolean;
export declare function decideFinalStatus(input: DecisionInput): DecisionResult;
export declare function formatCanonicalReport(report: {
  module: string;
  scope: string;
  codeCommit: string;
  environment: string;
  evidencePaths: string;
  fields: Record<string, string>;
  applicabilityDecisions: string;
  skipped: string;
  findings: string;
  qaReviewer: string;
  qaDecision: string;
  supervisorDecision: string;
  gateExecution: string;
  finalStatus: string;
  nextModuleAllowed: string;
  reasons: string[];
  checks: { id: string; status: string; durationMs: number }[];
}): string;
