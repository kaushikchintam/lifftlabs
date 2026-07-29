//Start with a pure function that takes an input and return an output without touching the database.
// Use the AAA pattern: 
//ARRANGE: Set up your variables and data. 
//ACT: Call the function under test with the arranged data.
//ASSERT: Check that the result matches the expected output. 
// Write a happy path test first, test that code works correctly under normal conditions. Then write edge case tests to cover unusual or extreme scenarios.
//SyncResult is a discriminated union type, so you can use type guards to check the mode and reason properties.
//mentorId is a string, so you can use any string value for testing. You can also use a mock or stub for the getCalendarClientForMentor function to simulate different scenarios.
//BlockerRow is an interface that represents a row in the blockers table. You can use any object that matches the shape of BlockerRow for testing. You can also use a mock or stub for the fetchAndStore function to simulate different scenarios.
/**
 * What it does? Defines a pure function that processes a single Google Calendar event. 
 * Inputs: It takes the unique database ID of the mentor, the raw evebt object from Google's API, and the mentor's specific calendar timezone string. 
 * Output: It returns a structured BlockerRow object ready for database entry, or null if the event shouldn't block the mentor's schedule.
 */
import { describe, it, expect, test } from "vitest";
import { calendar_v3 } from "googleapis";
import { mapEventToBlocker } from "./sync";

const mockEvent: calendar_v3.Schema$Event = {
    id: "evt-123",
    summary: "Lifft meeting",
    start: {
        dateTime: "2026-01-01T10:00:00z",
        timeZone: "Europe/London"
    },
    end: {
        dateTime: "2026-01-01T11:00:00z",
        timeZone: "Europe/London"
    },
};

test('builds the blocker range from event start/end', () => {
    const result = mapEventToBlocker("mentor-id", mockEvent, "Europe/London");
    expect(result?.google_event_id).toBe("evt-123");
    expect(result?.blocker_range).toBe("[2026-01-01T10:00:00z, 2026-01-01T11:00:00z)");
});

it('should return a BlockerRow object for a valid event', () => {

    const result = mapEventToBlocker("mentor-id", mockEvent, "Europe/London");
    expect(result).not.toBeNull();
});

it('should return null for a transparent event', () => {
    const transparentEvent: calendar_v3.Schema$Event = {
        ...mockEvent, 
        transparency: "transparent"
    }
    const result = mapEventToBlocker("mentor-id", transparentEvent, "Europe/London");

    expect(result).toBeNull();
});

it('should return null if the mentor has declined, even when they are not the first attendee in the list', () => {
    const declinedEvent: calendar_v3.Schema$Event = {
        ...mockEvent, 
        attendees: [
            { email: "stranger@example.com", responseStatus: "accepted"},
            { email: "mentor@example.com", self: true, responseStatus: "declined"}
        ]
    }

    const result = mapEventToBlocker("mentor-id", declinedEvent, "Europe/London");

    expect(result).toBeNull();
});

/**
 * "None marked as self" means Google Calendar API marks your own identity using the field self: true on an attendee object. 
 * If self: true is completely missing from the attendees array, it means the mentor is not an explicit participant listed 
 * on that event. The function needs to ignore any declines from other people because their schedules do not affect the mentor. 
 */
it('should return a BlockerRow object even if an attendee has declined, as long as none are marked as self', () => {
    const eventWithNoSelfAttendee: calendar_v3.Schema$Event = {
        ...mockEvent,
        attendees: [
            { email: "stranger@example.com", responseStatus: "accepted" },
            { email: "stranger1@example.com", responseStatus: "declined" }
        ]
    }

    const result = mapEventToBlocker("mentor-id", eventWithNoSelfAttendee, "Europe/London");

    expect(result).not.toBeNull();
});

const nonFilteredStatuses = ["needsAction", "tentative", "accepted"];

it.each(nonFilteredStatuses)(
    'should return a BlockerRow when the mentor response status is "%s"', 
    (status) => {
        const activeStatusEvent: calendar_v3.Schema$Event = {
            ...mockEvent, 
            attendees: [
                { email: "mentor@example.com", self: true, responseStatus: status }
            ]
        }; 

        const result = mapEventToBlocker("mentor-id", activeStatusEvent, "Europe/London");

        expect(result).not.toBeNull();
    }
);

it('should return null when the mentor has explicitly declined the event', () => {
   
    const declinedEvent: calendar_v3.Schema$Event = {
        ...mockEvent,
        attendees: [
            { email: "mentor@example.com", self: true, responseStatus: "declined" }
        ]
    };
    
    const result = mapEventToBlocker("mentor-id", declinedEvent, "America/Los_Angeles");

    expect(result).toBeNull();
});

describe('Advanced Date Mapping and Malinformed Input Edge Cases', () => {

    describe('All-Day (Date-Only) Events with Timezone Offsets', () => {

        it('should correctly map a date-only event using standard winter timezone offsets', () => {
            const winterAllDayEvent: calendar_v3.Schema$Event = {
                id: "mock-event-id",
                summary: "Winter All-Day",
                start: { date: "2026-01-15" },
                end: { date: "2026-01-16" }
            };

            const result = mapEventToBlocker("mentor-id", winterAllDayEvent, "Europe/London");

            expect(result).not.toBeNull();
            //Verify it sets exactly midnight GMT (UTC + 0) for London winter time
            expect(result?.blocker_range).toBe("[2026-01-15T00:00:00.000Z, 2026-01-16T00:00:00.000Z)");
        });
    });
    
    describe('Malinformed Event Inputs (Fallthrouh Control)', () => {

        it('should return null and not crash if both dateTime and date fields are completely missing', () => {
                    const completelyMalformedEvent: calendar_v3.Schema$Event = {
            summary: "Ghost Event",
            start: {}, 
            end: {}
        };

        const result = mapEventToBlocker("mentor-id", completelyMalformedEvent, "Europe/London");

        expect(result).toBeNull();
        });

        it('should return null if there is a mixed mismatch (start has dateTime but end only has date', () => {
            //Checks strict adherence to matching pairs
            const mismatchedEvent: calendar_v3.Schema$Event = {
                summary: "Lifft Event",
                start: { dateTime: "2026-01-15T10:00:00Z" },
                end: { date: "2026-01-16" }
            };

            const result = mapEventToBlocker("mentor-id", mismatchedEvent, "Europe/London");

            expect(result).toBeNull();
        });
    });
});

describe('Output Row Construction and Fallbacks', () => {

    it('should perfectly preserve complex Google Event ID strings during row construction', () => {
        const complexIdEvent: calendar_v3.Schema$Event = {
            ...mockEvent,
            id: "72mjq6b876rj4b9170rjebb76o_20260729T120000Z"
        };
        const result = mapEventToBlocker("mentor-id", complexIdEvent, "Europe/London");
        
        expect(result).not.toBeNull();
        expect(result?.google_event_id).toBe("72mjq6b876rj4b9170rjebb76o_20260729T120000Z");
    });

    it('should correctly round-trip lifft_session_id when extended properties are present', () => {
        const sessionEvent: calendar_v3.Schema$Event = {
            ...mockEvent,
            extendedProperties: {
                private: {
                    lifft_session_id: "session-uuid-val"
                }
            }
        };
        const result = mapEventToBlocker("mentor-id", sessionEvent, "Europe/London");
        
        expect(result).not.toBeNull();
        expect(result?.lifft_session_id).toBe("session-uuid-val");
    });

    it('should handle zero-duration events gracefully without crashing', () => {
        const zeroDurationEvent: calendar_v3.Schema$Event = {
            ...mockEvent,
            start: { dateTime: "2026-01-15T10:00:00Z" },
            end: { dateTime: "2026-01-15T10:00:00Z" } // start === end
        };
        const result = mapEventToBlocker("mentor-id", zeroDurationEvent, "Europe/London");
        
        expect(result).not.toBeNull();
        expect(result?.blocker_range).toBe("[2026-01-15T10:00:00Z, 2026-01-15T10:00:00Z)");
    });

    it('should return null and handle malformed missing configurations safely (Lines 214-216 fallthrough)', () => {
        const malformedEvent: calendar_v3.Schema$Event = {
            ...mockEvent,
            start: {}, // No dateTime, no date
            end: {}
        };
        const result = mapEventToBlocker("mentor-id", malformedEvent, "Europe/London");
        expect(result).toBeNull();
    });
});