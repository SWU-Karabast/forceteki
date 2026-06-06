import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode, Trait } from '../../../core/Constants';

export default class ChooseYourPath extends EventCard {
    protected override getImplementationId () {
        return {
            id: '2613847155',
            internalName: 'choose-your-path',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose one: If you control a Force Unit, heal 5 damage from your base. If you control a Mandalorian unit, create a Mandalorian token and give an Advantage token to it.',
            // TODO investigate why sequential doesn't work with chooseModalEffect in this case
            targetResolver: {
                mode: TargetMode.Select,
                showUnresolvable: true,
                choices: {
                    ['If you control a Force unit, heal 5 damage from your base']:
                        abilityHelper.immediateEffects.conditional({
                            condition: (c) => c.player.hasSomeArenaUnit({ trait: Trait.Force }),
                            onTrue: abilityHelper.immediateEffects.heal((context) => ({ amount: 5, target: context.player.base }))
                        }),
                    ['If you control a Mandalorian unit, create a Mandalorian token and give an Advantage token to it']:
                        abilityHelper.immediateEffects.conditional({
                            condition: (c) => c.player.hasSomeArenaUnit({ trait: Trait.Mandalorian }),
                            onTrue: abilityHelper.immediateEffects.sequential([
                                abilityHelper.immediateEffects.createMandalorian(),
                                abilityHelper.immediateEffects.giveAdvantage((context) => ({ target: context.events[0]?.generatedTokens[0] }))
                            ])
                        })
                }
            }
        });
    }
}