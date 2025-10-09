import type { ITokenCardsData } from './CardDataGetter';
import { CardDataGetter } from './CardDataGetter';
import type { ICardDataJson, ICardMapJson } from './CardDataInterfaces';

/** Card data getter that makes single calls to AWS with no caching */
export class RemoteCardDataGetter extends CardDataGetter {
    public static async createAsync(remoteDataUrl: string): Promise<RemoteCardDataGetter> {
        const cardMap: ICardMapJson =
            await (await RemoteCardDataGetter.fetchFileAsync(remoteDataUrl, CardDataGetter.cardMapFileName)).json() as ICardMapJson;

        const tokenData = await CardDataGetter.getTokenCardsDataAsync(
            async (internalName) => (await RemoteCardDataGetter.fetchFileAsync(
                remoteDataUrl,
                RemoteCardDataGetter.getRelativePathFromInternalName(internalName)
            )).json() as Promise<ICardDataJson>
        );

        const allCardTitles = await (await RemoteCardDataGetter.fetchFileAsync(remoteDataUrl, CardDataGetter.allCardTitlesFileName)).json() as string[];
        const playableCardTitles = await (await RemoteCardDataGetter.fetchFileAsync(remoteDataUrl, CardDataGetter.playableCardTitlesFileName)).json() as string[];

        const setCodeMap = await RemoteCardDataGetter.fetchFileAsync(remoteDataUrl, CardDataGetter.setCodeMapFileName)
            .then((response) => response.json() as Promise<Record<string, string>>);

        const leaderNames = await (await RemoteCardDataGetter.fetchFileAsync(remoteDataUrl, CardDataGetter.leaderNamesFileName)).json() as { name: string; id: string; subtitle?: string }[];
        return new RemoteCardDataGetter(remoteDataUrl, cardMap, tokenData, allCardTitles, playableCardTitles, setCodeMap, leaderNames);
    }

    protected static getRelativePathFromInternalName(internalName: string) {
        const webSafeInternalName = internalName.replace('#', '%23');
        return `cards/${webSafeInternalName}.json`;
    }

    protected static async fetchFileAsync(remoteDataUrl: string, relativePath: string): Promise<Response> {
        const url = remoteDataUrl + relativePath;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            throw new Error(`Error fetching ${url}: ${error}`);
        }
    }

    private readonly remoteDataUrl: string;

    protected constructor(
        remoteDataUrl: string,
        cardMapJson: ICardMapJson,
        tokenData: ITokenCardsData,
        allCardTitles: string[],
        playableCardTitles: string[],
        setCodeMap: Record<string, string>,
        leaderNames: { name: string; id: string; subtitle?: string }[],
    ) {
        super(cardMapJson, tokenData, allCardTitles, playableCardTitles, setCodeMap, leaderNames);

        this.remoteDataUrl = remoteDataUrl;
    }

    private fetchFileAsync(relativePath: string): Promise<Response> {
        return RemoteCardDataGetter.fetchFileAsync(this.remoteDataUrl, relativePath);
    }

    protected override getCardInternalAsync(relativePath: string): Promise<ICardDataJson> {
        return this.fetchFileAsync(relativePath)
            .then((response) => response.json() as Promise<ICardDataJson>);
    }

    protected override getRelativePathFromInternalName(internalName: string) {
        return RemoteCardDataGetter.getRelativePathFromInternalName(internalName);
    }
}
