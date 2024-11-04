import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Location, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import { Card } from '../../../core/card/Card';

export default class VambraceFlamethrower extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6471336466',
            internalName: 'vambrace-flamethrower',
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        this.addGainOnAttackAbilityTargetingAttached({
            title: 'Deal 3 damage divided as you choose among enemy ground units',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.distributeDamageAmong({
                amountToDistribute: 3,
                canChooseNoTargets: false,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                locationFilter: Location.GroundArena,
            })
        });
    }
}

VambraceFlamethrower.implemented = true;
