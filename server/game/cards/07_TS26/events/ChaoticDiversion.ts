import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { AbilityRestriction, EventName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { Player } from '../../../core/Player';
import { Helpers } from '../../../core/utils/Helpers';

export default class ChaoticDiversion extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9572287182',
            internalName: 'chaotic-diversion',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Ready an enemy unit. If you do, it can\'t attack your base or units you control for this phase. Give a Shield token to a friendly unit.',
            targetResolvers: {
                enemyUnit: {
                    activePromptTitle: 'Ready an enemy unit. If you do, it can\'t attack your base or units you control for this phase.',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.ready()
                },
                friendlyUnit: {
                    activePromptTitle: 'Give a Shield token to a friendly unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }
            },
            ifYouDo: (ifYouDoContext) => ({
                title: `${ifYouDoContext.targets.enemyUnit?.title} can't attack your base or units you control for this phase.`,
                ifYouDoCondition: () => ifYouDoContext.targets.enemyUnit && this.enemyUnitWasReadied(ifYouDoContext),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    target: ifYouDoContext.targets.enemyUnit,
                    ongoingEffectDescription: 'prevent {0} from attacking their base or units they control',
                    effect: AbilityHelper.ongoingEffects.cardCannot({
                        cannot: AbilityRestriction.Attack,
                        restrictedActionCondition: (attackContext, _) =>
                            this.attackTargetIsBaseOrUnitYouControl(ifYouDoContext.player, attackContext)
                    })
                })
            })
        });
    }

    private attackTargetIsBaseOrUnitYouControl(player: Player, context: AbilityContext): boolean {
        if (context.ability && !context.ability.isAttackAction()) {
            return false;
        }

        const targetsArray = Helpers.asArray(context.target);
        return targetsArray.some((targetCard) => (targetCard.isBase() || targetCard.isUnit()) &&
          targetCard.controller === player);
    }

    private enemyUnitWasReadied(context: AbilityContext): boolean {
        return context.events.some((event) =>
            event.name === EventName.OnCardReadied &&
            event.isResolved
        );
    }
}
