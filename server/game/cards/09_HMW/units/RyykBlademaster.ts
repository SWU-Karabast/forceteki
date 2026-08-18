import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class RyykBlademaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ryyk-blademaster-id',
            internalName: 'ryyk-blademaster'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control 6 or more resources, this unit gains ${TextHelper.Ambush} and ${TextHelper.Overwhelm}`,
            condition: (context) => context.player.resources.length >= 6,
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: [
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
            ]
        });
    }
}