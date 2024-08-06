import { CardTypes, Elements, Players } from '../../../Constants';
import { PlayCharacterAsAttachment } from '../../../PlayCharacterAsAttachment';
import PlayerEffect = require('../../../Effects/PlayerEffect');
import AbilityDsl = require('../../../abilitydsl');
import DrawCard = require('../../../drawcard');

const ELEMENT_KEY = 'jealous-ancestor-void';

export default class JealousAncestor extends DrawCard {
    static id = 'jealous-ancestor';

    public setupCardAbilities() {
        this.abilities.playActions.push(new PlayCharacterAsAttachment(this));

        this.whileAttached({ effect: AbilityDsl.effects.addTrait('shadowlands') });
        this.persistentEffect({
            condition: (context) => context.source.parent,
            effect: AbilityDsl.effects.immunity({ restricts: 'events' })
        });

        this.addAttachedEffectOnOpponent(
            AbilityDsl.effects.playerCannot({ cannot: 'draw', restricts: 'opponentsCardEffects' })
        );
        this.addAttachedEffectOnOpponent(AbilityDsl.effects.playerCannot({ cannot: 'move', restricts: 'toHand' }));
        this.addAttachedEffectOnOpponent(AbilityDsl.effects.playerCannot({ cannot: 'returnToHand' }));
    }

    public leavesPlay() {
        this.printedType = CardTypes.Character;
        super.leavesPlay();
    }

    public getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: ELEMENT_KEY,
            prettyName: 'Claimed Ring',
            element: Elements.Void
        });
        return symbols;
    }

    private addAttachedEffectOnOpponent(effect: (game: any, source: any, props: any) => PlayerEffect) {
        this.persistentEffect({
            condition: (context) =>
                context.source.parent &&
                context.source.parent.isParticipating() &&
                !this.game.rings[this.getCurrentElementSymbol(ELEMENT_KEY)].isConsideredClaimed(
                    context.source.parent.controller
                ),
            targetController: Players.Opponent,
            effect: effect
        });
    }
}
