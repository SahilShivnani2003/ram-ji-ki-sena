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
    dailyCounts: { date: string; count: number; _id: string }[];
}