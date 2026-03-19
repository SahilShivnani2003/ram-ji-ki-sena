import { privateClient, publicClient } from "../apiClient";

export const panditAPI = {
    register: (data: any) => publicClient.post('/pandit-auth/register', data),

    login: (data: any) => publicClient.post('/pandit-auth/login', data),

    me: () => privateClient.get('/pandit-auth/me'),

    getAll: (params?: any) => publicClient.get('/pandits/', { params }),

    getById: (id: string) => publicClient.get(`/pandits/${id}`),

    services: (id: string) => publicClient.get(`/pandits/${id}/services`),
}