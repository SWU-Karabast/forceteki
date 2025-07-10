import AbilityHelper from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class KyloRenRashAndDeadly extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1480894253',
            internalName: 'kylo-ren#rash-and-deadly'
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Discard a card from your hand, give a unit +2/+0 for this phase',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.discardCardFromOwnHand(),
            ],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: WildcardRelativePlayer.Any,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'This unit gets -1/-0 for each card in your hand.',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target, context) => {
                const powerDiff = -1 * context.player.hand.length;
                return { power: powerDiff, hp: 0 };
            })
        });
    }
}
