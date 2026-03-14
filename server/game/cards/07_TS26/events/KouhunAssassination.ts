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
            optional: true,
            contextTitle: (context) => `${context.player.opponent.name} discards a card from hand. If he does, ${context.player.name} give a non-Vehicle unit -8/-8 for this phase`,
            playerChoosingOptional: RelativePlayer.Opponent,
            // VBL 2026-03-14: add isCost here to not trigger if player has empty hand
            immediateEffect: abilityHelper.immediateEffects.discardCardsFromOpponentsHand({ amount: 1, isCost: true }),
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