import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class JodNaNawoodKeepingSecrets extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'jod-na-nawood#keeping-secrets-id',
            internalName: 'jod-na-nawood#keeping-secrets',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Pay ${TextHelper.resource(4)} to exhaust each unit in an arena`,
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.payResources((context) => ({ amount: 4, target: context.player })),
            ifYouDo: {
                title: 'Exhaust each unit in an arena',
                targetResolver: {
                    mode: TargetMode.Select,
                    activePromptTitle: 'Choose an arena',
                    choices: {
                        ['Space']: abilityHelper.immediateEffects.exhaust((context) => ({
                            target: context.game.getArenaUnits({ arena: ZoneName.SpaceArena })
                        })),
                        ['Ground']: abilityHelper.immediateEffects.exhaust((context) => ({
                            target: context.game.getArenaUnits({ arena: ZoneName.GroundArena })
                        }))
                    }
                }
            }
        });
    }
}