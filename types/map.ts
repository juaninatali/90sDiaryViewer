export type MapVenueData = {
  name: string;
  diaryEntryCount: number;
};

export type MapLocationData = {
  address: string;
  venues: MapVenueData[];
};
