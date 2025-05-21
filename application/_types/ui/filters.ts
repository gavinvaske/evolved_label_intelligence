
export type ConditionalFilterFunction<T> = (objects: Partial<T>[]) => Partial<T>[];

export type UuidToTextFilter = { [key: string]: string; };
export type UuidToConditionalFilter<T> = { [key: string]: ConditionalFilterFunction<T>; };

export interface Filter<T> {
  searchBarInput: string;
  textFilters: UuidToTextFilter;
  conditionalFilters: { [key: string]: ConditionalFilterFunction<T>; };

  getSearchBarInput(): string;
  setSearchBarInput(value: string): void;

  getTextFilters(): UuidToTextFilter;
  setTextFilter(uuid: string, value: string): void;
  removeTextFilter(uuid: string): void;

  getConditionalFilters(): UuidToConditionalFilter<T>;
  setConditionalFilter(uuid: string, conditionalFilter: ConditionalFilterFunction<T>): void;
  removeConditionalFilter(uuid: string): void;

  resetAllFilters(): void;

  generateSearchQuery(searchBarInput: string, textQuickFilters: UuidToTextFilter): void;

  applyFilters(objects: T[] | undefined): T[];
}

export type TextFilterOption = {
  readonly uuid: string;
  value: string;
};

export type TextFilter = {
  description: string;
  options: TextFilterOption[];
};

export type ConditionalFilterOption<T> = {
  readonly uuid: string;
  textToDisplay: string;
  conditionalFilter: ConditionalFilterFunction<T>;
}

export type ConditionalFilter<T> = {
  description: string;
  options: ConditionalFilterOption<T>[];
};
