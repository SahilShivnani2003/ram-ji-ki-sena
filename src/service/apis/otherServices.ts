import { privateClient, publicClient } from "../apiClient";

export const otherAPI = {
    lekhanHistory: () => publicClient.get('/lekhanHistoyr'),
    lekhanSave : (data:any) =>privateClient.post('/save',data),
}