import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait } from '../../../core/Constants';

export default class ChooseYourPath extends EventCard {
    protected override getImplementationId () {
        return {
            id: '2613847155',
            internalName: 'choose-your-path',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose an effect',
            immediateEffect: abilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 1,
                choices: {
                    ['Heal 5 damage from your base']:
                        abilityHelper.immediateEffects.conditional({
                            condition: (c) => c.player.hasSomeArenaUnit({ trait: Trait.Force }),
                            onTrue: abilityHelper.immediateEffects.heal((context) => ({ amount: 5, target: context.player.base }))
                        }),
                    ['Create a Mandalorian token and give an Advantage token to it']:
                        abilityHelper.immediateEffects.conditional({
                            condition: (c) => c.player.hasSomeArenaUnit({ trait: Trait.Mandalorian }),
                            onTrue: abilityHelper.immediateEffects.createMandalorian({
                                enterPlayEffect: abilityHelper.immediateEffects.giveAdvantage()
                            })
                        })
                }
            })
        });
    }
}
