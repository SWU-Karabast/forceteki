import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, Trait } from '../../../core/Constants';

export default class TacticalDroidCommander extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3589814405',
            internalName: 'tactical-droid-commander',
        };
    }

    public override setupCardAbilities(card: this): void {
        card.addTriggeredAbility({
            title: 'You may exhaust a unit that costs the same or less than the played unit.',
            optional: true,
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.card !== context.source &&
                    event.player === context.player &&
                    event.card.hasSomeTrait(Trait.Separatist)
            },
            targetResolver: {
                cardCondition: (card, context) => card.isUnit() && card.cost <= context.event.card.cost,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}
