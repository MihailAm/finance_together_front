export interface DebtsSchema {
  id: number;
  name: string;
  amount: number;
  description: string;
  due_date: string;
  status: string;
  user_id: number;
}

export interface AddDebtSchema {
  name: string;
  amount: number;
  description: string;
  due_date: Date;
}
