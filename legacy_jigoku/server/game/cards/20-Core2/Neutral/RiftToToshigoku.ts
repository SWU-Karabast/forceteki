import { Players, CardTypes, EventNames, AbilityTypes } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';
import { EventRegistrar } from '../../../EventRegistrar';

export default class RiftToToshigoku extends ProvinceCard {
    static id = 'rift-to-toshigoku';

    private eventRegistrar?: EventRegistrar;
    private shouldCancelRingEffectsHere?: boolean;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([
            {
                [EventNames.OnResolveRingElement + ':' + AbilityTypes.WouldInterrupt]: 'cancelRingEffect'
            }
        ]);

        this.reaction({
            title: 'Force opponent to remove all fate from a character and resolve the conflict',
            when: {
                onConflictDeclared: (event, context) => event.conflict.declaredProvince === context.source
            },
            cost: AbilityDsl.costs.breakSelf(),
            target: {
                activePromptTitle: 'Choose a character to discard',
                player: Players.Opponent,
                controller: Players.Opponent,
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isAttacking(),
                gameAction: AbilityDsl.actions.discardFromPlay()
            },
            then: (context) => {
                this.shouldCancelRingEffectsHere = true;
            }
        });
    }

    public cancelRingEffect(event: any) {
        if (
            event.context.game.currentConflict &&
            this.isConflictProvince() &&
            this.shouldCancelRingEffectsHere &&
            !event.cancelled
        ) {
            event.cancel();
            this.game.addMessage('{0} cancels the ring effect', this);
        }
    }
}
