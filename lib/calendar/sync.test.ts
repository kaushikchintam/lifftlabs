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
import { describe, expect, test } from "vitest";
import { calendar_v3 } from "googleapis";

function getEventTitle(event: calendar_v3.Schema$Event): string {
    return event.summary || "No Summary";
}

test('extracts the event title correctly', () => {
    const mockEvent: calendar_v3.Schema$Event = {
        summary: "Lifft meeting",
};

    const result = getEventTitle(mockEvent);
    expect(result).toBe("Lifft meeting");

});