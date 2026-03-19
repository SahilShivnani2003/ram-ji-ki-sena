import { publicClient } from "../apiClient";

export const otherAPI = {
    lekhanHistory: () => publicClient.get('/lekhanHistoyr'),
}