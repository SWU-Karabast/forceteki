import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class VelSarthaOnePathOneChoice extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'vel-sartha#one-path-one-choice-id',
            internalName: 'vel-sartha#one-path-one-choice',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each exhausted enemy unit gets -2/-0 while defending',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card) => card.isUnit() && card.isInPlay() && card.exhausted && card.isDefending(),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
        });
    }
}
