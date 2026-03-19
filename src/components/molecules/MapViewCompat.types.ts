export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapMarkerItem = {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  onPress?: () => void;
};

export type MapPressLocation = {
  latitude: number;
  longitude: number;
};
