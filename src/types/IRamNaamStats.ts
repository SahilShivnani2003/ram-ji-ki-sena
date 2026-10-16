export interface IRamNaamStats {
      totalRamNaam: number;
      totalMalas: number;
      totalDevotees: number;
      totalPandits: number;
      totalMandirs: number;
      totalKathaVachaks: number;
}

export interface ITopDevotee {
      _id: string;
      username: string;
      name: string;
      city: string;
      totalCount: number;
      mala: number;
}

export interface IRamNaamDashboardResponse {
      stats: IRamNaamStats;
      topDevotees: ITopDevotee[];
}