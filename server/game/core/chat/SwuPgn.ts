import type { IPgnHeader, IPgnPlayerDecklist, IPgnReplayRecord, IStructureMarker } from './PgnTypes';

export class SwuPgn {
    /**
     * Formats a SET#NUM identifier: uppercases the set and zero-pads the number to 3 digits.
     */
    public static formatSetId(set: string, number: number): string {
        return `${set.toUpperCase()}#${String(number).padStart(3, '0')}`;
    }

    /**
     * Returns "Title, Subtitle" when subtitle is provided, or just "Title".
     */
    public static formatCardName(title: string, subtitle?: string): string {
        if (subtitle) {
            return `${title}, ${subtitle}`;
        }
        return title;
    }

    /**
     * Formats the PGN header block as chess-style [Tag "Value"] lines.
     * Required tags are always emitted; optional tags (format, rounds) are omitted when absent.
     */
    public static formatHeader(header: IPgnHeader): string {
        const lines: string[] = [
            `[Game "${header.game}"]`,
            `[Date "${header.date}"]`,
            `[Player1 "${header.player1}"]`,
            `[Player2 "${header.player2}"]`,
            `[P1Leader "${header.p1Leader}"]`,
            `[P1Base "${header.p1Base}"]`,
            `[P2Leader "${header.p2Leader}"]`,
            `[P2Base "${header.p2Base}"]`,
            `[Result "${header.result}"]`,
            `[Reason "${header.reason}"]`,
        ];

        if (header.format != null) {
            lines.push(`[Format "${header.format}"]`);
        }

        if (header.rounds != null) {
            lines.push(`[Rounds "${header.rounds}"]`);
        }

        return lines.join('\n');
    }

    /**
     * Formats deck cards sorted alphabetically with count prefix.
     */
    private static formatDeckCards(deck: IPgnPlayerDecklist['deck']): string[] {
        const sorted = [...deck].sort((a, b) => a.name.localeCompare(b.name));
        return sorted.map((entry) => `  ${entry.count}x ${entry.name} = ${entry.setId}`);
    }

    /**
     * Formats one player's decklist subsection.
     */
    private static formatPlayerDecklist(label: string, decklist: IPgnPlayerDecklist): string {
        const lines: string[] = [
            `\u2500\u2500 ${label} \u2500\u2500`,
            `Leader: ${decklist.leader.name} = ${decklist.leader.setId}`,
            `Base: ${decklist.base.name} = ${decklist.base.setId}`,
            'Deck:',
            ...SwuPgn.formatDeckCards(decklist.deck),
        ];

        if (decklist.sideboard && decklist.sideboard.length > 0) {
            lines.push('Sideboard:');
            lines.push(...SwuPgn.formatDeckCards(decklist.sideboard));
        }

        return lines.join('\n');
    }

    /**
     * Formats both player decklists under an ═══ CARD INDEX ═══ heading.
     */
    public static formatCardIndex(p1Decklist: IPgnPlayerDecklist, p2Decklist: IPgnPlayerDecklist): string {
        const sections: string[] = [
            '\u2550\u2550\u2550 CARD INDEX \u2550\u2550\u2550',
            SwuPgn.formatPlayerDecklist('P1 Decklist', p1Decklist),
            SwuPgn.formatPlayerDecklist('P2 Decklist', p2Decklist),
        ];
        return sections.join('\n');
    }

    /**
     * Formats the machine-readable replay data section as JSON-lines.
     */
    public static formatReplayData(records: IPgnReplayRecord[]): string {
        const lines = ['=== PARSEABLE ===', ...records.map((r) => JSON.stringify(r))];
        return lines.join('\n');
    }

    /**
     * Combines all sections into a complete .swupgn file string.
     * Section order: header, card index, freeform game log, parseable replay data.
     */
    public static formatFile(
        header: IPgnHeader,
        humanNotation: string,
        p1Decklist: IPgnPlayerDecklist,
        p2Decklist: IPgnPlayerDecklist,
        replayData: IPgnReplayRecord[]
    ): string {
        const sections = [
            SwuPgn.formatHeader(header),
            SwuPgn.formatCardIndex(p1Decklist, p2Decklist),
            '=== FREEFORM ===',
            humanNotation,
            SwuPgn.formatReplayData(replayData),
        ];
        return sections.join('\n\n');
    }

    /**
     * Flattens a serialized game message (mixed array of strings/numbers/objects) into plain text.
     * - plain strings and numbers are converted directly
     * - objects with title/subtitle become card names
     * - objects with name become the name
     * - alert objects { alert: { type, message } } recurse into message
     * - arrays are flattened recursively and concatenated
     */
    public static flattenMessage(message: any): string {
        if (message == null) {
            return '';
        }

        if (typeof message === 'string') {
            return message;
        }

        if (typeof message === 'number') {
            return String(message);
        }

        if (Array.isArray(message)) {
            return message.map((part) => SwuPgn.flattenMessage(part)).join('');
        }

        if (typeof message === 'object') {
            // Alert object
            if ('alert' in message && message.alert != null) {
                return SwuPgn.flattenMessage(message.alert.message);
            }

            // Card object with title (direct card reference)
            if ('title' in message && message.title != null) {
                return SwuPgn.formatCardName(message.title, message.subtitle);
            }

            // Card short summary object (from getShortSummary): has name + subtitle
            if ('name' in message && message.name != null && 'subtitle' in message && message.subtitle) {
                return SwuPgn.formatCardName(message.name, message.subtitle);
            }

            // Player or other named object (no subtitle)
            if ('name' in message && message.name != null) {
                return String(message.name);
            }
        }

        return '';
    }

    /**
     * Replaces real player names with P1/P2 in text.
     * Possessive forms (Player's) are replaced before plain names to avoid double substitution.
     */
    public static anonymizePlayers(text: string, player1Name: string, player2Name: string): string {
        const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let result = text;
        result = result.replace(new RegExp(`${escapeRegex(player1Name)}'s`, 'g'), "P1's");
        result = result.replace(new RegExp(`${escapeRegex(player2Name)}'s`, 'g'), "P2's");
        result = result.replace(new RegExp(escapeRegex(player1Name), 'g'), 'P1');
        result = result.replace(new RegExp(escapeRegex(player2Name), 'g'), 'P2');
        return result;
    }

    /**
     * Iterates game messages, skips player chat, flattens each to text, anonymizes, and joins with newlines.
     * Messages are ISerializedMessage objects with { date, message } structure.
     * When structureMarkers are provided, injects round/phase headers and action numbering.
     */
    public static generateHumanNotation(
        messages: any[],
        player1Name: string,
        player2Name: string,
        structureMarkers: IStructureMarker[] = []
    ): string {
        const lines: string[] = [];

        // Build map of messageIndex -> markers
        const markersByIndex = new Map<number, IStructureMarker[]>();
        for (const marker of structureMarkers) {
            const existing = markersByIndex.get(marker.messageIndex) ?? [];
            existing.push(marker);
            markersByIndex.set(marker.messageIndex, existing);
        }

        for (let i = 0; i < messages.length; i++) {
            const markers = markersByIndex.get(i);
            if (markers) {
                for (const marker of markers) {
                    if (marker.type === 'round') {
                        if (lines.length > 0) lines.push('');
                        lines.push(`\u2550\u2550\u2550 ROUND ${marker.round} \u2550\u2550\u2550`);
                        lines.push('');
                    } else if (marker.type === 'phase') {
                        if (lines.length > 0 && lines[lines.length - 1] !== '') lines.push('');
                        lines.push(`\u2500\u2500\u2500 ${marker.phase} \u2500\u2500\u2500`);
                    }
                }
            }

            const entry = messages[i];
            const messageContent = entry?.message ?? entry;

            // Skip player chat messages
            if (Array.isArray(messageContent) && messageContent.length > 0 && messageContent[0]?.type === 'playerChat') {
                continue;
            }

            const text = SwuPgn.flattenMessage(messageContent);
            if (!text) continue;

            let line = SwuPgn.anonymizePlayers(text, player1Name, player2Name);

            // Apply action numbering from markers
            if (markers) {
                const subEventMarker = markers.find((m) => m.type === 'subEvent');
                const actionMarker = markers.find((m) => m.type === 'action');

                if (subEventMarker && subEventMarker.actionNumber && subEventMarker.subEventLetter) {
                    line = `  ${subEventMarker.actionNumber}${subEventMarker.subEventLetter}. ${line}`;
                } else if (actionMarker && actionMarker.actionNumber) {
                    line = `${actionMarker.actionNumber}. ${line}`;
                }
            }

            lines.push(line);

            // Inject supplemental lines after the current message
            if (markers) {
                for (const marker of markers) {
                    if (marker.type === 'baseStatus' && marker.p1BaseHp != null && marker.p2BaseHp != null) {
                        lines.push(`  [Base Status] P1: ${marker.p1BaseHp}/${marker.p1BaseMaxHp} HP | P2: ${marker.p2BaseHp}/${marker.p2BaseMaxHp} HP`);
                    }
                    if (marker.type === 'drawnCards' && marker.drawnCards && marker.drawnCards.length > 0) {
                        lines.push(`  [Cards Drawn] ${marker.player}: ${marker.drawnCards.join(', ')}`);
                    }
                    if (marker.type === 'resourcedCard' && marker.resourcedCard) {
                        lines.push(`  [Card Resourced] ${marker.player}: ${marker.resourcedCard}`);
                    }
                }
            }
        }

        return lines.join('\n');
    }
}
