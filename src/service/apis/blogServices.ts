import { privateClient, publicClient } from "../apiClient";

export const blogAPI = {
    getAll: () => publicClient.get('/blogs'),
    getById: (id: string) => privateClient.get(`/blogs/${id}`),
    create: (data: any) => privateClient.post('/blogs/create'),
    like: (id: string) => privateClient.post(`/blogs/${id}/like`),
    comment: (id: string, data: any) => privateClient.post(`/blogs/${id}/comment`),
    myPosts: () => privateClient.get('/blogs/my/posts'),
}