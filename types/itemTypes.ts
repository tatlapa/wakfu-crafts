export interface Item {
  definition: {
    item: {
      baseParameters: {
        itemTypeId: number;
        rarity: number;
      };
      id: number;
      level: number;
    };
    equipEffects: Array<{
      effect: {
        definition: {
          actionId: number;
          areaShape: number;
          areaSize: number[];
          id: number;
          params: number[];
        };
      };
    }>;
  };
  description: {
    en: string;
    es: string;
    fr: string;
    pt: string;
  };
  title: {
    en: string;
    es: string;
    fr: string;
    pt: string;
  };
}
