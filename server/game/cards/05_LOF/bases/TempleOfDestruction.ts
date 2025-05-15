import AbilityHelper from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import { DamageType } from '../../../core/Constants';

export default class TempleOfDestruction extends BaseCard {
    protected override getImplementationId () {
        return {
            id: 'temple-of-destruction-id',
            internalName: 'temple-of-destruction',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'The Force is with you',
            when: {
                onDamageDealt: (event, context) =>
                    event.damageSource.player === context.player &&
                    event.amount >= 3 &&
                    event.type === DamageType.Combat &&
                    event.card.isBase() && event.card.controller !== context.player
            },
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
        });
    }
}
