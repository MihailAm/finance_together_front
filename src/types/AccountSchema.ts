export interface AccountSchema {
  id: number;
  account_name: string;
  balance: number;
  user_id?: number;
  group_id?: number;
  created_at: string;
}

export interface AccountCreateSchemaUser {
  account_name: string;
}
