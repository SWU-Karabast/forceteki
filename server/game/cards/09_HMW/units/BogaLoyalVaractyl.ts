import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class BogaLoyalVaractyl extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'boga#loyal-varactyl-id',
            internalName: 'boga#loyal-varactyl',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: `Choose a non-${TextHelper.Trait.Vehicle} unit in your discard pile not named Boga. For this phase, you may play that unit from your discard pile. It costs ${TextHelper.resource(1)} less`,
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Discard,
                cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle) && card.title !== 'Boga',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous((context) => [
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        target: context.target,
                        effect: AbilityHelper.ongoingEffects.canPlayFromDiscard({ player: context.player })
                    }),
                    AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                        target: context.player,
                        effect: AbilityHelper.ongoingEffects.decreaseCost({ amount: 1, match: (card) => card === context.target && card.zoneName === ZoneName.Discard })
                    })
                ])
            }
        });
    }
}