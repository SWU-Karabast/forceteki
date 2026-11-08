import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class KyloRenSupremeLeader extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4299826378',
            internalName: 'kylo-ren#supreme-leader',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give an Experience token to a unit',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.discardCardFromOwnHand(),
            ],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Return a unit from your discard pile to your hand',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Discard,
                cardTypeFilter: CardType.BasicUnit,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}
