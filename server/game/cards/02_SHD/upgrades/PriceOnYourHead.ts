import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class PriceOnYourHead extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2178538979',
            internalName: 'price-on-your-head',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Bounty,
            ability: {
                title: 'Put the top card of your deck into play as a resource',
                immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.player.getTopCardOfDeck() }))
            }
        });
    }
}
