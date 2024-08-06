import { AbilityContext } from './AbilityContext';
import { PlayTypes } from './Constants';
import { PlayDisguisedCharacterAction, PlayDisguisedCharacterIntoLocation } from './PlayDisguisedCharacterAction';
import DrawCard = require('./drawcard');
import Player = require('./player');

export class PlayDisguisedCharacterAsIfFromHand extends PlayDisguisedCharacterAction {
    constructor(card: DrawCard) {
        super(card);
    }

    createContext(player: Player = this.card.controller) {
        const context = super.createContext(player);
        context.playType = PlayTypes.PlayFromHand;
        return context;
    }

    meetsRequirements(context: AbilityContext, ignoredRequirements: string[] = []) {
        let newIgnoredRequirements = ignoredRequirements.includes('location')
            ? ignoredRequirements
            : ignoredRequirements.concat('location');
        return super.meetsRequirements(context, newIgnoredRequirements);
    }
}

export class PlayDisguisedCharacterAsIfFromHandIntoConflict extends PlayDisguisedCharacterAction {
    constructor(card: DrawCard) {
        super(card, PlayDisguisedCharacterIntoLocation.Conflict);
    }

    createContext(player: Player = this.card.controller) {
        const context = super.createContext(player);
        context.playType = PlayTypes.PlayFromHand;
        return context;
    }

    meetsRequirements(context: AbilityContext, ignoredRequirements: string[] = []) {
        let newIgnoredRequirements = ignoredRequirements.includes('location')
            ? ignoredRequirements
            : ignoredRequirements.concat('location');
        return super.meetsRequirements(context, newIgnoredRequirements);
    }
}

export class PlayDisguisedCharacterAsIfFromHandAtHome extends PlayDisguisedCharacterAction {
    constructor(card: DrawCard) {
        super(card, PlayDisguisedCharacterIntoLocation.Home);
    }

    createContext(player: Player = this.card.controller) {
        const context = super.createContext(player);
        context.playType = PlayTypes.PlayFromHand;
        return context;
    }

    meetsRequirements(context: AbilityContext, ignoredRequirements: string[] = []) {
        let newIgnoredRequirements = ignoredRequirements.includes('location')
            ? ignoredRequirements
            : ignoredRequirements.concat('location');
        return super.meetsRequirements(context, newIgnoredRequirements);
    }
}
