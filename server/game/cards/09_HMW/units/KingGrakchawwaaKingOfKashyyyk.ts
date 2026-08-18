import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class KingGrakchawwaaKingOfKashyyyk extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'king-grakchawwaa#king-of-kashyyyk-id',
            internalName: 'king-grakchawwaa#king-of-kashyyyk',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `For each other friendly ${TextHelper.Trait.Wookiee} unit, resource the top card of your deck. Ready each card resourced this way`,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    context.player.drawDeck.length > 0 &&
                    context.player.getArenaUnits({ otherThan: context.source, trait: Trait.Wookiee }).length > 0,
                onTrue: abilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.getTopCardsOfDeck(Math.min(context.player.drawDeck.length, context.player.getArenaUnits({
                        otherThan: context.source,
                        trait: Trait.Wookiee
                    }).length)),
                    readyResource: true,
                }))
            })
        });
    }
}