import { CardDataGetter } from './CardDataGetter';
import path from 'path';
import fs from 'fs';
import * as Contract from '../../game/core/utils/Contract';

export class TestFolderCardDataGetter extends CardDataGetter {
    // private readonly setCodeToId: Map<string, string>;
    private readonly testRoot: string;

    public constructor() {
        const testRoot = path.resolve(__dirname, '../../../test/json');
        Contract.assertTrue(fs.existsSync(testRoot));

        const cardMap = JSON.parse(fs.readFileSync(path.join(testRoot, '_cardMap.json'), 'utf8'));
        super(cardMap);

        this.testRoot = testRoot;

        // const setCodeToIdJson = JSON.parse(fs.readFileSync(path.join(testRoot, '_setCodeMap.json'), 'utf8'));

        // this.setCodeToId = new Map<string, string>();
        // for (const [setCode, id] of Object.entries(setCodeToIdJson)) {
        //     this.setCodeToId.set(setCode, id as string);
        // }
    }

    protected override getCardDataJsonInternal(id: string) {
        const cardMapEntry = this.cardMap.get(id);
        Contract.assertNotNullLike(cardMapEntry);

        return JSON.parse(fs.readFileSync(path.join(this.testRoot, `Card/${id}.json`), 'utf8'));
    }
}
