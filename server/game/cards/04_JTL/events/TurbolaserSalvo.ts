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
            condition: context.player.hasSomeArenaUnit({ arena: ZoneName.SpaceArena }),
            onTrue: AbilityHelper.immediateEffects.selectCard({
                activePromptTitle: `Select a friendly space unit to deal damage to each enemy unit in ${arena}`, // TODO: Better chat message
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.SpaceArena,
                cardTypeFilter: WildcardCardType.Unit,
                name: 'friendlySpaceUnitDamageSource',
                innerSystem: AbilityHelper.immediateEffects.damage((damageContext) => {
                    return {
                        amount: damageContext.targets.friendlySpaceUnitDamageSource?.[0].getPower(),
                        target: damageContext.player.opponent.getArenaUnits({ arena: arena }),
                        source: damageContext.targets.friendlySpaceUnitDamageSource?.[0]
                    };
                })
            }),
        }));
    }
}
