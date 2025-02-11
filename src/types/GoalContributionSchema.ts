export interface GoalContributionSchema {
  id: number;
  amount: number;
  contributed_at: string;
  is_active_pay: boolean;
  goal_id: number;
  user_id: number;
}
