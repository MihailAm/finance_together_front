export interface GroupSchema {
  id: number;
  user_id: number;
  group_id: number;
  group_name: string;
  role: string;
}

export interface AddGroupSchema {
  id: number;
  name: string;
}
