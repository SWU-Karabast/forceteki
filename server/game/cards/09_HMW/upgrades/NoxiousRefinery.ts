import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Aspect, PhaseName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class NoxiousRefinery extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'noxious-refinery-id',
            internalName: 'noxious-refinery',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainTriggeredAbilityTargetingAttached({
            title: `Reveal the top card of your deck. If it's ${TextHelper.Aggression}, deal 1 damage to an enemy unit`,
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            gainCondition: (context) => context.source.parentCard?.isBase(),
            immediateEffect: abilityHelper.immediateEffects.reveal((context) => ({
                target: context.player.getTopCardOfDeck(),
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal 1 damage to an enemy unit',
                ifYouDoCondition: () => ifYouDoContext.events[0].cards[0]?.hasSomeAspect(Aspect.Aggression),
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
                }
            })
        });
    }
}
