import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class TheedSecurity extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'theed-security-id',
            internalName: 'theed-security',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an Experience token to a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.opponent.hasSomeArenaUpgrade(),
                    onTrue: abilityHelper.immediateEffects.giveExperience()
                })
            }
        });
    }
}