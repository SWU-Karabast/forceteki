import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class BolsteredEndurance extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3730933081',
            internalName: 'bolstered-endurance',
        };
    }

    public override canAttach(targetCard: Card): boolean {
        return targetCard.isUnit() && targetCard.hasSomeTrait(Trait.Force);
    }
}