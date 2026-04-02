import { ILiveKatha } from "./ILiveKatha";

export interface IKathaVachak {
    _id: string;
    id: string;
    name: string;
    photo: string;
    experience: number;
    specialization: string;
    description: string;
    isLive: boolean;
    averageRating: number;
    reviews: any[];
    liveKathas: ILiveKatha[];
    contact: {
        phone: string;
        email: string;
        whatsapp: string;
    };
    socialMedia: {
        facebook: string;
        instagram: string;
        youtube: string;
        twitter: string;
    };
    photos: string[];
    createdAt: string;
    updatedAt: string;
}