import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, PhaseName, PlayType, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class UnrefusableOffer extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7270736993',
            internalName: 'unrefusable-offer',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.isLeaderUnit());

        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Bounty,
            ability: {
                title: 'Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it',
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.zone.name === ZoneName.Discard || context.source.zone.name === ZoneName.Capture,
                    onTrue: AbilityHelper.immediateEffects.playCard({
                        entersReady: true,
                        adjustCost: { costAdjustType: CostAdjustType.Free },
                        playType: PlayType.PlayFromOutOfPlay,
                        playAsType: WildcardCardType.Unit,
                        canPlayFromAnyZone: true,
                    })
                }),
                ifYouDo: (ifYouDoContext) => ({
                    title: 'At the start of the regroup phase, defeat it',
                    ifYouDoCondition: (context) => context.source.isInPlay(),
                    immediateEffect: AbilityHelper.immediateEffects.delayedCardEffect({
                        title: `Defeat ${ifYouDoContext.source.title}`,
                        target: ifYouDoContext.source,
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                        },
                        immediateEffect: AbilityHelper.immediateEffects.defeat()
                    })
                })
            }
        });
    }
}
