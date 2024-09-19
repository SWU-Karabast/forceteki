import AbilityHelper from '../../AbilityHelper';
import { EventCard } from '../../core/card/EventCard';
import { RelativePlayer } from '../../core/Constants';

export default class TheForceIsWithMe extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7861932582',
            internalName: 'the-force-is-with-me',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give a shield token to a unit',
            targetResolver: {
                controller: RelativePlayer.Any,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.giveExperience({ amount: 2 }),
                ])
            }
        });
    }
}

TheForceIsWithMe.implemented = true;
