import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, WildcardRelativePlayer } from '../../../core/Constants';

export default class SlyMooreWitnessToPower extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7069246970',
            internalName: 'sly-moore#witness-to-power',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'For this phase, while a base is being attacked by an enemy unit, the attacker gets -2/-0',
            immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.game.getPlayers()
                    .map((player) => player.base),
                ongoingEffectDescription: 'give enemy units -2/-0 while attacking',
                effect: abilityHelper.ongoingEffects.gainAbility({
                    title: 'While a base is being attacked by an enemy unit, the attacker gets -2/-0',
                    type: AbilityType.Constant,
                    targetController: WildcardRelativePlayer.Any,
                    matchTarget: (card, matchContext) =>
                        card.controller !== context.player &&
                        card.isUnit() &&
                        card.isInPlay() &&
                        card.isAttacking() &&
                        card.activeAttack?.getAllTargets().some((card) => card === matchContext.source),
                    ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
                })
            })),
        });
    }
}