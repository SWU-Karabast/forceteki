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
    private readonly _playableCardTitles: string[];
    private readonly _tokenData: ITokenCardsData;

    protected static readonly setCodeMapFileName = '_setCodeMap.json';
    protected static readonly cardMapFileName = '_cardMap.json';
    protected static readonly playableCardTitlesFileName = '_playableCardTitles.json';

    public get cardIds(): string[] {
        return Array.from(this.cardMap.keys());
    }

    public get playableCardTitles(): string[] {
        return this._playableCardTitles;
    }

    public get tokenData(): ITokenCardsData {
        return this._tokenData;
    }

    public constructor(cardMapJson: ICardMapJson, tokenData: ITokenCardsData, playableCardTitles: string[]) {
        this.cardMap = new Map<string, ICardMapEntry>();
        this.knownCardInternalNames = new Set<string>();

        for (const cardMapEntry of cardMapJson) {
            this.cardMap.set(cardMapEntry.id, cardMapEntry);
            this.knownCardInternalNames.add(cardMapEntry.internalName);
        }

        this._playableCardTitles = playableCardTitles;
        this._tokenData = tokenData;
    }

    protected abstract getCardInternalAsync(relativePath: string): Promise<ICardDataJson>;
    protected abstract getRelativePathFromInternalName(internalName: string);

    // TODO THIS PR: do we need this?
    public abstract getSetCodeMapAsync(): Promise<Map<string, string>>;

    public async getCard(id: string): Promise<ICardDataJson> {
        const relativePath = this.getRelativePathFromInternalName(this.getInternalName(id));
        return await this.getCardInternalAsync(relativePath);
    }

    public async getCardByName(internalName: string): Promise<ICardDataJson> {
        this.checkInternalName(internalName);
        return await this.getCardInternalAsync(this.getRelativePathFromInternalName(internalName));
    }

    protected static async getTokenCardsDataAsync(getCard: (string) => Promise<ICardDataJson>): Promise<ITokenCardsData> {
        return {
            [TokenUnitName.BattleDroid]: await getCard('battle-droid'),
            [TokenUnitName.CloneTrooper]: await getCard('clone-trooper'),
            [TokenUnitName.TIEFighter]: await getCard('tie-fighter'),
            [TokenUnitName.XWing]: await getCard('xwing'),
            [TokenUpgradeName.Experience]: await getCard('experience'),
            [TokenUpgradeName.Shield]: await getCard('shield'),
        };
    }

    protected static getTokenCardsDataSync(getCard: (string) => ICardDataJson): ITokenCardsData {
        return {
            [TokenUnitName.BattleDroid]: getCard('battle-droid'),
            [TokenUnitName.CloneTrooper]: getCard('clone-trooper'),
            [TokenUnitName.TIEFighter]: getCard('tie-fighter'),
            [TokenUnitName.XWing]: getCard('xwing'),
            [TokenUpgradeName.Experience]: getCard('experience'),
            [TokenUpgradeName.Shield]: getCard('shield'),
        };
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
