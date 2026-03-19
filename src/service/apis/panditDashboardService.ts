import { privateClient } from "../apiClient";

export const panditDashboardAPI = {
    stats: () => privateClient.get('/pandit-dashboard/stats'),
    bookings: () => privateClient.get('/pandit-dashboard/bookings'),
    bookingById: (id: string) => privateClient.get(`/pandit-dashboard/bookings/${id}`),
    bookingStatus: (id: string) => privateClient.post(`/pandit-dashboard/bookings/${id}/status`),
    bookingConfirm: (id: string) => privateClient.post(`/pandit-dashboard/${id}/confirm`),
    bookingReject: (id: string) => privateClient.post(`/pandit-dashboard/${id}/reject`),
    bookingComplete: (id: string) => privateClient.post(`/pandit-dashboard/${id}/complete`),
    getProfile: (id: string) => privateClient.get('/pandit-dashboard/profile'),
    updateProfile: (data: any) => privateClient.put(`/pandit-dashboard/profile`),
    uploadImage: (data: any) => privateClient.post(`/pandit-dashboard/upload-photo`),
    uploadImages: (data: any) => privateClient.post(`/padit-dashboard/upload-photos`),
    deleteImage: (index: any) => privateClient.delete(`/pandit-dashboard/photos/${index}`),
    earnings: () => privateClient.get(`/pandit-dashboard/earnings`),

}