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
                target: context.source.controller
            })),
            ifYouDo: (context) => ({
                title: 'Deal 2 damage to a ground unit',
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: !context.events[0].card.isUnit(),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        zoneFilter: ZoneName.GroundArena,
                        innerSystem: AbilityHelper.immediateEffects.damage({ amount: 2 })
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            })
        });
    }
}

GreedoSlowOnTheDraw.implemented = true;
