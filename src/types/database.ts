
// Export the Credential interface from the credentials panel to be used elsewhere
export interface Credential {
  belongs_to_slot: string;
  email: string;
  password: string;
  expiry_date: string;
  locked: number;
  max_usage: number;
  usage_count: number;
}

export interface Slots {
  [key: string]: {
    monthly_price: number;
    num_devices: number;
    title: string;
    stock: number;
  };
}

export interface DatabaseSchema {
  admin_config?: {
    superior_admins: string[];
    inferior_admins: string[];
  };
  settings?: {
    slots: Slots;
  };
  referrals?: {
    [key: string]: any;
  };
  referral_settings?: {
    buy_with_points_enabled: boolean;
    free_trial_enabled: boolean;
    points_per_referral: number;
    required_point: number;
  };
  free_trial_claims?: {
    [key: string]: any;
  };
  transactions?: {
    [key: string]: any;
  };
  used_orderids?: {
    [key: string]: any;
  };
  ui_config?: UIConfig;
  users?: {
    [key: string]: any;
  };
  [key: string]: any; // Allow for additional properties like cred1, cred2, etc.
}

export interface UIConfig {
  approve_flow: {
    account_format: string;
    gif_url: string;
    success_text: string;
  };
  confirmation_flow: {
    button_text: string;
    callback_data: string;
    caption: string;
    gif_url: string;
    photo_url: string;
  };
  crunchyroll_screen: {
    button_text: string;
    callback_data: string;
    caption: string;
    photo_url: string;
  };
  freetrial_info: {
    photo_url: string;
  };
  locked_flow: {
    locked_text: string;
  };
  out_of_stock: {
    gif_url: string;
    messages: string[];
  };
  phonepe_screen: {
    caption: string;
    followup_text: string;
    photo_url: string;
  };
  referral_info: {
    photo_url: string;
  };
  reject_flow: {
    error_text: string;
    gif_url: string;
  };
  slot_booking: {
    button_format: string;
    callback_data: string;
    caption: string;
    gif_url: string;
    photo_url: string;
  };
  start_command: {
    buttons: Array<{ text: string; callback_data: string }>;
    welcome_photo: string;
    welcome_text: string;
  };
  [key: string]: any;
}
