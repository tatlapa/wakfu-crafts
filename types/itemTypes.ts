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
