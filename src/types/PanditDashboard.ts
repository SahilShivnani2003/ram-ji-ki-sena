export interface IPanditDashboardStats {
      totalBookings: number;
      pendingBookings: number;
      confirmedBookings: number;
      completedBookings: number;
      totalEarnings: number;
      averageRating: number;
      totalReviews: number;
}

export interface IDashboardBookingLocation {
      address: string;
      city: string;
      state: string;
      pincode: string;
      landmark: string;
}

export interface IDashboardBookingRequirements {
      samagriNeeded: boolean;
      numberOfPeople: number;
      specialInstructions: string;
      language: string;
}

export interface IDashboardBookingPayment {
      status: string;
}

export interface IDashboardBookingUser {
      _id: string;
      name: string;
      contact: string;
}

export interface IUpcomingBooking {
      _id: string;
      user: IDashboardBookingUser;
      pandit: string;

      poojaType: string;
      poojaDate: string;
      poojaTime: string;
      duration: string;

      location: IDashboardBookingLocation;
      requirements: IDashboardBookingRequirements;
      payment: IDashboardBookingPayment;

      price: number;
      platformFee: number;
      totalAmount: number;

      status: string;
      isReviewed: boolean;

      createdAt: string;
      updatedAt: string;
      __v: number;
}

export interface IPanditDashboardResponse {
      stats: IPanditDashboardStats;
      upcomingBookings: IUpcomingBooking[];
}