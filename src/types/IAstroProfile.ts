export interface IAstrologerContact {
      phone: string;
      email: string;
      whatsapp: string;
}

export interface IAstrologerLocation {
      city: string;
      state: string;
      address?: string;
}

export interface IAstrologerProfile {
      _id: string;
      username: string;
      password?: string;

      name: string;
      tagline: string;
      photo: string;
      photos: string[];
      about: string;

      contact: IAstrologerContact;
      location: IAstrologerLocation;

      experience: number;
      specialties: string[];
      languages: string[];
      qualifications: string;

      fee: number;
      feePerMinute: number;
      averageRating: number;
      totalConsultations: number;

      isVerified: boolean;
      isActive: boolean;
      availabilityStatus: "online" | "offline" | "busy";

      services: IAstrologerService[];
      reviews: IAstrologerReview[];

      createdAt: string;
      updatedAt: string;
      __v: number;
}

export interface IAstrologerService {
      _id: string;
      title: string;
      price: number;
      duration: string;
      type: string;
      description: string;
}

export interface IAstrologerReview {
      _id: string;
      userName: string;
      rating: number;
      comment: string;
      topic: string;
      createdAt: string;
}

// API response wrapper
export interface IAstrologerProfileResponse {
      astrologer: IAstrologerProfile;
}