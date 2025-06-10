import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, CardType, PhaseName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ReyWithPalpatinesPower extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6172986745',
            internalName: 'rey#with-palpatines-power',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Reveal Rey to deal 2 damage to a unit and 2 damage to a base.',
            optional: true,
            when: {
                onCardsDrawn: (event, context) => event.player === context.player && context.game.currentPhase === PhaseName.Action && event.cards.includes(context.source)
            },
            zoneFilter: ZoneName.Hand,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.base.aspects.concat(context.player.leader.aspects).includes(Aspect.Aggression) && context.source.zoneName === ZoneName.Hand,
                onTrue: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.reveal((context) => ({ promptedPlayer: RelativePlayer.Opponent,
                        useDisplayPrompt: true,
                        target: context.source })),
                    AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.selectCard({
                            cardTypeFilter: WildcardCardType.Unit,
                            innerSystem: AbilityHelper.immediateEffects.damage({ amount: 2 })
                        }),
                        AbilityHelper.immediateEffects.selectCard({
                            cardTypeFilter: CardType.Base,
                            innerSystem: AbilityHelper.immediateEffects.damage({ amount: 2 })
                        })
                    ])
                ])
            })
        });
    }
}