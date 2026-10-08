export interface IPanditStats {
      totalBookings: number;
      pendingBookings: number;
      confirmedBookings: number;
      completedBookings: number;
      totalEarnings: number;
      averageRating: number;
      totalReviews: number;
}

export interface IPanditDashboard {
      stats: IPanditStats;
      upcomingBookings: any[];
}