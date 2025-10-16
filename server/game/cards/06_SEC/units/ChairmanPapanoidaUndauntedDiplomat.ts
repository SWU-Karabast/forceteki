import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, PhaseName } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class ChairmanPapanoidaUndauntedDiplomat extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0400955141',
            internalName: 'chairman-papanoida#undaunted-diplomat',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Aggression, Aspect.Aggression];
        registrar.addTriggeredAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects)}. If you do, create a Spy token`,
            collectiveTrigger: true,
            when: {
                onCardsDrawn: (event, context) => event.player === context.player.opponent && context.game.currentPhase === PhaseName.Action || event.player === context.player && context.game.currentPhase === PhaseName.Action,
            },
            immediateEffect: AbilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Create a Spy token',
                immediateEffect: AbilityHelper.immediateEffects.createSpy(),
            }
        });
    }
}