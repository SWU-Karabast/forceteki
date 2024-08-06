import { AbilityContext } from './AbilityContext';
import { PlayTypes } from './Constants';
import { PlayCharacterAction, PlayCharacterIntoLocation } from './PlayCharacterAction';
import DrawCard = require('./drawcard');
import Player = require('./player');

export class PlayCharacterAsIfFromHand extends PlayCharacterAction {
    constructor(card: DrawCard) {
        super(card);
    }

    public createContext(player: Player = this.card.controller) {
        const context = super.createContext(player);
        context.playType = PlayTypes.PlayFromHand;
        return context;
    }

    public meetsRequirements(context: AbilityContext, ignoredRequirements: string[] = []) {
        const newIgnoredRequirements = ignoredRequirements.includes('location')
            ? ignoredRequirements
            : ignoredRequirements.concat('location');
        return super.meetsRequirements(context, newIgnoredRequirements);
    }
}

export class PlayCharacterAsIfFromHandIntoConflict extends PlayCharacterAction {
    constructor(card: DrawCard) {
        super(card, PlayCharacterIntoLocation.Conflict);
    }

    public createContext(player: Player = this.card.controller) {
        const context = super.createContext(player);
        context.playType = PlayTypes.PlayFromHand;
        return context;
    }

    public meetsRequirements(context: AbilityContext, ignoredRequirements: string[] = []) {
        const newIgnoredRequirements = ignoredRequirements.includes('location')
            ? ignoredRequirements
            : ignoredRequirements.concat('location');
        return super.meetsRequirements(context, newIgnoredRequirements);
    }
}

export class PlayCharacterAsIfFromHandAtHome extends PlayCharacterAction {
    constructor(card: DrawCard) {
        super(card, PlayCharacterIntoLocation.Home);
    }

    public createContext(player: Player = this.card.controller) {
        const context = super.createContext(player);
        context.playType = PlayTypes.PlayFromHand;
        return context;
    }

    public meetsRequirements(context: AbilityContext, ignoredRequirements: string[] = []) {
        const newIgnoredRequirements = ignoredRequirements.includes('location')
            ? ignoredRequirements
            : ignoredRequirements.concat('location');
        return super.meetsRequirements(context, newIgnoredRequirements);
    }
}
