
import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class RafaMartezShrewdSister extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3278986026',
            internalName: 'rafa-martez#shrewd-sister'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Deal 1 damage to a friendly unit and ready a resource',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit(),
                zoneFilter: WildcardZoneName.AnyArena,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    AbilityHelper.immediateEffects.readyResources((context) => ({
                        amount: 1,
                        target: context.player
                    }))
                ])
            }
        });
    }
}