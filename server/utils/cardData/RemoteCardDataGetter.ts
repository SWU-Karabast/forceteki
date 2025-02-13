import { CardDataGetter } from './CardDataGetter';
import type { ICardDataJson, ICardMapJson } from './CardDataInterfaces';

/** Card data getter that makes single calls to AWS with no caching */
export class RemoteCardDataGetter extends CardDataGetter {
    public static async create(remoteDataUrl: string): Promise<RemoteCardDataGetter> {
        const cardMap: ICardMapJson =
            await (await RemoteCardDataGetter.fetchFileAbsolute(`${remoteDataUrl}${CardDataGetter.cardMapFileName}`)).json() as ICardMapJson;

        return new RemoteCardDataGetter(cardMap, remoteDataUrl);
    }

    protected static async fetchFileAbsolute(url: string): Promise<Response> {
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

    private constructor(cardMapJson: ICardMapJson, remoteDataUrl: string) {
        super(cardMapJson);

        this.remoteDataUrl = remoteDataUrl;
    }

    private fetchFile(relativePath: string): Promise<Response> {
        return RemoteCardDataGetter.fetchFileAbsolute(`${this.remoteDataUrl}${relativePath}`);
    }

    protected override getCardInternal(relativePath: string): Promise<ICardDataJson> {
        return this.fetchFile(relativePath)
            .then((response) => response.json() as Promise<ICardDataJson>)
            .then((cardData) => {
                return (Array.isArray(cardData) ? cardData[0] : cardData) as ICardDataJson;
            });
    }

    public override getSetCodeMap(): Promise<Map<string, string>> {
        return this.fetchFile(CardDataGetter.setCodeMapFileName)
            .then((response) => response.json() as Promise<Map<string, string>>);
    }

    public override getPlayableCardTitles(): Promise<string[]> {
        return this.fetchFile(CardDataGetter.playableCardTitlesFileName)
            .then((response) => response.json() as Promise<string[]>);
    }

    protected override getRelativePathFromInternalName(internalName: string) {
        return `cards/${internalName}.json`;
    }
}
