import path from 'path';
import fs from 'fs';
import * as Contract from '../../game/core/utils/Contract';
import type { ITokenCardsData } from './CardDataGetter';
import { CardDataGetter } from './CardDataGetter';
import type { ICardDataJson, ICardMapJson } from './CardDataInterfaces';

export class LocalFolderCardDataGetter extends CardDataGetter {
    public static async create(folderRoot: string): Promise<LocalFolderCardDataGetter> {
        Contract.assertTrue(fs.existsSync(folderRoot), `Card data folder ${folderRoot} does not exist`);

        const cardMap: ICardMapJson =
            await LocalFolderCardDataGetter.readFileAsync(folderRoot, CardDataGetter.cardMapFileName) as ICardMapJson;

        const tokenData = await CardDataGetter.getTokenCardsDataAsync(
            async (internalName) => (await LocalFolderCardDataGetter.readFileAsync(
                folderRoot,
                LocalFolderCardDataGetter.getRelativePathFromInternalName(internalName)
            )) as ICardDataJson
        );

        const playableCardTitles = await (await LocalFolderCardDataGetter.readFileAsync(
            folderRoot,
            CardDataGetter.playableCardTitlesFileName)
        ) as string[];

        const setCodeMap = await LocalFolderCardDataGetter.readFileAsync(folderRoot, CardDataGetter.setCodeMapFileName)
            .then((data) => data as Record<string, string>);

        return new LocalFolderCardDataGetter(folderRoot, cardMap, tokenData, playableCardTitles, setCodeMap);
    }

    protected static getRelativePathFromInternalName(internalName: string) {
        return `Card/${internalName}.json`;
    }

    protected static async readFileAsync(folderRoot: string, relativePath: string): Promise<unknown> {
        const filePath = path.join(folderRoot, relativePath);
        Contract.assertTrue(fs.existsSync(filePath), `Data file ${filePath} does not exist`);

        return JSON.parse(await fs.promises.readFile(filePath, { encoding: 'utf8' }));
    }

    protected readonly folderRoot: string;

    public constructor(
        folderRoot: string,
        cardMapJson: ICardMapJson,
        tokenData: ITokenCardsData,
        playableCardTitles: string[],
        setCodeMap: Record<string, string>
    ) {
        super(cardMapJson, tokenData, playableCardTitles, setCodeMap);

        this.folderRoot = folderRoot;
    }

    private readFileAsync(relativePath: string): Promise<unknown> {
        return LocalFolderCardDataGetter.readFileAsync(this.folderRoot, relativePath);
    }

    protected override getCardInternalAsync(relativePath: string): Promise<ICardDataJson> {
        return this.readFileAsync(relativePath)
            .then((data) => data as Promise<ICardDataJson>);
    }

    protected override getRelativePathFromInternalName(internalName: string) {
        return LocalFolderCardDataGetter.getRelativePathFromInternalName(internalName);
    }
}
