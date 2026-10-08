// export interface IMandir {
//     _id: string;
//     name: string;
//     description: string;
//     history: string;
//     photos: string[];
//     averageRating: number;
//     createdAt: string;
//     festivals: any[];
//     location: {
//         address: string;
//         city: string;
//         state: string;
//     };
//     timing: {
//         opening: string;
//         closing: string;
//         aarti: string[];
//     };
//     contact: {
//         phone: string;
//         email: string;
//         website: string;
//     };
//     deity: {
//         main: string;
//         others: string[];
//     };
//     facilities: {
//         parking: boolean;
//         prasad: boolean;
//         accommodation: boolean;
//         wheelchairAccessible: boolean;
//         restrooms: boolean;
//         drinkingWater: boolean;
//     };
//     visitInfo: {
//         bestTimeToVisit: string;
//         dressCode: string;
//         entryFee: string;
//         photographyAllowed: boolean;
//     };
//     socialMedia: {
//         facebook: string;
//         instagram: string;
//         youtube: string;
//         twitter: string;
//     };
//     nearbyAttractions: any[];
// }
export interface IMandir {
    _id: string;
    name: string;
    description: string;
    history: string;
    photos: string[];
    averageRating: number;
    createdAt: string;
    __v: number;

    festivals: any[];
    nearbyAttractions: any[];
    videos: any[];
    languages: string[];

    status: string;
    submittedBy: string | null;
    rejectionReason: string;
    significance: string;
    templeType: string;
    architecture: string;
    builtYear: string;

    location: {
        country: string;
        address: string;
        city: string;
        state: string;
    };

    timing: {
        opening: string;
        closing: string;
        aarti: {
            [key: string]: string;
            _id: string;
        }[];
        specialDays: any[];
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
        cloakroom: boolean;
        medicalAid: boolean;
        foodStalls: boolean;
        parking: boolean;
        prasad: boolean;
        accommodation: boolean;
        wheelchairAccessible: boolean;
        restrooms: boolean;
        drinkingWater: boolean;
    };

    visitInfo: {
        mobileAllowed: boolean;
        shoeStand: boolean;
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
}
