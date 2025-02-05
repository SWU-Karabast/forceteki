import path from 'path';
import fs from 'fs';
import * as Contract from '../../game/core/utils/Contract';
import { SynchronousCardDataGetter } from './SynchronousCardDataGetter';
import { CardDataGetter } from './CardDataGetter';

export class LocalFolderCardDataGetter extends SynchronousCardDataGetter {
    private readonly folderRoot: string;

    public constructor(folderRoot: string) {
        Contract.assertTrue(fs.existsSync(folderRoot), `Card data folder ${folderRoot} does not exist`);

        const cardMap = JSON.parse(fs.readFileSync(path.join(folderRoot, CardDataGetter.cardMapFileName), 'utf8'));
        super(cardMap);

        this.folderRoot = folderRoot;
    }

    protected override getCardSynchronousInternal(relativePath: string) {
        const filePath = path.join(this.folderRoot, relativePath);
        Contract.assertTrue(fs.existsSync(filePath), `Card data file ${filePath} does not exist`);

        return JSON.parse(fs.readFileSync(filePath, 'utf8'))[0];
    }

    public override getSetCodeMapSynchronous() {
        const filePath = path.join(this.folderRoot, CardDataGetter.setCodeMapFileName);
        Contract.assertTrue(fs.existsSync(filePath), `Set code map file ${filePath} does not exist`);

        return new Map(Object.entries(JSON.parse(fs.readFileSync(filePath, 'utf8')))) as Map<string, string>;
    }

    public override getPlayableCardTitlesSynchronous() {
        const filePath = path.join(this.folderRoot, CardDataGetter.playableCardTitlesFileName);
        Contract.assertTrue(fs.existsSync(filePath), `Set code map file ${filePath} does not exist`);

        return JSON.parse(fs.readFileSync(filePath, 'utf8')) as string[];
    }
}
