export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  MainTabs: undefined;
  AddModal: undefined;
  Community: undefined;
  HiddenSpot: undefined;
  LocalGuides: undefined;
  Settings: undefined;
  TripPlanner: undefined;
  CreatePost: undefined;
  UploadStory: undefined;
  PlaceDetails: { id: string } | undefined;
  AdminHiddenSpotReview:
    | {
        submissionId?: string;
        action?: 'approved' | 'rejected';
      }
    | undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  AddTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
};
