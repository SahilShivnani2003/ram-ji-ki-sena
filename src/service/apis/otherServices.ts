import { privateClient, publicClient } from "../apiClient";

export const otherAPI = {
    lekhanHistory: () => publicClient.get('/lekhanHistoyr'),
    lekhanSave: (data: any) => privateClient.post('/save', data),
    lekhanStats: () => publicClient.get('public/home-stats'),
    alldevotees: () => privateClient.get('/devotees'),
    customName: (data: any) => privateClient.post('/custom-jaap-names', data),
    deleteName: (id: string) => privateClient.delete(`custom-jaap-names/${id}`),

    //community
    community: () => publicClient.get('/community/posts?page=1&limit=10&filter=all'),
}