import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class GeneralVeersBlizzardForceCommander extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1557302740',
            internalName: 'general-veers#blizzard-force-commander'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Other friendly Imperial units get +1/+1',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Imperial),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
        });
    }
}
