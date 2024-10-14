export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

let origin = API_BASE_URL;

export const setOrigin = (newOrigin: string) => {
  origin = newOrigin;
};

export const getApiUrl = () => origin;
