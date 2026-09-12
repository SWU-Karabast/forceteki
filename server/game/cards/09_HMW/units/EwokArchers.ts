import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class EwokArchers extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ewok-archers-id',
            internalName: 'ewok-archers',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control another unit that costs 3 or less, this unit gains ${TextHelper.Ambush}`,
            condition: (context) => context.player.hasSomeArenaUnit({ otherThan: context.source, condition: (card) => card.isUnit() && card.cost <= 3 }),
            matchTarget: (card, context) => card === context.source,
            sourceZoneFilter: WildcardZoneName.Any,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}