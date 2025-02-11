import { CardDataGetter } from './CardDataGetter';
import type { ICardDataJson, ICardMapJson } from './CardDataInterfaces';
import { LocalFolderCardDataGetter } from './LocalFolderCardDataGetter';
import * as Contract from '../../game/core/utils/Contract';
import fs from 'fs';
import path from 'path';

// TODO THIS PR: interface for sync getters

/** Extends {@link CardDataGetter} with synchronous get methods */
export class UnitTestCardDataGetter extends LocalFolderCardDataGetter {
    private static readFileSync(folderRoot: string, relativePath: string): unknown {
        const filePath = path.join(folderRoot, relativePath);
        Contract.assertTrue(fs.existsSync(filePath), `Data file ${filePath} does not exist`);

        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    public constructor(folderRoot: string) {
        const cardMapJson = UnitTestCardDataGetter.readFileSync(folderRoot, CardDataGetter.cardMapFileName) as ICardMapJson;

        const tokenData = UnitTestCardDataGetter.getTokenCardsDataSync(
            (internalName) => UnitTestCardDataGetter.readFileSync(
                folderRoot,
                LocalFolderCardDataGetter.getRelativePathFromInternalName(internalName)
            )[0] as ICardDataJson
        );

        const playableCardTitles = UnitTestCardDataGetter.readFileSync(
            folderRoot,
            CardDataGetter.playableCardTitlesFileName
        ) as string[];

        super(folderRoot, cardMapJson, tokenData, playableCardTitles);
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
        return this.readFileSync(relativePath)[0] as ICardDataJson;
    }

    public getSetCodeMapSync(): Map<string, string> {
        return this.readFileSync(CardDataGetter.setCodeMapFileName) as Map<string, string>;
    }

    private readFileSync(relativePath: string): unknown {
        return UnitTestCardDataGetter.readFileSync(this.folderRoot, relativePath);
    }
}
