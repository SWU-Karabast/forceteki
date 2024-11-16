import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, CardType, ZoneName, RelativePlayer } from '../../../core/Constants';

export default class ColonelYularenIsbDirector extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0961039929',
            internalName: 'colonel-yularen#isb-director',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Heal 1 damage from your base',
            when: {
                onCardPlayed: (event, context) =>
                    event.card.isUnit() &&
                    event.card.controller === context.source.controller &&
                    event.card.hasSomeAspect(Aspect.Command)
            },
            immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({
                amount: 1,
                target: context.source.controller.base
            }))
        });
    }
}

ColonelYularenIsbDirector.implemented = true;
