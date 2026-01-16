import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BenSoloFacingTheLight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7735455657',
            internalName: 'ben-solo#facing-the-light',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Ready another friendly unit. It can\'t be attacked this phase',
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.ready(),
                    abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: abilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
                    })
                ])
            }
        });
    }
}
