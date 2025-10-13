import type { TokenName } from '../../game/core/Constants';
import { TokenCardName, TokenUnitName, TokenUpgradeName } from '../../game/core/Constants';
import * as Contract from '../../game/core/utils/Contract';
import type { ICardDataJson, ICardMap, ICardMapEntry, ICardMapJson } from './CardDataInterfaces';

export type ITokenCardsData = {
    [TokenNameValue in TokenName]: ICardDataJson;
};

export abstract class CardDataGetter {
    public readonly cardMap: ICardMap;

    private readonly knownCardInternalNames: Set<string>;
    private readonly _allCardTitles: string[];
    private readonly _playableCardTitles: string[];
    private readonly _setCodeMap: Map<string, string>;
    private readonly _tokenData: ITokenCardsData;
    private readonly _leaders: { name: string; id: string; subtitle?: string }[];

    protected static readonly setCodeMapFileName = '_setCodeMap.json';
    protected static readonly cardMapFileName = '_cardMap.json';
    protected static readonly allCardTitlesFileName = '_allCardTitles.json';
    protected static readonly playableCardTitlesFileName = '_playableCardTitles.json';
    protected static readonly leaderNamesFileName = '_leaderNames.json';

    public get cardIds(): string[] {
        return Array.from(this.cardMap.keys());
    }

    public get allCardTitles(): string[] {
        return this._allCardTitles;
    }

    public get playableCardTitles(): string[] {
        return this._playableCardTitles;
    }

    public get setCodeMap(): Map<string, string> {
        return this._setCodeMap;
    }

    public get tokenData(): ITokenCardsData {
        return this._tokenData;
    }

    public getLeaderCards() {
        return this._leaders;
    }

    public constructor(
        cardMapJson: ICardMapJson,
        tokenData: ITokenCardsData,
        allCardTitles: string[],
        playableCardTitles: string[],
        setCodeMap: Record<string, string>,
        leaderNames: { name: string; id: string; subtitle?: string }[],
    ) {
        this.cardMap = new Map<string, ICardMapEntry>();
        this.knownCardInternalNames = new Set<string>();

        for (const cardMapEntry of cardMapJson) {
            this.cardMap.set(cardMapEntry.id, cardMapEntry);
            this.knownCardInternalNames.add(cardMapEntry.internalName);
        }

        this._allCardTitles = allCardTitles;
        this._playableCardTitles = playableCardTitles;
        this._setCodeMap = new Map(Object.entries(setCodeMap));
        this._tokenData = tokenData;
        this._leaders = leaderNames;
    }

    protected abstract getCardInternalAsync(relativePath: string): Promise<ICardDataJson>;
    protected abstract getRelativePathFromInternalName(internalName: string);

    public getCardAsync(id: string): Promise<ICardDataJson> {
        const relativePath = this.getRelativePathFromInternalName(this.getInternalName(id));
        return this.getCardInternalAsync(relativePath);
    }

    public getCardByNameAsync(internalName: string): Promise<ICardDataJson> {
        this.checkInternalName(internalName);
        return this.getCardInternalAsync(this.getRelativePathFromInternalName(internalName));
    }

    public getCardBySetCodeAsync(setCode: string): Promise<ICardDataJson> {
        const relativePath = this.getRelativePathFromInternalName(this.getInternalNameFromSetCode(setCode));
        return this.getCardInternalAsync(relativePath);
    }

    protected static async getTokenCardsDataAsync(getCardAsync: (id: string) => Promise<ICardDataJson>): Promise<ITokenCardsData> {
        return {
            [TokenUnitName.BattleDroid]: await getCardAsync('battle-droid'),
            [TokenUnitName.CloneTrooper]: await getCardAsync('clone-trooper'),
            [TokenUnitName.TIEFighter]: await getCardAsync('tie-fighter'),
            [TokenUnitName.XWing]: await getCardAsync('xwing'),
            [TokenUnitName.Spy]: await getCardAsync('spy'),
            [TokenUpgradeName.Experience]: await getCardAsync('experience'),
            [TokenUpgradeName.Shield]: await getCardAsync('shield'),
            [TokenCardName.Force]: await getCardAsync('the-force'),
        };
    }

    protected static getTokenCardsDataSync(getCard: (id: string) => ICardDataJson): ITokenCardsData {
        return {
            [TokenUnitName.BattleDroid]: getCard('battle-droid'),
            [TokenUnitName.CloneTrooper]: getCard('clone-trooper'),
            [TokenUnitName.TIEFighter]: getCard('tie-fighter'),
            [TokenUnitName.XWing]: getCard('xwing'),
            [TokenUnitName.Spy]: getCard('spy'),
            [TokenUpgradeName.Experience]: getCard('experience'),
            [TokenUpgradeName.Shield]: getCard('shield'),
            [TokenCardName.Force]: getCard('the-force'),
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

    protected getInternalNameFromSetCode(setCode: string) {
        const id = this.setCodeMap.get(setCode);
        Contract.assertNotNullLike(setCode, `Card ${setCode} not found in card map`);

        return this.getInternalName(id);
    }
}
