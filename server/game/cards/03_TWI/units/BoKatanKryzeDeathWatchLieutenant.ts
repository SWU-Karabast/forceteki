import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class BoKatanKryzeDeathWatchLieutenant extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8139901441',
            internalName: 'bokatan-kryze#death-watch-lieutenant'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While you control another Mandalorian unit, this unit gains Overwhelm and Saboteur',
            condition: (context) => context.source.controller.isTraitInPlay(Trait.Mandalorian, context.source),
            ongoingEffect: [
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
            ]
        });

        this.addConstantAbility({
            title: 'While you control another Trooper unit, this unit gets +1/+0',
            condition: (context) => context.source.controller.isTraitInPlay(Trait.Trooper, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });
    }
}
