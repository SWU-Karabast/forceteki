import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ObiwanKenobiProtectorOfFelucia extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7680761643',
            internalName: 'obiwan-kenobi#protector-of-felucia',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control 7 or more units, their printed power is considered to be 7 and printed HP is considered to be 7.',
            condition: (context) => context.player.getArenaUnits().length >= 7,
            matchTarget: (card, context) => card !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.overridePrintedAttributes({
                printedPower: 7,
                printedHp: 7
            })
        });
    }
}
