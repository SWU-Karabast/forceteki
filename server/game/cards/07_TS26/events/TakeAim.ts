import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TakeAim extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6349103776',
            internalName: 'take-aim',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addDecreaseCostAbility({
            title: `This event costs ${TextHelper.resource(1)} less to play for each friendly leader unit`,
            amount: (_, player) => player.getArenaUnits({ condition: (c) => c.isLeaderUnit() }).length,
        });

        registrar.setEventAbility({
            title: 'Attack with a unit. It gets +2/+0 and gains Saboteur for this attack.',
            initiateAttack: {
                attackerLastingEffects: [
                    { effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur) },
                    { effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) },
                ]
            }
        });
    }
}