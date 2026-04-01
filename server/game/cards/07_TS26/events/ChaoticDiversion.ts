import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { AbilityRestriction, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { Player } from '../../../core/Player';
import { Helpers } from '../../../core/utils/Helpers';

export default class ChaoticDiversion extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'chaotic-diversion-id',
            internalName: 'chaotic-diversion',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Ready an enemy unit. If you do, it can\'t attack your base or units you control for this phase. Give a Shield token to a friendly unit.',
            targetResolvers: {
                enemyUnit: {
                    activePromptTitle: 'Choose an enemy unit to ready. It can\'t attack your base or units you control for this phase.',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.ready(),
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                            ongoingEffectDescription: 'prevent {0} from attacking their base or units they control',
                            effect: AbilityHelper.ongoingEffects.cardCannot({
                                cannot: AbilityRestriction.Attack,
                                restrictedActionCondition: (attackContext, _) =>
                                    this.attackTargetIsBaseOrUnitYouControl(context.player, attackContext)
                            })
                        }))
                    ])
                },
                friendlyUnit: {
                    activePromptTitle: 'Give a Shield token to a friendly unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }
            }
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
}
