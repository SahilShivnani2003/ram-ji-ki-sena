export interface IPanditContact {
      phone: string;
      email: string;
      whatsapp: string;
}

export interface IPanditLocation {
      city: string;
      state: string;
}

export interface IPanditAvailability {
      workingDays: string[];
}

export interface IPanditService {
      _id: string;
      title: string;
      price: number;
      duration: string;
      type: string;
      description: string;
}

export interface IPanditReview {
      _id: string;
      userName: string;
      rating: number;
      comment: string;
      createdAt: string;
}

export interface IPandit {
      _id: string;
      username: string;
      password?: string;
      name: string;
      photo: string;
      photos: string[];

      contact: IPanditContact;
      location: IPanditLocation;
      availability: IPanditAvailability;

      experience: number;
      specialization: string[];
      languages: string[];

      averageRating: number;
      totalBookings: number;
      completedBookings: number;

      isVerified: boolean;
      isActive: boolean;
      user: string;

      services: IPanditService[];
      reviews: IPanditReview[];

      createdAt: string;
      updatedAt: string;
      __v: number;
}

export interface IPanditResponse {
      pandit: IPandit;
}