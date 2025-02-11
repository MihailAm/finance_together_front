export type RootStackParamList = {
  setParams(arg0: any): unknown;
  goBack(): unknown;
  navigate(arg0: any, arg1?: any): void;
  Home: undefined;
  AccountCreate: undefined;
  AuthScreen: undefined;
  AccountDetails: {
    accountId: number;
    accountName: string;
    accountBalance: number;
  };
  Categories: undefined;
  Transactions: { accountId: number };
  AddTransactions: { accountId: number; type: string };
  AddPlannedExp: { accountId: number };
  Goals: { accountId: number };
  AddDebts: undefined;
  AddGoal: { accountId: number };
  GroupCreate: undefined;
  GroupAccounts: { groupId: number };
  AddGroupAccount: { groupId: number };
  GroupMembers: { groupId: number; role: string };
  HistoryExpense: { goalId: number };
};
