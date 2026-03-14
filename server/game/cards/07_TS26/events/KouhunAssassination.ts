import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

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
            // optional: true,
            playerChoosingOptional: RelativePlayer.Opponent,
            immediateEffect: abilityHelper.immediateEffects.discardCardsFromOpponentsHand({ optional: true, amount: 1 }),
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