import path from 'path';
import fs from 'fs';
import * as Contract from '../../game/core/utils/Contract';
import { SynchronousCardDataGetter } from './SynchronousCardDataGetter';
import { CardDataGetter } from './CardDataGetter';

export class LocalFolderCardDataGetter extends SynchronousCardDataGetter {
    private readonly folderRoot: string;

    private static validateFolderContents(directory: string, isLocal: boolean) {
        const getCardsSuffix = isLocal ? ', please run \'npm run get-cards\'' : '';

        Contract.assertTrue(fs.existsSync(directory), `Json card definitions folder ${directory} not found${getCardsSuffix}`);

        const actualCardDataVersionPath = path.join(directory, 'card-data-version.txt');
        Contract.assertTrue(fs.existsSync(actualCardDataVersionPath), `Card data version file ${actualCardDataVersionPath} not found${getCardsSuffix}`);

        const expectedCardDataVersionPath = path.join(__dirname, '../../card-data-version.txt');
        Contract.assertTrue(fs.existsSync(expectedCardDataVersionPath), `Repository file ${expectedCardDataVersionPath} not found${getCardsSuffix}`);

        const actualCardDataVersion = fs.readFileSync(actualCardDataVersionPath, 'utf8');
        const expectedCardDataVersion = fs.readFileSync(expectedCardDataVersionPath, 'utf8');
        Contract.assertTrue(actualCardDataVersion === expectedCardDataVersion, `Json card data version mismatch, expected '${expectedCardDataVersion}' but found '${actualCardDataVersion}' currently installed${getCardsSuffix}`);
    }

    public constructor(folderRoot: string, isLocal: boolean) {
        LocalFolderCardDataGetter.validateFolderContents(folderRoot, isLocal);

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

    protected override getRelativePathFromInternalName(internalName: string) {
        return `Card/${internalName}.json`;
    }
}
