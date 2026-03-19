import { privateClient, publicClient } from "../apiClient";

export const authAPI = {
    login: (data: any) => publicClient.post('/login', data),
    register: (data: any) => publicClient.post('/register', data),
    me: () => privateClient.get('/me'),
    save: (data: any) => privateClient.post('/save'),
    forgot: (data: any) => privateClient.post('/forgot'),
    devotes: () => privateClient.get('/devotees'),
    update: (data: any) => privateClient.post('profile/update'),

}