import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class AdmiralOzzelOverconfident extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8117080217',
            internalName: 'admiral-ozzel#overconfident'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play an Imperial unit from your hand. It enters play ready',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Play an Imperial unit from your hand. It enters play ready',
                    // TODO: figure out how to make this assume that the played card must be from hand, unless specified otherwise
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Imperial),
                    immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({ entersReady: true, playAsType: WildcardCardType.Unit })
                }),
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Ready a unit',
                    player: RelativePlayer.Opponent,
                    optional: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.ready()
                })
            ])
        });
    }
}
