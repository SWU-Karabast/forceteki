import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class ScarifLieutenant extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7681849188',
            internalName: 'scarif-lieutenant',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Give an Experience token to a friendly Rebel unit.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait([Trait.Rebel]),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}