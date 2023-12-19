export type User = {
  id: string;
  name: string;
};

export type Party = {
  id: string;
  code: string;
  name: string;
  password?: string;
  joined: boolean;
  host: boolean;
  protected: boolean;
  closed: boolean;
  participantCount?: number;
  participants?: string[];
  target?: User;
};
