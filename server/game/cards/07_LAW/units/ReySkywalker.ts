import { NonLeaderUnitCard } from '../../../../../server/game/core/card/NonLeaderUnitCard';
import { AbilityRestriction } from '../../../../../server/game/core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';

export default class ReySkylwaker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4947826569',
            internalName: 'rey#skywalker',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Opponents can\'t take control of this unit',
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeTakenControlOfByOpponents),
        });

        registrar.addReplacementEffectAbility({
            title: 'This unit can\'t be defeated by enemy card abilities',
            when: {
                onCardDefeated: (event, context) =>
                    event.card === context.source &&
                    event.defeatSource.type === DefeatSourceType.Ability &&
                    event.defeatSource.player !== context.player,
            }
        });
    }
}
