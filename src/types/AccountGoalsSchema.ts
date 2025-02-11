export interface AccountGoalsSchema {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  description: string;
  due_date: string;
  created_at?: string;
  status: string;
  user_id: number;
  account_id: number;
}

export interface AddGoalSchema {
  name: string;
  target_amount: number;
  current_amount: number;
  description: string;
  due_date: Date;
  status: string;
  account_id: number;
}
