import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class GarnacLetTheHuntBegin extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'garnac#let-the-hunt-begin-id',
            internalName: 'garnac#let-the-hunt-begin',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While an opponent controls a unique unit, this unit gains ${TextHelper.Hidden}.`,
            condition: (context) => context.player.opponent.hasSomeArenaUnit({ condition: (c) => c.unique }),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Hidden)
        });

        registrar.addWhenAttackEndsAbility({
            title: 'Attack with another unit',
            optional: true,
            initiateAttack: {
                attackerCondition: (card, context) => card !== context.source
            }
        });
    }
}