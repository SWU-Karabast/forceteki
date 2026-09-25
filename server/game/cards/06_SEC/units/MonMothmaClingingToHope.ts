import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { CardRef } from '../../../core/lki/CardRef';
import type { IGameStateGetter } from '../../../core/lki/GameStateGetter';
import type { IThenAbilityPropsWithSystems } from '../../../Interfaces';

export default class MonMothmaClingingToHope extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1347170274',
            internalName: 'mon-mothma#clinging-to-hope',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper, gameState: IGameStateGetter) {
        registrar.addWhenPlayedAbility({
            title: 'Attack with any number of other units, even if those units are exhausted. They can\'t attack bases for these attacks',
            ...this.attackWithUnitAbility([], AbilityHelper, gameState),
        });
    }

    /**
     * `alreadyAttacked` holds references rather than cards, so a unit that left play and came back
     * counts as a different unit and may be chosen again (`SWU 8.5.4`).
     */
    private attackWithUnitAbility(
        alreadyAttacked: readonly CardRef[],
        AbilityHelper: IAbilityHelper,
        gameState: IGameStateGetter
    ): Omit<IThenAbilityPropsWithSystems<TriggeredAbilityContext<NonLeaderUnitCard>>, 'title'> {
        return {
            optional: true,
            targetResolver: {
                activePromptTitle: 'Attack with a unit even if it is exhausted. It can\'t attack bases for this attack',
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source && !alreadyAttacked.includes(gameState.refFor(card)),
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    targetCondition: (card) => !card.isBase(),
                    allowExhaustedAttacker: true,
                })
            },
            ifYouDo: (context) => ({
                title: 'Attack with a unit even if it is exhausted. It can\'t attack bases for this attack',
                ...this.attackWithUnitAbility(
                    [...alreadyAttacked, gameState.refFor(context.target)],
                    AbilityHelper,
                    gameState
                ),
            }),
        };
    }
}