import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait } from '../../../core/Constants';

export default class ChooseYourPath extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'choose-your-path-id',
            internalName: 'choose-your-path',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose one: If you control a Force Unit, heal 5 damage from your base. If you control a Mandalorian unit, create a Mandalorian token and give an Advantage token to it.',
            immediateEffect: abilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 1,
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
                                abilityHelper.immediateEffects.giveAdvantage((context) => {
                                    console.log(context.events[0]?.generatedTokens?.length); //TODO GET GENERATION EVENT
                                    return ({ target: context.events[1]?.generatedTokens[0] });
                                })
                            ])
                        })
                }
            })
        });
    }
}