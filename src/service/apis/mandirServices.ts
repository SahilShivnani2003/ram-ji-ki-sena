import { publicClient } from "../apiClient";

export const mandirAPI = {
    getAll: () => publicClient.get('/mandirs'),
    getById: (id: string) => publicClient.get(`/mandirs/${id}`),
    createReview: (data: any, id: string) => publicClient.post(`/mandirs/${id}/review`),
    nearbySearch: () => publicClient.get('/madirs/nearby/search')
}