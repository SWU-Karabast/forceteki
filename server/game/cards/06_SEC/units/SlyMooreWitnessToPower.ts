import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class SlyMooreWitnessToPower extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7069246970',
            internalName: 'sly-moore#witness-to-power',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'For this phase, each enemy unit gets –2/–0 while it\'s attacking a base',
            immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.player.opponent.getArenaUnits(),
                effect: abilityHelper.ongoingEffects.gainAbility({
                    title: 'Each enemy unit gets -2/-0 while it\'s attacking a base',
                    type: AbilityType.Constant,
                    matchTarget: (card, matchContext) => matchContext.source === card && card.isUnit() && card.isInPlay() && card.isAttacking() && card.activeAttack?.getAllTargets().some((card) => card.isBase()),
                    ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
                })
            })),
        });
    }
}