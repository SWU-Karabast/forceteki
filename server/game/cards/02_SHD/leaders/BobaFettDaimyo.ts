import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BobaFettDaimyo extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9334480612',
            internalName: 'boba-fett#daimyo',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust this leader to give a friendly unit +1/+0 for this phase',
            optional: true,
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit && event.player === context.player && event.card.keywords.length > 0
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Give a friendly unit +1/+0 for this phase',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
                    })
                },
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each other friendly unit that has 1 or more keywords gets +1/+0',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.keywords.length > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });
    }
}
