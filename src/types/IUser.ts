export interface IUser {
    _id: string;
    username: string;
    name: string;
    city: string;
    contact: string;

    rank: number;
    currCount: number;
    totalCount: number;
    mala: number;

    role: string;
    about: string;

    dob: string | null;
    profileImage: string | null;
    coverImage: string | null;

    customJaapNames: string[];

    dailyCounts: {
        date: string;
        count: number;
        _id: string;
    }[];
}