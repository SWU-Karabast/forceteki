import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, CardType } from '../../../core/Constants';

export default class ColonelYularenIsbDirector extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0961039929',
            internalName: 'colonel-yularen#isb-director',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Heal 1 damage from your base',
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.player === context.player &&
                    event.card.hasSomeAspect(Aspect.Command)
            },
            immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({
                amount: 1,
                target: context.player.base
            }))
        });
    }
}
