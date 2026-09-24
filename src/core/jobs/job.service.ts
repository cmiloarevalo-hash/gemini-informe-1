import crypto from "crypto";

export type JobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface AnalysisJob {
  jobId: string;
  studyId: string;
  userId: string;
  moduleId: string;
  status: JobStatus;
  stage: string;
  provider: string;
  model: string;
  promptVersion: string;
  schemaVersion: string;
  applicationVersion: string;
  attempt: number;
  startedAt: string;
  finishedAt?: string;
  documentIds: string[];
  error?: string;
}

export class JobService {
  private static jobs: Map<string, AnalysisJob> = new Map();

  public static createJob(params: {
    studyId: string;
    userId: string;
    moduleId: string;
    model: string;
    documentIds: string[];
  }): AnalysisJob {
    const jobId = `job-${crypto.randomUUID()}`;
    const job: AnalysisJob = {
      jobId,
      studyId: params.studyId,
      userId: params.userId,
      moduleId: params.moduleId,
      status: "PENDING",
      stage: "01_CLASSIFICATION",
      provider: "google-gemini",
      model: params.model,
      promptVersion: "1.0.0",
      schemaVersion: "1.0.0",
      applicationVersion: "1.0.0",
      attempt: 1,
      startedAt: new Date().toISOString(),
      documentIds: params.documentIds
    };

    this.jobs.set(jobId, job);
    return job;
  }

  public static updateStage(jobId: string, stage: string, status: JobStatus = "RUNNING"): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.stage = stage;
      job.status = status;
    }
  }

  public static completeJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "COMPLETED";
      job.finishedAt = new Date().toISOString();
    }
  }

  public static failJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "FAILED";
      job.error = error;
      job.finishedAt = new Date().toISOString();
    }
  }

  public static getJob(jobId: string): AnalysisJob | undefined {
    return this.jobs.get(jobId);
  }

  public static listJobsByStudy(studyId: string): AnalysisJob[] {
    return Array.from(this.jobs.values()).filter((j) => j.studyId === studyId);
  }
}
