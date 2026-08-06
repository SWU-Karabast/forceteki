import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class WarriorOfClanKryze extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7767602903',
            internalName: 'warrior-of-clan-kryze'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control another exhausted unit, this unit gains ${TextHelper.Sentinel}`,
            condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card !== context.source && card.canBeExhausted() && card.exhausted }),
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}