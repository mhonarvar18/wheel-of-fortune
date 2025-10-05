export interface RegisterResponse {
  id: string;
  mobile: string;
}

/** پاسخ لاگین کاربر */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    mobile: string;
  };
}
