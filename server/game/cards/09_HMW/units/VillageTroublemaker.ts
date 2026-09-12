import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class VillageTroublemaker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'village-troublemaker-id',
            internalName: 'village-troublemaker'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control an ${TextHelper.Trait.Endor} base, this unit gains ${TextHelper.Hidden} and ${TextHelper.Saboteur}`,
            condition: (c) => c.player.base.hasSomeTrait(Trait.Endor),
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: [
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Hidden),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur),
            ]
        });
    }
}