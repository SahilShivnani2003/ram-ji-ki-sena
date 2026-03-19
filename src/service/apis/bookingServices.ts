import { privateClient } from "../apiClient";

export const bookingAPI = {
    create: (data: any) => privateClient.post('/bookings/'),
    myBookings: () => privateClient.get('/bookings/my-bookings'),
    getById: (id: string) => privateClient.get(`/bookings/${id}`),
    cancel: (data: any, id: string) => privateClient.post(`/bookings/${id}/cancel`),
    review: (id: string, data: any) => privateClient.post(`/bookings/${id}/review`)
}