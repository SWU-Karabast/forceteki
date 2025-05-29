import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class DarthSidiousThePhantomMenace extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6797297267',
            internalName: 'darth-sidious#the-phantom-menace'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Use The Force to defeat each non-Sith unit with 3 or less remaining HP',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Defeat each non-Sith unit with 3 or less remaining HP',
                immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({
                    target: context.game.getArenaUnits({
                        condition: (card) => card.isUnit() &&
                          !card.hasSomeTrait(Trait.Sith) &&
                          card.remainingHp <= 3
                    })
                }))
            }
        });
    }
}