import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class EmperorsRoyalGuard extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1780978508',
            internalName: 'emperors-royal-guard'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control an Official unit, this gains Sentinel',
            condition: (context) => context.player.hasSomeArenaUnit({ trait: Trait.Official }),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel })
        });

        registrar.addConstantAbility({
            title: 'While you control Emperor Palpatine (leader or unit), this gets +0/+1',
            condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Emperor Palpatine'),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 1 })
        });
    }
}
