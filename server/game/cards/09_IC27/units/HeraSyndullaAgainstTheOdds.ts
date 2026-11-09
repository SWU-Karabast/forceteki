import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, Trait } from '../../../core/Constants';

export default class HeraSyndullaAgainstTheOdds extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2585779194',
            internalName: 'hera-syndulla#against-the-odds',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a base',
            when: {
                onCardPlayed: (event, context) =>
                    event.card.hasSomeTrait(Trait.Rebel) &&
                    event.player === context.player &&
                    event.card !== context.source
            },
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}