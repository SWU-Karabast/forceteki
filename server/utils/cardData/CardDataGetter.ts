import * as Contract from '../../game/core/utils/Contract';
import type { ICardDataJson, ICardMap, ICardMapEntry, ICardMapJson } from './CardDataInterfaces';

export abstract class CardDataGetter {
    public readonly cardMap: ICardMap;

    public get cardIds(): string[] {
        return Array.from(this.cardMap.keys());
    }

    public constructor(cardMapJson: ICardMapJson) {
        this.cardMap = new Map<string, ICardMapEntry>();
        for (const cardMapEntry of cardMapJson) {
            this.cardMap.set(cardMapEntry.id, cardMapEntry);
        }
    }

    protected abstract getCardDataJsonInternal(id: string): ICardDataJson;

    public getCardDataJson(id: string): ICardDataJson {
        Contract.assertTrue(this.cardMap.has(id), `Card ${id} not found in card map`);
        return this.getCardDataJsonInternal(id);
    }
}
