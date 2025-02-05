import type { TokenName } from '../../game/core/Constants';
import { TokenUnitName, TokenUpgradeName } from '../../game/core/Constants';
import * as Contract from '../../game/core/utils/Contract';
import type { ICardDataJson, ICardMap, ICardMapEntry, ICardMapJson } from './CardDataInterfaces';

export type ITokenCardsData = {
    [TokenNameValue in TokenName]: ICardDataJson;
};

export abstract class CardDataGetter {
    public readonly cardMap: ICardMap;
    private readonly knownCardInternalNames: Set<string>;

    protected static readonly setCodeMapFileName = '_setCodeMap.json';
    protected static readonly cardMapFileName = '_cardMap.json';
    protected static readonly playableCardTitlesFileName = '_playableCardTitles.json';

    public get cardIds(): string[] {
        return Array.from(this.cardMap.keys());
    }

    protected constructor(cardMapJson: ICardMapJson) {
        this.cardMap = new Map<string, ICardMapEntry>();
        this.knownCardInternalNames = new Set<string>();

        for (const cardMapEntry of cardMapJson) {
            this.cardMap.set(cardMapEntry.id, cardMapEntry);
            this.knownCardInternalNames.add(cardMapEntry.internalName);
        }
    }

    protected abstract getCardInternal(relativePath: string): Promise<ICardDataJson>;
    public abstract getSetCodeMap(): Promise<Map<string, string>>;
    public abstract getPlayableCardTitles(): Promise<string[]>;

    public async getCard(id: string): Promise<ICardDataJson> {
        const relativePath = this.getRelativePathFromInternalName(this.getInternalName(id));
        return await this.getCardInternal(relativePath);
    }

    public async getCardByName(internalName: string): Promise<ICardDataJson> {
        this.checkInternalName(internalName);
        return await this.getCardInternal(this.getRelativePathFromInternalName(internalName));
    }

    public async getTokenCardsData(): Promise<ITokenCardsData> {
        return {
            [TokenUnitName.BattleDroid]: await this.getCardByName('battle-droid'),
            [TokenUnitName.CloneTrooper]: await this.getCardByName('clone-trooper'),
            [TokenUnitName.TIEFighter]: await this.getCardByName('tie-fighter'),
            [TokenUnitName.XWing]: await this.getCardByName('xwing'),
            [TokenUpgradeName.Experience]: await this.getCardByName('experience'),
            [TokenUpgradeName.Shield]: await this.getCardByName('shield'),
        };
    }

    protected getRelativePathFromInternalName(internalName: string) {
        return `Card/${internalName}.json`;
    }

    protected checkInternalName(internalName: string) {
        Contract.assertTrue(this.knownCardInternalNames.has(internalName), `Card ${internalName} not found in card map`);
    }

    protected getInternalName(id: string) {
        const internalName = this.cardMap.get(id)?.internalName;
        Contract.assertNotNullLike(internalName, `Card ${id} not found in card map`);
        return internalName;
    }
}
