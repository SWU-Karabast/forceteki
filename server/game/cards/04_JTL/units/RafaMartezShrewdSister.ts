
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

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Deal 1 damage to a friendly unit and ready a resource',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit(),
                zoneFilter: WildcardZoneName.Any,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    AbilityHelper.immediateEffects.readyResources({ amount: 1 })
                ])
            }
        });
    }
}