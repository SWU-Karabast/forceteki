import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class OldAccessCodes extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '3840495762',
            internalName: 'old-access-codes',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.controller.getUnitsInPlay().length < context.player.opponent.getUnitsInPlay().length,
                onTrue: AbilityHelper.immediateEffects.draw(),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}

OldAccessCodes.implemented = true;
