
export interface CompanyData {
  companyName: string;
  phone: string;
  email: string;
  pointOfContact: string;
  address: string;
  website: string;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
