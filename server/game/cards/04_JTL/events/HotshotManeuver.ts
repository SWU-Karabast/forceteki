import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class HotshotManeuver extends EventCard {
    protected override getImplementationId () {
        return {
            id: '6544277158',
            internalName: 'hotshot-maneuver',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'For each “On Attack” abilities on a friendly unit, deal 2 damage to a different enemy unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.numberOfTargets(context) > 0,
                    onFalse: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true }),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        name: 'enemyUnits',
                        activePromptTitle: (context) => (this.numberOfTargets(context) === 1 ? 'Choose an enemy unit to deal 2 damage to' : `Choose ${this.numberOfTargets(context)} enemy units to deal 2 damage to`),
                        mode: TargetMode.ExactlyVariable,
                        numCardsFunc: (context) => this.numberOfTargets(context),
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                    })
                })
            },
            then: (thenContext) => ({
                title: `Attack with ${thenContext.target?.title}`,
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    target: thenContext.target
                })
            }),
        });
    }

    private numberOfTargets<T extends Card>(context: AbilityContext<T>): number {
        return Math.min(
            context.player.opponent.getArenaUnits().length,
            context.target.getTriggeredAbilities().reduce((total: number, ability) => total + (ability.isOnAttackAbility ? 1 : 0), 0)
        );
    }
}
