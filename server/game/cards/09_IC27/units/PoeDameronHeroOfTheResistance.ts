import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class PoeDameronHeroOfTheResistance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9667531439',
            internalName: 'poe-dameron#hero-of-the-resistance',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'This unit gets +1/+0 for this phase',
            when: {
                onCardPlayed: (event, context) =>
                    event.card.hasSomeTrait(Trait.Resistance) &&
                    event.player === context.player &&
                    event.card !== context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
            })
        });
    }
}
