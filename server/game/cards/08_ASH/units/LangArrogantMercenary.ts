import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class LangArrogantMercenary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2673831534',
            internalName: 'lang#arrogant-mercenary',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Deal damage equal to this unit\'s power to a ground unit',
            cost: [abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                activePromptTitle: (context) => `Deal ${context.source.getPower()} damage to a ground unit`,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                    amount: context.source.getPower(),
                }))
            }
        });
    }
}