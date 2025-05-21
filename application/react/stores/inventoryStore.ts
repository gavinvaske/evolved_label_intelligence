import { makeAutoObservable, toJS } from "mobx";
import * as JsSearch from 'js-search';
import { ConditionalFilterFunction, UuidToTextFilter, Filter, UuidToConditionalFilter } from "@ui/types/filters";
import { IMaterial } from "@shared/types/models";
import { MongooseIdStr } from "@shared/types/typeAliases";

/* Mobx Store */
class InventoryStore implements Filter<any> {
  searchBarInput: string = ''
  textFilters: UuidToTextFilter = {}
  conditionalFilters: UuidToConditionalFilter<any> = {}
  materials: Record<MongooseIdStr, IMaterial> = {};

  constructor() {
    makeAutoObservable(this);
  }

  getSearchBarInput(): string {
    return this.searchBarInput;
  }

  getTextFilters(): UuidToTextFilter {
    return this.textFilters;
  }

  getConditionalFilters(): UuidToConditionalFilter<any> {
    return this.conditionalFilters;
  }

  setSearchBarInput(value: string): void {
    this.searchBarInput = value
  }

  setConditionalFilter(uuid: string, conditionalFilter: ConditionalFilterFunction<any>): void {
    this.conditionalFilters[uuid] = conditionalFilter
  }

  removeConditionalFilter(uuid: string): void {
    delete this.conditionalFilters[uuid]
  }

  setTextFilter(uuid: string, value: string): void {
    this.textFilters[uuid] = value
  }

  removeTextFilter(uuid: string): void {
    delete this.textFilters[uuid];
  }

  resetAllFilters(): void {
    this.searchBarInput = ''
    this.textFilters = {};
    this.conditionalFilters = {};
  }

  getArrivedMaterialsLength() {
    return Object.values(this.materials).reduce((sum, material) => sum + (material.inventory.lengthArrived || 0), 0)
  }

  getNotArrivedMaterialsLength() {
    return Object.values(this.materials).reduce((sum, material) => sum + (material.inventory.lengthNotArrived || 0), 0)
  }

  getNetLengthAdjustments() {
    return Object.values(this.materials).reduce((sum, material) => sum + (material.inventory.sumOfLengthAdjustments || 0), 0)
  }

  getNetLengthOfMaterialsInInventory() {
    const lengthOfArrivedMaterials = this.getArrivedMaterialsLength()
    const netLengthAdjustments = this.getNetLengthAdjustments()

    return lengthOfArrivedMaterials + netLengthAdjustments
  }

  generateSearchQuery(searchBarInput: string, textFilters: UuidToTextFilter): string {
    const textFilterQuery = Object.values(textFilters).join(' ')
    const trimmedSearchBarInput = searchBarInput.trim();

    if (trimmedSearchBarInput || textFilterQuery) {
      return `${trimmedSearchBarInput} ${textFilterQuery}`
    }

    return '';
  }

  applyFilters(materials: IMaterial[] | undefined): IMaterial[] {
    const noFiltersAreApplied = !this.searchBarInput && Object.keys(this.textFilters).length === 0 && Object.keys(this.conditionalFilters).length === 0

    if (noFiltersAreApplied) return materials || [];
    if (!materials) return [];

    const search : JsSearch.Search = new JsSearch.Search(['_id']);
    search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
    search.addIndex(['name']);
    search.addIndex(['materialId']);
    search.addIndex(['materialCategory', 'name']);
    search.addIndex(['vendor', 'name']);
    search.addIndex(['adhesiveCategory', 'name']);
    search.addIndex(['description']);
    search.addIndex(['faceColor']);
    search.addIndex(['thickness']);
    search.addDocuments(materials)

    const searchQuery: string = this.generateSearchQuery(this.searchBarInput, this.textFilters)

    const textSearchResults = searchQuery ? search.search(searchQuery) as IMaterial[] : materials

    const conditionalFilterFunctions = Object.values(this.conditionalFilters)
    
    return conditionalFilterFunctions.reduce((acc, conditionalFilterFunction: any) => {
      return conditionalFilterFunction(acc)
    }, textSearchResults)
  }

  getMaterials() {
    return Object.values(this.materials);
  }

  getFilteredMaterials(): IMaterial[] {
    return this.applyFilters(toJS(this.getSortedMaterials()));
  }

  getSortedMaterials(): IMaterial[] {
    return Object.values(this.materials).sort((a, b) => {
      const aValue = (a.inventory.netLengthAvailable < a.lowStockThreshold) 
        ? 0 : a.inventory.netLengthAvailable < a.lowStockThreshold + a.lowStockBuffer 
        ? 1 : 2;
      const bValue = (b.inventory.netLengthAvailable < b.lowStockThreshold) 
        ? 0 : b.inventory.netLengthAvailable < b.lowStockThreshold + b.lowStockBuffer 
        ? 1 : 2;
      return aValue - bValue || a.name.localeCompare(b.name);
    });
  }

  setMaterial(material: IMaterial): void {
    this.materials[material._id as string] = material;
  }

  setMaterials(materials: IMaterial[]): void {
    this.materials = materials.reduce((acc, material) => {
      acc[material._id as string] = material;
      return acc;
    }, {} as Record<MongooseIdStr, IMaterial>);
  }

  removeMaterial(id: MongooseIdStr): void {
    delete this.materials[id];
  }
}

export default new InventoryStore();