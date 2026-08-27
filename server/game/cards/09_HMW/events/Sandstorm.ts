import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode, Trait, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Sandstorm extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'sandstorm-id',
            internalName: 'sandstorm',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: `While you control a ${TextHelper.Trait.Tatooine} base, this event costs ${TextHelper.resource(1)} less to play`,
            condition: (context) => context.player.base.hasSomeTrait(Trait.Tatooine),
            amount: 1
        });

        registrar.setEventAbility({
            title: 'Choose an arena. Give a Weakness token to each exhausted enemy unit in that arena',
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: 'Choose an arena',
                choices: {
                    ['Space']: abilityHelper.immediateEffects.giveWeakness((context) => ({
                        target: context.player.opponent.getArenaUnits({ arena: ZoneName.SpaceArena, condition: (c) => c.canBeExhausted() && c.exhausted })
                    })),
                    ['Ground']: abilityHelper.immediateEffects.giveWeakness((context) => ({
                        target: context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena, condition: (c) => c.canBeExhausted() && c.exhausted })
                    }))
                }
            }
        });
    }
}
