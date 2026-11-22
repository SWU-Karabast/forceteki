import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class MarrokMysteriousWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3039970869',
            internalName: 'marrok#mysterious-warrior',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Loses ${TextHelper.Sentinel} and gains ${TextHelper.Saboteur} while upgraded`,
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: [
                AbilityHelper.ongoingEffects.loseKeyword(KeywordName.Sentinel),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur),
            ]
        });
    }
}