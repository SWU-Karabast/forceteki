import AbilityHelper from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import { PhaseName } from '../../../core/Constants';

export default class VergenceTemple extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '7204128611',
            internalName: 'vergence-temple',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'The Force is with you',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card.isUnit() && card.remainingHp >= 4 }),
                onTrue: AbilityHelper.immediateEffects.theForceIsWithYou()
            })
        });
    }
}
