import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { AbilityRestriction } from '../../../core/Constants';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';

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

        // TODO: Update damage prevention using replacement effects
        registrar.addConstantAbility({
            title: 'This unit can\'t be captured, damaged, or defeated by enemy card abilities',
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot({
                cannot: AbilityRestriction.ReceiveDamage,
                restrictedActionCondition: (context, source) => !context.ability.isAttackAction() && context.ability.controller !== source.controller,
            })
        });
    }
}
