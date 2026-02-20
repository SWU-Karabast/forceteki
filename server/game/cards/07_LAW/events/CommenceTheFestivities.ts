import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { KeywordName } from '../../../core/Constants';

export default class CommenceTheFestivities extends EventCard {
    protected override getImplementationId () {
        return {
            id: '6225072830',
            internalName: 'commence-the-festivities',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. It gains Saboteur for this attack. If you control fewer resources than an opponent, it gets +2/+0 for this attack.',
            initiateAttack: {
                attackerLastingEffects: [
                    { effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur) },
                    {
                        condition: (_, context) => context.player.resources.length < context.player.opponent.resources.length,
                        effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    },
                ],
            }
        });
    }
}