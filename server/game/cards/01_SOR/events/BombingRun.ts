import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Arena, Location, TargetMode } from '../../../core/Constants';

export default class BombingRun extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7916724925',
            internalName: 'bombing-run',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 3 damage to each unit in an arena',
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: 'Choose an arena',
                choices: {
                    ['Ground']: this.eventEffect(Location.GroundArena),
                    ['Space']: this.eventEffect(Location.SpaceArena),
                }
            }
        });
    }

    private eventEffect(arena: Arena) {
        return AbilityHelper.immediateEffects.conditional((context) => ({
            condition: context.game.getPlayers().some((player) => player.getUnitsInPlay(arena).length > 0),
            onTrue: AbilityHelper.immediateEffects.damage((context) => {
                return {
                    amount: 3,
                    target: context.game.getPlayers().reduce((units, player) => units.concat(player.getUnitsInPlay(arena)), [])
                };
            }),
            onFalse: AbilityHelper.immediateEffects.noAction((context) => {
                return {
                    // If there are no units in play, return no legal target so the card is autoresolved.
                    hasLegalTarget: context.game.getPlayers().some((player) => player.getUnitsInPlay().length > 0)
                };
            })
        }));
    }
}

BombingRun.implemented = true;