export interface ILiveKatha {
    _id: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    startDate: string;
    endDate: string | null;
    liveLink: string;
    kathaType: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
