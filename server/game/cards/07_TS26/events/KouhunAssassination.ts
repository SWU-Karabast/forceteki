import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class KouhunAssassination extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6353405903',
            internalName: 'kouhun-assassination',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Your opponent may discard a card from their hand. If they do, give a non-Vehicle unit -8/-8 for this phase',
            contextTitle: (context) => `${context.player.opponent.name} discards a card from hand. If they do, ${context.player.name} give a non-Vehicle unit -8/-8 for this phase`,
            immediateEffect: abilityHelper.immediateEffects.discardCardsFromOpponentsHand({ amount: 1, optional: true }),
            ifYouDo: {
                title: 'Give a non-Vehicle unit –8/–8 for this phase',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle),
                    immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: abilityHelper.ongoingEffects.modifyStats({ power: -8, hp: -8 })
                    })
                }
            }
        });
    }
}