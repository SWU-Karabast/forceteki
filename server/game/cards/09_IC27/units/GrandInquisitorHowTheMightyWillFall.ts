import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class GrandInquisitorHowTheMightyWillFall extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'grand-inquisitor#how-the-mighty-will-fall-id',
            internalName: 'grand-inquisitor#how-the-mighty-will-fall',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While this unit is damaged, he gains ${TextHelper.Raid(3)} and ${TextHelper.Saboteur}`,
            condition: (context) => context.source.damage > 0,
            ongoingEffect: [
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur),
                abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 3 })
            ]
        });
    }
}