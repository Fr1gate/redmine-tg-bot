export interface CalendarResponse {
  year: number;
  months: Array<{
    month: number;
    days: string;
  }>;
  transitions: Array<{
    from: string;
    to: string;
  }>;
  statistic: {
    workdays: number;
    holidays: number;
    hours40: number;
    hours36: number;
    hours24: number;
  };
}
