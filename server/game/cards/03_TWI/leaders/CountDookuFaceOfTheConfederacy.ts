import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class CountDookuFaceOfTheConfederacy extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5683908835',
            internalName: 'count-dooku#face-of-the-confederacy',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Play a Separatist card from your hand. It gains Exploit 1.',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => card.hasSomeTrait(Trait.Separatist),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    exploitValue: 1,
                    playAsType: WildcardCardType.Any,
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'The next Separatist card you play this phase gains Exploit 3',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: AbilityHelper.ongoingEffects.addExploit({
                    match: (card) => card.hasSomeTrait(Trait.Separatist),
                    limit: AbilityHelper.limit.perPlayerPerGame(1),
                    exploitKeywordAmount: 3
                })
            })
        });
    }
}
