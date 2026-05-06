import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TakeCharge extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4540524041',
            internalName: 'take-charge',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addDecreaseCostAbility({
            title: `This event costs ${TextHelper.resource(1)} less to play for each friendly leader unit`,
            amount: (_, player) => player.getArenaUnits({ condition: (c) => c.isLeaderUnit() }).length,
        });

        registrar.setEventAbility({
            title: 'Give an Experience token to each of up to 3 units',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}