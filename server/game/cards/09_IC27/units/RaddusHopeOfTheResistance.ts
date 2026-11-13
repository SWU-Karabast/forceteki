import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class RaddusHopeOfTheResistance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3727912584',
            internalName: 'raddus#hope-of-the-resistance',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While this unit is exhausted, cards your opponents play cost ${TextHelper.resource(3)} more`,
            condition: (context) => context.source.exhausted,
            targetController: RelativePlayer.Opponent,
            ongoingEffect: AbilityHelper.ongoingEffects.increaseCost({
                amount: 3
            })
        });
    }
}
