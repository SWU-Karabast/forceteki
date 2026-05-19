import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ChimaeraAFrighteningReality extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'chimaera#a-frightening-reality-id',
            internalName: 'chimaera#a-frightening-reality',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Choose a friendly unit and an enemy non-leader unit. If you do, defeat those units',
            optional: true,
            targetResolvers: {
                friendlyUnits: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                },
                enemyUnits: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    cardCondition: (card) => !card.isLeaderUnit(),
                },
            },
            then: (thenContext) => ({
                title: 'This unit gets +2/+0 for this attack',
                immediateEffect: abilityHelper.immediateEffects.defeat(() => {
                    return { target: [thenContext.targets.friendlyUnits, thenContext.targets.enemyUnits] };
                })
            })
        });

        registrar.addTriggeredAbility({
            title: 'Heal 2 damage from your base',
            when: {
                onCardDefeated: (event, context) => event.card.isUnit() && event.card.controller !== context.player,
            },
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
        });
    }
}