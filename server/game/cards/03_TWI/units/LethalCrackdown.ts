import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { CardType, RelativePlayer, WildcardRelativePlayer } from '../../../core/Constants';

export default class LethalCrackdown extends EventCard {
    protected override getImplementationId () {
        return {
            id: '1389085256',
            internalName: 'lethal-crackdown'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat a non-leader unit. Deal damage to your base equal to that unit\'s power.',
            targetResolver: {
                cardTypeFilter: CardType.BasicUnit,
                controller: WildcardRelativePlayer.Any,
                choosingPlayer: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.handler((context) => ({
                        handler: () => context.targets.powerParentCard = context.target.getPower(),
                    })),
                    AbilityHelper.immediateEffects.defeat()
                ]),

            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal damage to your base equal to the played unit\'s cost',
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    target: ifYouDoContext.source.controller.base,
                    amount: ifYouDoContext.targets.powerParentCard
                })
            })
        });
    }
}

LethalCrackdown.implemented = true;