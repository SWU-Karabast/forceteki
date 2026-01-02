import { CardDataGetter } from './CardDataGetter';
import type { ICardDataJson, ICardMapJson } from './CardDataInterfaces';
import { LocalFolderCardDataGetter } from './LocalFolderCardDataGetter';
import * as Contract from '../../game/core/utils/Contract';
import fs from 'fs';
import path from 'path';
import type { ISynchronousCardDataGetter } from './ISynchronousCardDataGetter';

/** Extends {@link CardDataGetter} with synchronous get methods */
export class UnitTestCardDataGetter extends LocalFolderCardDataGetter implements ISynchronousCardDataGetter {
    // Cache for card data to avoid repeated file I/O during tests
    private readonly cardDataCache = new Map<string, ICardDataJson>();

    private static readFileSync(folderRoot: string, relativePath: string): unknown {
        const filePath = path.join(folderRoot, relativePath);
        Contract.assertTrue(fs.existsSync(filePath), `Data file ${filePath} does not exist`);

        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    public constructor(folderRoot: string) {
        LocalFolderCardDataGetter.validateFolderContents(folderRoot, true);

        const cardMapJson = UnitTestCardDataGetter.readFileSync(folderRoot, CardDataGetter.cardMapFileName) as ICardMapJson;

        const tokenData = UnitTestCardDataGetter.getTokenCardsDataSync(
            (internalName) => UnitTestCardDataGetter.readFileSync(
                folderRoot,
                LocalFolderCardDataGetter.getRelativePathFromInternalName(internalName)
            ) as ICardDataJson
        );

        const allNonLeaderCardTitles = UnitTestCardDataGetter.readFileSync(
            folderRoot,
            CardDataGetter.allNonLeaderCardTitlesFileName
        ) as string[];

        const playableCardTitles = UnitTestCardDataGetter.readFileSync(
            folderRoot,
            CardDataGetter.playableCardTitlesFileName
        ) as string[];

        const setCodeMap = UnitTestCardDataGetter.readFileSync(folderRoot, CardDataGetter.setCodeMapFileName) as Record<string, string>;

        const leaderNames = UnitTestCardDataGetter.readFileSync(folderRoot, CardDataGetter.leaderNamesFileName) as { name: string; id: string; subtitle: string }[];
        super(folderRoot, cardMapJson, tokenData, allNonLeaderCardTitles, playableCardTitles, setCodeMap, leaderNames);
    }

    public getCardSync(id: string): ICardDataJson {
        const relativePath = this.getRelativePathFromInternalName(this.getInternalName(id));
        return this.getCardInternalSync(relativePath);
    }

    public getCardByNameSync(internalName: string): ICardDataJson {
        this.checkInternalName(internalName);
        return this.getCardInternalSync(this.getRelativePathFromInternalName(internalName));
    }


    protected getCardInternalSync(relativePath: string): ICardDataJson {
        // Check cache first to avoid repeated file I/O
        const cached = this.cardDataCache.get(relativePath);
        if (cached) {
            return cached;
        }

        const cardData = this.readFileSync(relativePath) as ICardDataJson;
        this.cardDataCache.set(relativePath, cardData);
        return cardData;
    }

    public getSetCodeMapSync(): Map<string, string> {
        return this.readFileSync(CardDataGetter.setCodeMapFileName) as Map<string, string>;
    }

    private readFileSync(relativePath: string): unknown {
        return UnitTestCardDataGetter.readFileSync(this.folderRoot, relativePath);
    }
}
