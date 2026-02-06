import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, ZoneName } from '../../../core/Constants';

export default class PersecutorFireOverScarif extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5725363168',
            internalName: 'persecutor#fire-over-scarif',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Choose an arena. Deal 3 damage to each unit in that arena.',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                mode: TargetMode.Select,
                activePromptTitle: 'Choose an arena',
                choices: {
                    ['Space']: abilityHelper.immediateEffects.damage((context) => ({
                        target: context.game.getArenaUnits({ arena: ZoneName.SpaceArena }),
                        amount: 3
                    })),
                    ['Ground']: abilityHelper.immediateEffects.damage((context) => ({
                        target: context.game.getArenaUnits({ arena: ZoneName.GroundArena }),
                        amount: 3
                    })),
                    ['Pass']: abilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                }
            }
        });
    }
}