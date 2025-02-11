export interface TransactionSchema {
  id: number;
  amount: number;
  description: string;
  transaction_date: string;
  type: string;
  account_id: number;
  user_id: number;
  category_id: number;
}

export interface AddTransactionSchema {
  amount: number;
  description: string;
  type: string;
  account_id: number;
  categoty_id: number;
}
