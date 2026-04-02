export interface IMandir {
    _id: string;
    name: string;
    description: string;
    history: string;
    photos: string[];
    averageRating: number;
    createdAt: string;
    festivals: any[];
    location: {
        address: string;
        city: string;
        state: string;
    };
    timing: {
        opening: string;
        closing: string;
        aarti: string[];
    };
    contact: {
        phone: string;
        email: string;
        website: string;
    };
    deity: {
        main: string;
        others: string[];
    };
    facilities: {
        parking: boolean;
        prasad: boolean;
        accommodation: boolean;
        wheelchairAccessible: boolean;
        restrooms: boolean;
        drinkingWater: boolean;
    };
    visitInfo: {
        bestTimeToVisit: string;
        dressCode: string;
        entryFee: string;
        photographyAllowed: boolean;
    };
    socialMedia: {
        facebook: string;
        instagram: string;
        youtube: string;
        twitter: string;
    };
    nearbyAttractions: any[];
}
