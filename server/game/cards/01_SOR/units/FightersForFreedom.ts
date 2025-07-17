import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, CardType } from '../../../core/Constants';

export default class FightersForFreedom extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5907868016',
            internalName: 'fighters-for-freedom'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a base',
            when: {
                onCardPlayed: (event, context) =>
                    event.card.hasSomeAspect(Aspect.Aggression) &&
                    event.player === context.player &&
                    event.card !== context.source
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
            }
        });
    }
}
