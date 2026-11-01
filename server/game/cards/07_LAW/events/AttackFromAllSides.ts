import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';
import { Helpers } from '../../../core/utils/Helpers';

export default class AttackFromAllSides extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4615709188',
            internalName: 'attack-from-all-sides',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 3 damage to a unit. If there are 4 or more different aspects among friendly units, you may deal 5 damage to that unit instead.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => Helpers.countUniqueAspects(context.source.controller.getArenaUnits()) >= 4,
                    onTrue: AbilityHelper.immediateEffects.selectChoice({
                        choices: {
                            ['Deal 5 damage']: AbilityHelper.immediateEffects.damage({ amount: 5 }),
                            ['Deal 3 damage']: AbilityHelper.immediateEffects.damage({ amount: 3 }),
                        },
                    }),
                    onFalse: AbilityHelper.immediateEffects.damage({ amount: 3 })
                })
            }
        });
    }
}