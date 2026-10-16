export interface IAstrologerContact {
      phone: string;
      email: string;
      whatsapp: string;
}

export interface IAstrologerLocation {
      address?: string;
      city: string;
      state: string;
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

export type AstrologerAvailabilityStatus =
      | "online"
      | "offline"
      | "busy";

export interface IAstrologer {
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

      services?: IAstrologerService[];
      reviews?: IAstrologerReview[];

      averageRating: number;
      totalConsultations: number;

      isVerified: boolean;
      isActive: boolean;
      availabilityStatus: AstrologerAvailabilityStatus;

      createdAt: string;
      updatedAt: string;
      __v: number;
}

export interface IAstrologersResponse {
      astrologers: IAstrologer[];
}
