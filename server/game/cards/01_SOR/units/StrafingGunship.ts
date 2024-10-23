import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, EffectName, Location } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class StrafingGunship extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5464125379',
            internalName: 'strafing-gunship',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'This unit can attack units in the ground arena',
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.CanAttackGroundArenaFromSpaceArena)
        });

        this.addTriggeredAbility({
            title: 'While this unit is attacking a ground unit, the defender gets –2/–0.',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source && event.attack.target.defaultArena === Location.GroundArena,
            },
            immediateEffect: AbilityHelper.immediateEffects.cardLastingEffect((context) => ({
                target: context.event.attack.target,
                duration: Duration.UntilEndOfAttack,
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
            }))
        });
    }
}

StrafingGunship.implemented = true;
