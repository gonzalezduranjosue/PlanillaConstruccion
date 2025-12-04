export interface Material {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface LaborItem {
  id: string;
  description: string;
  cost: number;
}

export interface WorkerInfo {
  id: string;
  name: string;
  role: 'Principal' | 'Ayudante' | 'Otro';
}

export interface DietInfo {
  workersCount: number;
  workDays: number;
  costPerDiet: number;
}

export interface ProjectInfo {
  projectName: string;
  beneficiary: string;
}

export interface Signatures {
  approverName: string;
  approvalDate: string;
  observations: string;
}

export interface BudgetState {
  projectInfo: ProjectInfo;
  workers: WorkerInfo[];
  materials: Material[];
  labor: LaborItem[];
  diet: DietInfo;
  signatures: Signatures;
}