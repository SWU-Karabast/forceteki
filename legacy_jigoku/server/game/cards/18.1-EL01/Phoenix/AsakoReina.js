const DrawCard = require('../../../drawcard.js');
const { CardTypes, Elements } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl.js');
const elementKeys = {
    air: 'asako-reina-air',
    earth: 'asako-reina-earth',
    fire: 'asako-reina-fire',
    water: 'asako-reina-water',
    void: 'asako-reina-void'
};

class AsakoReina extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Gain boons based based on your currently claimed rings',
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.gainHonor(context => ({
                    target: context.player,
                    amount: context.game.rings[this.getCurrentElementSymbol(elementKeys.air)].isConsideredClaimed(context.player) ? 1 : 0
                })),
                AbilityDsl.actions.draw(context => ({
                    target: context.player,
                    amount: context.game.rings[this.getCurrentElementSymbol(elementKeys.earth)].isConsideredClaimed(context.player) ? 1 : 0
                })),
                AbilityDsl.actions.gainFate(context => ({
                    target: context.player,
                    amount: context.game.rings[this.getCurrentElementSymbol(elementKeys.void)].isConsideredClaimed(context.player) ? 1 : 0
                })),
                AbilityDsl.actions.conditional({
                    condition: context => context.game.rings[this.getCurrentElementSymbol(elementKeys.water)].isConsideredClaimed(context.player),
                    trueGameAction: AbilityDsl.actions.selectCard(context => ({
                        activePromptTitle: 'Choose a 2 cost or lower character to ready',
                        cardCondition: card => card.costLessThan(3),
                        cardType: CardTypes.Character,
                        gameAction: AbilityDsl.actions.ready(),
                        targets: false,
                        message: '{0} chooses to ready {1} with {2}\'s effect',
                        messageArgs: (card, player) => [player, card, context.source]
                    })),
                    falseGameAction: AbilityDsl.actions.draw(() => ({ amount: 0 }))
                }),
                AbilityDsl.actions.conditional({
                    condition: context => context.game.rings[this.getCurrentElementSymbol(elementKeys.fire)].isConsideredClaimed(context.player),
                    trueGameAction: AbilityDsl.actions.selectCard(context => ({
                        activePromptTitle: 'Choose a character to honor',
                        cardType: CardTypes.Character,
                        gameAction: AbilityDsl.actions.honor(),
                        targets: false,
                        message: '{0} chooses to honor {1} with {2}\'s effect',
                        messageArgs: (card, player) => [player, card, context.source]
                    })),
                    falseGameAction: AbilityDsl.actions.draw(() => ({ amount: 0 }))
                })
            ]),
            effect: '{1}',
            effectArgs: context => [this.createEffectMessage(context)]
        });
    }

    createEffectMessage(context) {
        const strings = [];
        if(context.game.rings[this.getCurrentElementSymbol(elementKeys.air)].isConsideredClaimed(context.player)) {
            strings.push('gain 1 honor');
        }
        if(context.game.rings[this.getCurrentElementSymbol(elementKeys.earth)].isConsideredClaimed(context.player)) {
            strings.push('draw 1 card');
        }
        if(context.game.rings[this.getCurrentElementSymbol(elementKeys.void)].isConsideredClaimed(context.player)) {
            strings.push('gain 1 fate');
        }
        if(context.game.rings[this.getCurrentElementSymbol(elementKeys.fire)].isConsideredClaimed(context.player)) {
            strings.push('honor a character');
        }
        if(context.game.rings[this.getCurrentElementSymbol(elementKeys.water)].isConsideredClaimed(context.player)) {
            strings.push('ready a character');
        }

        if(strings.length <= 1) {
            return strings.join('');
        }
        const range = strings.splice(0, strings.length - 1);
        const last = strings[strings.length - 1];

        return `${range.join(', ')} and ${last}`;
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKeys.air,
            prettyName: '+1 honor',
            element: Elements.Air
        });
        symbols.push({
            key: elementKeys.earth,
            prettyName: 'draw a card',
            element: Elements.Earth
        });
        symbols.push({
            key: elementKeys.fire,
            prettyName: 'honor a character',
            element: Elements.Fire
        });

        symbols.push({
            key: elementKeys.water,
            prettyName: 'ready a 2 cost or less character',
            element: Elements.Water
        });

        symbols.push({
            key: elementKeys.void,
            prettyName: '+1 fate',
            element: Elements.Void
        });
        return symbols;
    }
}

AsakoReina.id = 'asako-reina';
module.exports = AsakoReina;
