import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { Arena } from '../../../core/Constants';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class TurbolaserSalvo extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8174214418',
            internalName: 'turbolaser-salvo',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose an arena',
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: 'Choose an arena',
                choices: {
                    ['Ground']: this.eventEffect(ZoneName.GroundArena),
                    ['Space']: this.eventEffect(ZoneName.SpaceArena),
                }
            }
        });
    }

    private eventEffect(arena: Arena) {
        return AbilityHelper.immediateEffects.conditional((context) => ({
            condition: context.player.opponent.getUnitsInPlay(arena).length > 0,
            onTrue: AbilityHelper.immediateEffects.selectCard({
                activePromptTitle: 'Select a friendly space unit to deal damage to each enemy unit in ',
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.SpaceArena,
                cardTypeFilter: WildcardCardType.Unit,
                innerSystem: AbilityHelper.immediateEffects.damage((damageContext) => {
                    return {
                        amount: 1,
                        target: damageContext.player.opponent.getUnitsInPlay(arena)
                    };
                })
            }),
            onFalse: AbilityHelper.immediateEffects.noAction((context) => {
                return {
                    // If there are no units in play, return no legal target so the card is autoresolved.
                    hasLegalTarget: context.player.opponent.getUnitsInPlay(arena).length > 0
                };
            })
        }));
    }
}
