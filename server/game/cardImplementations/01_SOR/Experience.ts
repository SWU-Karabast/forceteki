import AbilityHelper from '../../AbilityHelper';
import { TokenUpgradeCard } from '../../core/card/TokenCards';
import Player from '../../core/Player';
import Contract from '../../core/utils/Contract';

export default class Experience extends TokenUpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2007868442',
            internalName: 'experience',
        };
    }
}

Experience.implemented = true;
