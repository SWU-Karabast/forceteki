import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class SavageOpressYouMustHaveYourRevenge extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4061486636',
            internalName: 'savage-opress#you-must-have-your-revenge',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly unit with the most power among friendly units gains Overwhelm',
            matchTarget: (card, context) => {
                return card.isUnit() && card.getPower() === context.player.getArenaUnits().map((x) => x.getPower())
                    .reduce((p, c) => (p > c ? p : c), 0);
            },
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Overwhelm })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each other friendly unit gains Overwhelm',
            matchTarget: (card, context) => card.isUnit() && card.controller === context.player && card !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Overwhelm })
        });
    }
}
