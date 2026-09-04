import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class L337WereProgrammedToLearn extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'l337#were-programmed-to-learn-id',
            internalName: 'l337#were-programmed-to-learn',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Play that event again from your discard pile for free',
            contextTitle: (context) => `Play ${context.event.card.title} again from your discard pile for free`,
            optional: true,
            limit: AbilityHelper.limit.perPhase(1),
            when: {
                onCardPlayed: (event, context) =>
                    event.card.isEvent() &&
                    event.player === context.player &&
                    event.card.printedCost <= 3
            },
            immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay((context) => ({
                target: context.event.card,
                playAsType: CardType.Event,
                adjustCost: { costAdjustType: CostAdjustType.Free }
            }))
        });
    }
}
