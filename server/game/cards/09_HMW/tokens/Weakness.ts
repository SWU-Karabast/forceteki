import { TokenUpgradeCard } from '../../../core/card/TokenCards';

export default class Weakness extends TokenUpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'weakness-id',
            internalName: 'weakness',
        };
    }

    public override isWeakness(): this is Weakness {
        return true;
    }
}
