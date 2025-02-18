import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class ObiWanKenobiFollowingFate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4786320542',
            internalName: 'obiwan-kenobi#following-fate'
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Give 2 Experience tokens to another friendly unit. If it\'s a Force unit, draw a card.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.giveExperience({ amount: 2 }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.target.hasSomeTrait(Trait.Force),
                        onTrue: AbilityHelper.immediateEffects.draw((context) => ({
                            target: context.player
                        })),
                    })])
            }
        });
    }
}
