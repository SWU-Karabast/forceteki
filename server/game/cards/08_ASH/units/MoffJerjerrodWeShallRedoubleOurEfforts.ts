import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { TokenName } from '../../../core/Constants';
import { TokenCardName, TokenUnitName, TokenUpgradeName } from '../../../core/Constants';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';
import { Contract } from '../../../core/utils/Contract';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class MoffJerjerrodWeShallRedoubleOurEfforts extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'moff-jerjerrod#we-shall-redouble-our-efforts-id',
            internalName: 'moff-jerjerrod#we-shall-redouble-our-efforts',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addReplacementEffectAbility({
            title: 'Defeat this unit to create twice the number of tokens instead',
            contextTitle: (context) => {
                const { tokenType, amount } = context.event;

                Contract.assertNotNullLike(tokenType, 'Expected tokenType to be defined on context.event for replacement effect ability');
                Contract.assertNotNullLike(amount, 'Expected amount to be defined on context.event for replacement effect ability');

                return `Defeat ${context.source.title} to create ${amount * 2} ${EnumHelpers.tokenTitle[tokenType]} tokens instead`;
            },
            optional: true,
            when: {
                onTokensCreated: (event, context) =>
                    // Force token can't be doubled, so don't even trigger the ability
                    event.tokenType !== TokenCardName.Force &&
                    event.player === context.player
            },
            // Replacement only happens if Jerjerrod is defeated
            onlyIfYouDoEffect: AbilityHelper.immediateEffects.defeat(),
            replaceWith: (context) => ({
                replacementImmediateEffect: this.buildAdditionalTokenSystem(context, AbilityHelper),
                effect: `create ${context.event.amount * 2} ${EnumHelpers.tokenTitle[context.event.tokenType]} tokens instead`
            }),
        });
    }

    private buildAdditionalTokenSystem(
        context: TriggeredAbilityContext<NonLeaderUnitCard>,
        AbilityHelper: IAbilityHelper
    ): GameSystem<TriggeredAbilityContext<NonLeaderUnitCard>> {
        const { tokenType, amount, player, card } = context.event;
        const doubledAmount = amount * 2;
        const tokenUnitProperties = { amount: doubledAmount, target: player, entersReady: context.event.entersReady };

        const systemForToken: Record<TokenName, GameSystem<TriggeredAbilityContext<NonLeaderUnitCard>>> = {
            // Units
            [TokenUnitName.BattleDroid]: AbilityHelper.immediateEffects.createBattleDroid(tokenUnitProperties),
            [TokenUnitName.CloneTrooper]: AbilityHelper.immediateEffects.createCloneTrooper(tokenUnitProperties),
            [TokenUnitName.XWing]: AbilityHelper.immediateEffects.createXWing(tokenUnitProperties),
            [TokenUnitName.TIEFighter]: AbilityHelper.immediateEffects.createTieFighter(tokenUnitProperties),
            [TokenUnitName.Spy]: AbilityHelper.immediateEffects.createSpy(tokenUnitProperties),
            [TokenUnitName.Mandalorian]: AbilityHelper.immediateEffects.createMandalorian(tokenUnitProperties),
            // Upgrades
            [TokenUpgradeName.Shield]: AbilityHelper.immediateEffects.giveShield({ amount: doubledAmount, target: card }),
            [TokenUpgradeName.Experience]: AbilityHelper.immediateEffects.giveExperience({ amount: doubledAmount, target: card }),
            [TokenUpgradeName.Advantage]: AbilityHelper.immediateEffects.giveAdvantage({ amount: doubledAmount, target: card }),
            // Miscellaneous
            [TokenCardName.Credit]: AbilityHelper.immediateEffects.createCreditToken({ amount: doubledAmount, target: player }),
            [TokenCardName.Force]: AbilityHelper.immediateEffects.theForceIsWithYou({ target: player }),
        };

        Contract.assertHasKey(systemForToken, tokenType, `Unexpected token type ${tokenType}`);

        return systemForToken[tokenType];
    }
}
