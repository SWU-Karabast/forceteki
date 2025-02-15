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

        const playableCardTitles = await (await RemoteCardDataGetter.fetchFileAsync(remoteDataUrl, CardDataGetter.playableCardTitlesFileName)).json() as string[];

        const setCodeMap = await RemoteCardDataGetter.fetchFileAsync(remoteDataUrl, CardDataGetter.setCodeMapFileName)
            .then((response) => response.json() as Promise<Map<string, string>>);

        return new RemoteCardDataGetter(remoteDataUrl, cardMap, tokenData, playableCardTitles, setCodeMap);
    }

    protected static getRelativePathFromInternalName(internalName: string) {
        return `cards/${internalName}.json`;
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

    public constructor(
        remoteDataUrl: string,
        cardMapJson: ICardMapJson,
        tokenData: ITokenCardsData,
        playableCardTitles: string[],
        setCodeMap: Map<string, string>
    ) {
        super(cardMapJson, tokenData, playableCardTitles, setCodeMap);

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
