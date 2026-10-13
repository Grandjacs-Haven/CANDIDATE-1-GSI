// ==============================|| THEME CONSTANT ||============================== //

export const APP_DEFAULT_PATH = '/';
export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 60;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api/v1';
export const LOGIN_ENDPOINT = import.meta.env.VITE_APP_LOGIN_ENDPOINT || '/auth/login';
export const USERS_ENDPOINT = '/users';
export const ADDRESSES_ENDPOINT = '/addresses';
export const APP_HEADER_KEY = 'X-APP';
export const ACTOR_ID_HEADER = import.meta.env.VITE_APP_ACTOR_ID_HEADER || 'actor_id';

const config = {
  fontFamily: `'Manrope', sans-serif`
};

export default config;
