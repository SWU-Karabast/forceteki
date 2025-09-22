import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { AbilityType } from '../../../core/Constants';
import { DamageSourceType, DefeatSourceType } from '../../../IDamageOrDefeatSource';

export default class LurkingTIEPhantom extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1810342362',
            internalName: 'lurking-tie-phantom',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addReplacementEffectAbility({
            title: 'This unit can\'t be captured, damaged, or defeated by enemy card abilities',
            when: {
                onCardCaptured: (event, context) =>
                    event.card === context.source &&
                    event.context.player !== context.player,
                onCardDefeated: (event, context) =>
                    event.card === context.source &&
                    event.defeatSource.type === DefeatSourceType.Ability &&
                    event.defeatSource.player !== context.player,
            }
        });

        registrar.addConstantAbility({
            title: 'This unit can\'t be captured, damaged, or defeated by enemy card abilities',
            ongoingEffect: AbilityHelper.ongoingEffects.gainAbility({
                title: 'Prevent all damage that would be dealt to it by enemy card abilities',
                type: AbilityType.ReplacementEffect,
                when: { onDamageDealt: (event, context) =>
                    event.card === context.source &&
                    !event.isIndirect && event.damageSource.type !== DamageSourceType.Attack && event.damageSource.player !== context.source.controller }
            })
        });
    }
}
