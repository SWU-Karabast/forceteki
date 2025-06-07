import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, ZoneName } from '../../../core/Constants';

export default class YodasLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '5800386133',
            internalName: 'yodas-lightsaber',
        };
    }

    public override canAttach(targetCard: Card): boolean {
        return targetCard.isUnit() && !targetCard.hasSomeTrait(Trait.Vehicle);
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'You may use the Force. If you do, heal 3 damage from a base',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Heal 3 damage from a base',
                targetResolver: {
                    zoneFilter: ZoneName.Base,
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 3 }),
                }
            },
        });
    }
}