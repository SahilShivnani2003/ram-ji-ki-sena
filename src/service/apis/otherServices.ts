import { privateClient, publicClient } from "../apiClient";

export const otherAPI = {
    lekhanHistory: () => publicClient.get('/lekhanHistoyr'),
    lekhanSave: (data: any) => privateClient.post('/save', data),
    lekhanStats: () => publicClient.get('public/home-stats'),
    alldevotees: () => privateClient.get('/devotees'),
}