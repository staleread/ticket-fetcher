type BaseResult = {
  id: number | null;
  result: unknown;
  error: string | null;
};

export type PriceResult = {
  zone_no: string;
  price: string;
};

export type PerformanceDetailResult = Omit<BaseResult, 'result'> & {
  result: {
    GetPerformanceDetailWithDiscountingExResult: {
      Price: PriceResult[];
    };
  };
};

export type SeatResult = {
  D: string;
};

export type SectionResult = {
  section: string;
  section_desc: string;
};

export type SeatBriefResult = Omit<BaseResult, 'result'> & {
  result: {
    GetSeatsBriefExResults: {
      S: SeatResult[];
      Section: SectionResult[];
    };
  };
};
