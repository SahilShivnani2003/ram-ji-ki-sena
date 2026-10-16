import { publicClient, privateClient } from '../apiClient';

export const astrologerApi = {
      login: async (payload: any) => {
            const response = await publicClient.post('/astrology-auth/login', payload);
            return response.data;
      },

      register: async (payload: any) => {
            const response = await publicClient.post('/astrology-auth/register', payload);
            return response.data;
      },

      getAstrologers: async () => {
            const response = await publicClient.get('/astrology?sortBy=rating');
            return response.data;
      },

      stats: async () => {
            const response = await privateClient.get('/astrology-dashboard/stats');
            return response.data;
      },

      astroConsultation: async () => {
            const response = await privateClient.get('/astrology-dashboard/consultations');
            return response.data;
      },

      profileUpdate: async (data: any) => {
            const response = await privateClient.put('astrology-dashboard/profile', data);
            return response.data;
      },

      profile: async (id: any) => {
            const response = await publicClient.get(`/astrology/${id}`);
            return response.data;
      },

      updateConsultation: async (id: string, data: any) => {
            const response = await privateClient.put(`/astrology-dashboard/consultations/${id}`, data);
            return response.data;
      },

      createConsultation: async (data: any) => {
            const response = await privateClient.post('/astrology/consultation', data);
            return response.data;
      },
      review: async (id: string, data: any) => {
            // send -  userName, rating, comment, topic
            const response = await privateClient.post(`/astrology/${id}/review`, data);
            return response.data;
      },
};