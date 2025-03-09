import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class TheGhostHeartOfTheFamily extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5763330426',
            internalName: 'the-ghost#heart-of-the-family',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'Each other friendly Spectre unit gains this unit\'s Keywords',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            matchTarget: (card, context) => card.hasSomeTrait(Trait.Spectre) && card !== context.source,
            ongoingEffect: 
        });
    }
}
