import { privateClient, publicClient } from "../apiClient";

export interface ICommunityPost {
    category: string;
    image: string[];
    text: string;
}
export const otherAPI = {
    lekhanHistory: () => publicClient.get('/lekhanHistoyr'),
    lekhanSave: (data: any) => privateClient.post('/save', data),
    lekhanStats: () => publicClient.get('public/home-stats'),
    alldevotees: () => privateClient.get('/devotees'),
    customName: (data: any) => privateClient.post('/custom-jaap-names', data),
    deleteName: (id: string) => privateClient.delete(`custom-jaap-names/${id}`),

    //community
    community: () => privateClient.get('/community/posts?page=1&limit=10&filter=all'),
    communityPost: (data: ICommunityPost) => privateClient.post('/community/posts', data),
    communityPostLike: (id: string) => privateClient.post(`/community/posts/${id}/like`),
    communityPostComment: (id: string, text: string) =>
        privateClient.post(`/community/posts/${id}/comments`, { text }),
    communityPostShare: (id: string) => privateClient.post(`/community/posts/${id}/share`)
}