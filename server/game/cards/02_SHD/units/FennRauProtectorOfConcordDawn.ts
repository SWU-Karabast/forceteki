import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class FennRauProtectorOfConcordDawn extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3399023235',
            internalName: 'fenn-rau#protector-of-concord-dawn'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Play an upgrade from your hand. It costs 2 less',
            optional: true,
            targetResolver: {
                mode: TargetMode.Single,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 2 },
                    playAsType: WildcardCardType.Upgrade,
                })
            }
        });

        registrar.addTriggeredAbility({
            title: 'Give an enemy unit -2/-2 for this phase.',
            when: {
                onCardPlayed: (event, context) => event.attachTarget === context.source && event.card.isUpgrade()
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 }),
                })
            }
        });
    }
}
