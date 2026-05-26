import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { TokenName } from '../../../core/Constants';
import { TokenCardName, TokenUnitName, TokenUpgradeName } from '../../../core/Constants';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';
import type { IPlayerTargetSystemProperties } from '../../../core/gameSystem/PlayerTargetSystem';
import { Contract } from '../../../core/utils/Contract';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';
import type { ICreateTokenUnitRequiredProperties } from '../../../gameSystems/CreateTokenUnitSystem';

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
                replacementImmediateEffect: this.buildDoubledTokenSystem(context, AbilityHelper),
                effect: `create ${context.event.amount * 2} ${EnumHelpers.tokenTitle[context.event.tokenType]} tokens instead`
            }),
        });
    }

    private buildDoubledTokenSystem(
        context: TriggeredAbilityContext<NonLeaderUnitCard>,
        AbilityHelper: IAbilityHelper
    ): GameSystem<TriggeredAbilityContext<NonLeaderUnitCard>> {
        const { tokenType, amount, player, card } = context.event;
        const doubledUnitTokenProperties: ICreateTokenUnitRequiredProperties & Pick<IPlayerTargetSystemProperties, 'target'> = {
            amount: amount * 2,
            entersReady: context.event.entersReady,
            target: player
        };

        const systemForToken: Record<TokenName, GameSystem<TriggeredAbilityContext<NonLeaderUnitCard>>> = {
            // Units
            [TokenUnitName.BattleDroid]: AbilityHelper.immediateEffects.createBattleDroid(doubledUnitTokenProperties),
            [TokenUnitName.CloneTrooper]: AbilityHelper.immediateEffects.createCloneTrooper(doubledUnitTokenProperties),
            [TokenUnitName.XWing]: AbilityHelper.immediateEffects.createXWing(doubledUnitTokenProperties),
            [TokenUnitName.TIEFighter]: AbilityHelper.immediateEffects.createTieFighter(doubledUnitTokenProperties),
            [TokenUnitName.Spy]: AbilityHelper.immediateEffects.createSpy(doubledUnitTokenProperties),
            [TokenUnitName.Mandalorian]: AbilityHelper.immediateEffects.createMandalorian(doubledUnitTokenProperties),
            // Upgrades
            [TokenUpgradeName.Shield]: AbilityHelper.immediateEffects.giveShield({ amount: amount * 2, target: card }),
            [TokenUpgradeName.Experience]: AbilityHelper.immediateEffects.giveExperience({ amount: amount * 2, target: card }),
            [TokenUpgradeName.Advantage]: AbilityHelper.immediateEffects.giveAdvantage({ amount: amount * 2, target: card }),
            // Miscellaneous
            [TokenCardName.Credit]: AbilityHelper.immediateEffects.createCreditToken({ amount: amount * 2, target: player }),
            [TokenCardName.Force]: AbilityHelper.immediateEffects.theForceIsWithYou({ target: player }),
        };

        Contract.assertHasKey(systemForToken, tokenType, `Unexpected token type ${tokenType}`);

        return systemForToken[tokenType];
    }
}
