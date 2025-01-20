import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer } from '../../../core/Constants';

export default class RogerRoger extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1555775184',
            internalName: 'roger-roger',
        };
    }

    protected override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Attach to a friendly Battle Droid token',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isTokenUnit() && card.title === 'Battle Droid',
                immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                    upgrade: this,
                    target: context.target,
                }))
            }
        });
    }
}

RogerRoger.implemented = true;
