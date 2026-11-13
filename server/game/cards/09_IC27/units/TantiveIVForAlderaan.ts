import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TantiveIVForAlderaan extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7886772997',
            internalName: 'tantive-iv#for-alderaan',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Each other friendly ${TextHelper.Trait.Rebel} unit gains ${TextHelper.Raid(2)} and ${TextHelper.Saboteur}`,
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Rebel),
            ongoingEffect: [
                abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 }),
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
            ]
        });
    }
}