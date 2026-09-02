import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class NightbrotherMaulsGauntlet extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'nightbrother#mauls-gauntlet-id',
            internalName: 'nightbrother#mauls-gauntlet',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Play a unit from your discard pile. It costs ${TextHelper.resource(3)} less and enters play ready`,
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.playCardFromOutOfPlay({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 3 },
                    playAsType: WildcardCardType.Unit,
                    entersReady: true,
                })
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'At the start of the next regroup phase, defeat it',
                immediateEffect: abilityHelper.immediateEffects.delayedCardEffect({
                    title: 'Defeat it',
                    target: ifYouDoContext.events[0].card,
                    when: {
                        onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                    },
                    immediateEffect: abilityHelper.immediateEffects.defeat()
                })
            })
        });
    }
}