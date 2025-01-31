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

    protected abstract getCardInternal(id: string): Promise<ICardDataJson>;
    public abstract getSetCodeMap(): Promise<Map<string, string>>;

    public async getCard(id: string): Promise<ICardDataJson> {
        this.assertCardId(id);
        return await this.getCardInternal(id);
    }

    protected assertCardId(id: string) {
        Contract.assertTrue(this.cardMap.has(id), `Card ${id} not found in card map`);
    }
}
