import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class ArcanaStarMap extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '2674341776',
            internalName: 'arcana-star-map#path-to-peridea',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addReplacementEffectAbilityTargetingAttached({
            title: 'If you would search a number of cards from your deck, search twice that number of cards instead',
            when: {
                onDeckSearch: (event, context) => event.player === context.source.controller && event.amount > 0,
            },
            replaceWith: (context) => ({
                effect: `search ${context.event.amount * 2} cards instead`,
                replacementImmediateEffect: AbilityHelper.immediateEffects.deckSearch({
                    ...context.event.searchProperties,
                    target: context.player,
                    searchCount: context.event.amount * 2,
                }),
            }),
        });
    }
}
