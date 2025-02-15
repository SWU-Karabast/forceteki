import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';
import { WildcardCardType } from '../../../core/Constants';

export default class DetentionBlockRescue extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8576088385',
            internalName: 'detention-block-rescue',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 2 damage to a unit or base',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => (context.target as IUnitCard).capturedUnits.length > 0,
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 6 }),
                    onFalse: AbilityHelper.immediateEffects.damage({ amount: 3 })
                })
            }
        });
    }
}
