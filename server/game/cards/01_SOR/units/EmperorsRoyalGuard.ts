import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class EmperorsRoyalGuard extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1780978508',
            internalName: 'emperors-royal-guard'
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While you control an Official unit, this gains Sentinel',
            condition: (context) => context.source.controller.getUnitsInPlayWithTrait(Trait.Official).length > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel })
        });

        this.addConstantAbility({
            title: 'While you control Emperor Palpatine (leader or unit), this gets +0/+1',
            condition: (context) => context.source.controller.controlsLeaderOrUnitWithTitle('Emperor Palpatine'),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 1 })
        });
    }
}
