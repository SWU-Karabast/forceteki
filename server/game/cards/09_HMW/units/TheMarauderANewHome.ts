import type { PlayCardAction } from '../../../core/ability/PlayCardAction';
import type { IPlayCardActionOverrides } from '../../../core/card/baseClasses/PlayableOrDeployableCard';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PlayType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { DamageUnitsCostAdjuster } from '../../../core/cost/DamageUnitsCostAdjuster';
import { Helpers } from '../../../core/utils/Helpers';

export default class TheMarauderANewHome extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-marauder#a-new-home-id',
            internalName: 'the-marauder#a-new-home',
        };
    }

    /**
     * "While playing this unit, you may choose any number of friendly units. Deal 1 damage to each of
     * them. For each unit chosen this way, this unit costs 1 less." This is a cost adjustment rather
     * than an ability, so it is attached to the play action the same way Exploit is.
     */
    protected override buildPlayCardActions(playType: PlayType = PlayType.PlayFromHand, propertyOverrides: IPlayCardActionOverrides = null): PlayCardAction[] {
        const damageUnitsAdjuster = new DamageUnitsCostAdjuster(this.game, this, { costAdjustType: CostAdjustType.DamageUnits });

        return super.buildPlayCardActions(playType, {
            ...propertyOverrides,
            costAdjusters: [...Helpers.asArray(propertyOverrides?.costAdjusters ?? []), damageUnitsAdjuster],
        });
    }
}
