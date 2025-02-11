export interface MembersSchema {
  id: number;
  user_id: number;
  group_id: number;
  role: string;
}

export interface AddMembersSchema {
  group_id: number;
  email: string;
  role: string;
}
