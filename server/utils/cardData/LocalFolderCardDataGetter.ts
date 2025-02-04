import path from 'path';
import fs from 'fs';
import * as Contract from '../../game/core/utils/Contract';
import { SynchronousCardDataGetter } from './SynchronousCardDataGetter';

export class LocalFolderCardDataGetter extends SynchronousCardDataGetter {
    // private readonly setCodeToId: Map<string, string>;
    private readonly folderRoot: string;

    public constructor(folderRoot: string) {
        Contract.assertTrue(fs.existsSync(folderRoot), `Card data folder ${folderRoot} does not exist`);

        const cardMap = JSON.parse(fs.readFileSync(path.join(folderRoot, '_cardMap.json'), 'utf8'));
        super(cardMap);

        this.folderRoot = folderRoot;

        // const setCodeToIdJson = JSON.parse(fs.readFileSync(path.join(testRoot, '_setCodeMap.json'), 'utf8'));

        // this.setCodeToId = new Map<string, string>();
        // for (const [setCode, id] of Object.entries(setCodeToIdJson)) {
        //     this.setCodeToId.set(setCode, id as string);
        // }
    }

    protected override getCardSynchronousInternal(id: string) {
        const cardMapEntry = this.cardMap.get(id);
        Contract.assertNotNullLike(cardMapEntry, `Data for card id ${id} not found in card map`);

        const filePath = path.join(this.folderRoot, `Card/${cardMapEntry.internalName}.json`);
        Contract.assertTrue(fs.existsSync(filePath), `Card data file ${filePath} does not exist`);

        return JSON.parse(fs.readFileSync(filePath, 'utf8'))[0];
    }

    public override getSetCodeMapSynchronous() {
        const filePath = path.join(this.folderRoot, '_setCodeMap.json');
        Contract.assertTrue(fs.existsSync(filePath), `Set code map file ${filePath} does not exist`);

        return new Map(Object.entries(JSON.parse(fs.readFileSync(filePath, 'utf8')))) as Map<string, string>;
    }
}
