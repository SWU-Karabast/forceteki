import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class BoKatanKryzeDeathWatchLieutenant extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8139901441',
            internalName: 'bokatan-kryze#death-watch-lieutenant'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control another ${TextHelper.Trait.Mandalorian} unit, this unit gains ${TextHelper.Overwhelm} and ${TextHelper.Saboteur}`,
            condition: (context) => context.player.isTraitInPlay(Trait.Mandalorian, context.source),
            ongoingEffect: [
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
            ]
        });

        registrar.addConstantAbility({
            title: `While you control another ${TextHelper.Trait.Trooper} unit, this unit gets +1/+0`,
            condition: (context) => context.player.isTraitInPlay(Trait.Trooper, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });
    }
}
