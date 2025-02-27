import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

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
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.player
            })),
            ifYouDo: (context) => ({
                title: 'Deal 2 damage to a ground unit',
                ifYouDoCondition: () => !context.events[0].card.isUnit(),
                targetResolver: {
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }
            })
        });
    }
}
