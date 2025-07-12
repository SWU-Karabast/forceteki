import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class SabineWrenExplosivesArtist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3646264648',
            internalName: 'sabine-wren#explosives-artist',
        };
    }

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Cannot be attacked if friendly units have at least 3 unique aspects',
            condition: (context) => Helpers.countUniqueAspects(context.source.controller.getArenaUnits({ otherThan: context.source })) >= 3,
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
        });

        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to the defender or a base',
            targetResolver: {
                cardCondition: (card, context) => card.isBase() || context.event.attack.getAllTargets().includes(card),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}
