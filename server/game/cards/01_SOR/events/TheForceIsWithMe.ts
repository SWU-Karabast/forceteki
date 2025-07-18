import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class TheForceIsWithMe extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7861932582',
            internalName: 'the-force-is-with-me',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give 2 Experience, a Shield if you control a Force unit, and optionally attack',
            targetResolver: {
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.giveExperience({ amount: 2 }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.player.isTraitInPlay(Trait.Force),
                        onTrue: AbilityHelper.immediateEffects.giveShield({ amount: 1 }),
                    }),
                    AbilityHelper.immediateEffects.attack({ optional: true })
                ])
            }
        });
    }
}
