import { publicClient } from "../apiClient";

export const kathaVachakAPI = {
    getAll: () => publicClient.get('/katha-vachaks/'),
    getById: (id: string) => publicClient.get(`/katha-vachaks/${id}`),
    createReview: (id: string) => publicClient.post(`/kath-vachaks/${id}/review`),
}