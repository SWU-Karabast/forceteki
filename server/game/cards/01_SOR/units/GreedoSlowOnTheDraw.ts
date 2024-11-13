import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Location } from '../../../core/Constants';

export default class GreedoSlowOnTheDraw extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0949648290',
            internalName: 'greedo#slow-on-the-draw'
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Discard a card from your deck. If it\'s not a unit, deal 2 damage to a ground unit.',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                    amount: 1,
                    target: context.source.controller
                })),
                AbilityHelper.immediateEffects.conditional((context) => ({
                    // There will be one event for the discard system overall plus one per card, so we need to ensure at least two exist
                    condition: context.events.length < 2 ? false : !context.events[0].card.isUnit(),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        locationFilter: Location.GroundArena,
                        innerSystem: AbilityHelper.immediateEffects.damage({ amount: 2 })
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }))
            ])
        });
    }
}

GreedoSlowOnTheDraw.implemented = true;
