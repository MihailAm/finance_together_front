export interface PlannedExpSchema {
  id: number;
  amount: number;
  description: string;
  dur_date: string;
  type: string;
  account_id: number;
  user_id: number;
  category_id: number;
}

export interface AddPlannedExpSchema {
  amount: number;
  description: string;
  dur_date: Date;
  type: string;
  account_id: number;
}
