//GET - single appintment detail (for both coach and client, with appropriate access control)
//PATCH - client can reschedule or cancel appointment (with appropriate time restrictions, e.g. no cancellations within 24 hours of session)
//DELETE - cancel appointment (e.g. by coach if client no-show, or by client if coach cancels session) with appropriate notifications sent to the other party