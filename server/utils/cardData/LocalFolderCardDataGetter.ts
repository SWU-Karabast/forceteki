import path from 'path';
import fs from 'fs';
import * as Contract from '../../game/core/utils/Contract';
import type { ITokenCardsData } from './CardDataGetter';
import { CardDataGetter } from './CardDataGetter';
import type { ICardDataJson, ICardMapJson } from './CardDataInterfaces';

export class LocalFolderCardDataGetter extends CardDataGetter {
    public static async createAsync(folderRoot: string, isDevelopment = true): Promise<LocalFolderCardDataGetter> {
        LocalFolderCardDataGetter.validateFolderContents(folderRoot, isDevelopment);

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

    protected static validateFolderContents(directory: string, isDevelopment: boolean) {
        const getCardsSuffix = isDevelopment ? ', please run \'npm run get-cards\'' : '';

        Contract.assertTrue(fs.existsSync(directory), `Json card definitions folder ${directory} not found${getCardsSuffix}`);

        const actualCardDataVersionPath = path.join(directory, 'card-data-version.txt');
        Contract.assertTrue(fs.existsSync(actualCardDataVersionPath), `Card data version file ${actualCardDataVersionPath} not found${getCardsSuffix}`);

        const expectedCardDataVersionPath = path.join(__dirname, '../../card-data-version.txt');
        Contract.assertTrue(fs.existsSync(expectedCardDataVersionPath), `Repository file ${expectedCardDataVersionPath} not found${getCardsSuffix}`);

        const actualCardDataVersion = fs.readFileSync(actualCardDataVersionPath, 'utf8');
        const expectedCardDataVersion = fs.readFileSync(expectedCardDataVersionPath, 'utf8');
        Contract.assertTrue(actualCardDataVersion === expectedCardDataVersion, `Json card data version mismatch, expected '${expectedCardDataVersion}' but found '${actualCardDataVersion}' currently installed${getCardsSuffix}`);
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

    protected constructor(
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
