export interface IUserBookingLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

export interface IUserBookingRequirements {
  samagriNeeded: boolean;
  numberOfPeople: number;
  specialInstructions: string;
  language: string;
}

export interface IUserBookingPayment {
  status: string;
}

export interface IUserBookingPanditContact {
  phone: string;
  email: string;
  whatsapp: string;
}

export interface IUserBookingPanditLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IUserBookingPandit {
  _id: string;
  name: string;
  photo: string;
  averageRating: number;
  contact: IUserBookingPanditContact;
  location: IUserBookingPanditLocation;
}

export interface IUserBooking {
  _id: string;

  user: string;
  pandit: IUserBookingPandit;

  poojaType: string;
  poojaDate: string;
  poojaTime: string;
  duration: string;

  location: IUserBookingLocation;

  price: number;
  platformFee: number;
  totalAmount: number;

  requirements: IUserBookingRequirements;

  status: string;

  payment: IUserBookingPayment;

  isReviewed: boolean;

  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IUserBookingsResponse {
  bookings: IUserBooking[];
}