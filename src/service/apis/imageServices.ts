import { privateClient } from "../apiClient";

export const imageAPI = {
    image: (data: any) => privateClient.post('/upload/image', data),
    images: (data: any) => privateClient.post('/upload/images', data)
}