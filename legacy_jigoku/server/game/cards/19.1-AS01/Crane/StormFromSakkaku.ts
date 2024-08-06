import { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { EventNames, AbilityTypes, Locations, CardTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import { EventRegistrar } from '../../../EventRegistrar';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';

export default class StormFromSakkaku extends DrawCard {
    static id = 'storm-from-sakkaku';

    private eventRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([
            { [`${EventNames.OnResolveRingElement}:${AbilityTypes.WouldInterrupt}`]: 'cancelRingEffect' }
        ]);

        this.action({
            title: 'Move holding to another province',
            target: {
                location: Locations.Provinces,
                cardType: CardTypes.Province,
                controller: Players.Self,
                cardCondition: (card, context) =>
                    card.location !== context.source.location && card.location !== Locations.StrongholdProvince
            },
            gameAction: AbilityDsl.actions.moveCard((context) => ({
                target: context.source,
                destination: context.target.location
            })),
            then: {
                gameAction: AbilityDsl.actions.discardCard((context) => ({
                    target: this.otherHoldingsInSameProvince(context)
                })),
                message: 'The {1} {3}',
                messageArgs: (context: TriggeredAbilityContext<this>) => [
                    this.otherHoldingsInSameProvince(context).length > 0
                        ? 'is angry and discards the holdings that they find in the province'
                        : 'calms down'
                ]
            }
        });
    }

    private otherHoldingsInSameProvince(context: AbilityContext<this>): BaseCard[] {
        return (context.game.allCards as BaseCard[]).filter(
            (card) =>
                card.location === context.source.location &&
                card.controller === context.source.controller &&
                card.type === CardTypes.Holding &&
                !card.facedown &&
                card !== context.source
        );
    }

    public cancelRingEffect(event: any) {
        if (event.context.game.currentConflict && this.isInConflictProvince() && this.isFaceup() && !event.cancelled) {
            event.cancel();
            this.game.addMessage('{0} cancels the ring effect', this);
        }
    }
}