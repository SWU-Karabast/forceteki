import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer } from '../../../core/Constants';

export default class LandoCalrissianEyesOpen extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2254545413',
            internalName: 'lando-calrissian#eyes-open',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is defending, the attacker gets -1/-0',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isAttacking() && card.activeAttack.getAllTargets().includes(context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: 0 })
        });
    }
}