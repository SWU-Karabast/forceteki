import type { ICardDataJson } from './CardDataInterfaces';

export interface ISynchronousCardDataGetter {
    getCardSync(id: string): ICardDataJson;
    getCardByNameSync(internalName: string): ICardDataJson;
    getSetCodeMapSync(): Map<string, string>;
}
