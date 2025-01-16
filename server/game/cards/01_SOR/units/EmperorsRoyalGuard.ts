import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait, WildcardZoneName } from '../../../core/Constants';

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
            condition: (context) => context.source.controller.getOtherUnitsInPlayWithTrait(context.source, Trait.Official).length > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel })
        });

        this.addConstantAbility({
            title: 'While you control Emperor Palpatine (leader or unit), this gets +0/+1',
            condition: (context) => context.source.controller.leader.title === 'Emperor Palpatine' || context.source.controller.getUnitsInPlay(WildcardZoneName.AnyArena, (card) => card.title === 'Emperor Palpatine').length > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 1 })
        });
    }
}

EmperorsRoyalGuard.implemented = true;