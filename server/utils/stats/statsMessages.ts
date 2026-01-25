export interface IStatsMessageFormat {
    type: StatsSaveStatus;
    source: StatsSource;
    message: string;
}

export enum StatsSaveStatus {
    DoNotSend = 'DoNotSend',
    Warning = 'Warning',
    Error = 'Error',
    Success = 'Success',
}

export enum StatsSource {
    Karabast = 'Karabast',
    SwuStats = 'SWUStats',
    SwuBase = 'SWUBase'
}

export enum StatsMessageKey {
    DoNotSend = 'DoNotSend',
    DefaultErrorUpdatingStats = 'DefaultErrorUpdatingStats',
    DefaultErrorSendingStats = 'DefaultErrorSendingStats',
    NotUpdatedBeforeRound2 = 'NotUpdatedBeforeRound2',
    NonPremierNotSupported = 'NonPremierNotSupported',
    SavedDecksOnly = 'SavedDecksOnly',
    LoggedInOnly = 'LoggedInOnly',
    Success = 'Success',
    SwuBaseSuccess = 'SwuBaseSuccess',
    SwustatsSuccess = 'SwustatsSuccess',
    SwustatsDrawsNotSupported = 'SwustatsDrawsNotSupported',
}

export const StatsMessageText: Record<StatsMessageKey, Omit<IStatsMessageFormat, 'source'>> = {
    [StatsMessageKey.DoNotSend]: { message: '', type: StatsSaveStatus.DoNotSend },
    [StatsMessageKey.DefaultErrorUpdatingStats]: { message: 'an error occurred while updating stats', type: StatsSaveStatus.Error },
    [StatsMessageKey.DefaultErrorSendingStats]: { message: 'an error occurred while sending stats', type: StatsSaveStatus.Error },
    [StatsMessageKey.NotUpdatedBeforeRound2]: { message: 'stats not updated due to game ending before round 2', type: StatsSaveStatus.Warning },
    [StatsMessageKey.NonPremierNotSupported]: { message: 'stats update not supported for non-Premier formats', type: StatsSaveStatus.Warning },
    [StatsMessageKey.SavedDecksOnly]: { message: 'stats can only be updated for saved decks', type: StatsSaveStatus.Warning },
    [StatsMessageKey.LoggedInOnly]: { message: 'deck stats can only be saved for logged-in users', type: StatsSaveStatus.Warning },
    [StatsMessageKey.Success]: { message: 'deck stats successfully updated', type: StatsSaveStatus.Success },
    [StatsMessageKey.SwuBaseSuccess]: { message: 'successfully sent game result to SWUBase', type: StatsSaveStatus.Success },
    [StatsMessageKey.SwustatsSuccess]: { message: 'successfully sent game result to SWUStats', type: StatsSaveStatus.Success },
    [StatsMessageKey.SwustatsDrawsNotSupported]: { message: 'draws are currently not supported by SWUStats', type: StatsSaveStatus.Warning },
};

/**
 * Create a default "error by default" status for a given source
 */
export function createStatsMessage(
    source: StatsSource,
    key: StatsMessageKey = StatsMessageKey.DefaultErrorUpdatingStats
): IStatsMessageFormat {
    return {
        source,
        ...StatsMessageText[key],
    };
}

/**
 * Update the StatsMessage with new message and type
 */
export function updateStatsMessage(
    message: IStatsMessageFormat | null,
    key: StatsMessageKey | null,
): void {
    if (message === null) {
        return;
    }
    if (key === null) {
        key = StatsMessageKey.DoNotSend;
    }

    message.type = StatsMessageText[key].type;
    message.message = StatsMessageText[key].message;
}